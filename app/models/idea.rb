class Idea < ApplicationRecord
  include PgSearch

  MAX_TITLE_LEN = 80

  pg_search_scope :search_by_all, 
    :against => [:title_multiloc, :body_multiloc, :author_name],
    :using => { :tsearch => {:prefix => true} }

  belongs_to :project, touch: true
  counter_culture :project, 
    column_name: proc {|idea| idea.publication_status == 'published' ? "ideas_count" : nil},
    column_names: {
      ["ideas.publication_status = ?", 'published'] => 'ideas_count'
    },
    touch: true
  counter_culture :project, 
    column_name: 'comments_count', 
    delta_magnitude: proc { |idea| idea.comments_count }

  belongs_to :author, class_name: 'User', optional: true
  belongs_to :assignee, class_name: 'User', optional: true

  has_many :ideas_topics, dependent: :destroy
  has_many :topics, through: :ideas_topics
  has_many :areas_ideas, dependent: :destroy
  has_many :areas, through: :areas_ideas
  has_many :ideas_phases, dependent: :destroy
  has_many :phases, through: :ideas_phases
  has_many :baskets_ideas, dependent: :destroy
  has_many :baskets, through: :baskets_ideas

  has_many :comments, dependent: :destroy
  has_many :official_feedbacks, dependent: :destroy
  has_many :votes, as: :votable, dependent: :destroy
  has_many :upvotes, -> { where(mode: "up") }, as: :votable, class_name: 'Vote'
  has_many :downvotes, -> { where(mode: "down") }, as: :votable, class_name: 'Vote'
  has_one :user_vote, -> (user_id) {where(user_id: user_id)}, as: :votable, class_name: 'Vote'
  belongs_to :idea_status
  has_many :notifications, foreign_key: :idea_id, dependent: :nullify
  has_many :activities, as: :item

  has_many :idea_images, -> { order(:ordering) }, dependent: :destroy
  has_many :idea_files, -> { order(:ordering) }, dependent: :destroy
  has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy
  has_one :idea_trending_info

  PUBLICATION_STATUSES = %w(draft published closed spam)
  validates :project, presence: true, unless: :draft?
  validates :title_multiloc, presence: true, multiloc: {presence: true, length: {maximum: MAX_TITLE_LEN}}
  validates :body_multiloc, presence: true, multiloc: {presence: true}, unless: :draft?
  validates :publication_status, presence: true, inclusion: {in: PUBLICATION_STATUSES}
  validates :author, presence: true, unless: :draft?, on: :create
  validates :author_name, presence: true, unless: :draft?, on: :create
  validates :idea_status, presence: true, unless: :draft?
  validates :slug, uniqueness: true, format: {with: SlugService.new.regex }
  validate :assignee_can_moderate_project, unless: :draft?

  before_validation :generate_slug, on: :create
  before_validation :set_author_name
  before_validation :set_idea_status, on: :create
  before_validation :sanitize_body_multiloc, if: :body_multiloc
  before_validation :strip_title
  after_validation :set_published_at, if: ->(idea){ idea.published? && idea.publication_status_changed? }
  after_update :fix_comments_count_on_projects

  scope :with_all_topics, (Proc.new do |topic_ids|
    uniq_topic_ids = topic_ids.uniq
    joins(:ideas_topics)
    .where(ideas_topics: {topic_id: uniq_topic_ids})
    .group(:id).having("COUNT(*) = ?", uniq_topic_ids.size)
  end)

  scope :with_some_topics, (Proc.new do |topic_ids|
    joins(:ideas_topics)
      .where(ideas_topics: {topic_id: topic_ids})
  end)

  scope :with_all_areas, (Proc.new do |area_ids|
    uniq_area_ids = area_ids.uniq
    joins(:areas_ideas)
    .where(areas_ideas: {area_id: uniq_area_ids})
    .group(:id).having("COUNT(*) = ?", uniq_area_ids.size)
  end)

  scope :with_some_areas, (Proc.new do |area_ids|
    joins(:areas_ideas)
      .where(areas_ideas: {area_id: area_ids})
  end)

  scope :in_phase, (Proc.new do |phase_id|
    joins(:ideas_phases)
      .where(ideas_phases: {phase_id: phase_id})
  end)

  scope :with_project_publication_status, (Proc.new do |publication_status|
    joins(:project)
      .where(projects: {publication_status: publication_status})
  end)

  scope :with_bounding_box, (Proc.new do |coordinates|
    x1,y1,x2,y2 = eval(coordinates)
    where("ST_Intersects(ST_MakeEnvelope(?, ?, ?, ?), location_point)", x1, y1, x2, y2)
  end)

  scope :order_new, -> (direction=:desc) {order(published_at: direction)}
  scope :order_popular, -> (direction=:desc) {order(Arel.sql("(upvotes_count - downvotes_count) #{direction}"))}
  # based on https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d

  scope :order_status, -> (direction=:desc) {
    joins(:idea_status)
    .order("idea_statuses.ordering #{direction}")
  }

  scope :order_random, -> {
    modulus = RandomOrderingService.new.modulus_of_the_day
    order("(extract(epoch from ideas.created_at) * 100)::bigint % #{modulus}")
  }

  scope :published, -> {where publication_status: 'published'}

  scope :feedback_needed, -> {
    joins(:idea_status).where(idea_statuses: {code: 'proposed'})
      .where('ideas.id NOT IN (SELECT DISTINCT(idea_id) FROM official_feedbacks)')
  }


  def location_point_geojson
    RGeo::GeoJSON.encode(location_point) if location_point.present?
  end

  def location_point_geojson= geojson_point
    self.location_point = RGeo::GeoJSON.decode(geojson_point)
  end

  def draft?
    self.publication_status == 'draft'
  end

  def published?
    self.publication_status == 'published'
  end

  def score 
    upvotes_count - downvotes_count
  end

  
  private

  def generate_slug
    if !self.slug
      title = MultilocService.new.t self.title_multiloc, self.author
      self.slug = SlugService.new.generate_slug self, title
    end
  end

  def set_author_name
    self.author_name ||= self.author.display_name if self.author
  end

  def set_idea_status
    self.idea_status ||= IdeaStatus.find_by!(code: 'proposed')
  end

  def set_published_at
    self.published_at ||= Time.now
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      self.body_multiloc,
      %i{title alignment list decoration link}
    )
    self.body_multiloc = service.remove_empty_paragraphs_multiloc(self.body_multiloc)
    self.body_multiloc = service.linkify_multiloc(self.body_multiloc)
  end

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

  def assignee_can_moderate_project
    if self.assignee && self.project &&
      !ProjectPolicy.new(self.assignee, self.project).moderate?
      self.errors.add(
        :assignee_id,
        :assignee_can_not_moderate_project,
        message: 'The assignee can not moderate the project of this idea'
      )
    end
  end

  def fix_comments_count_on_projects
    if project_id_previously_changed?
      Comment.counter_culture_fix_counts only: [[:idea, :project]]
    end
  end

end