class WebApi::V1::InitiativeSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :body_multiloc, :author_name, :slug, :publication_status, :upvotes_count, :comments_count, :official_feedbacks_count, :location_point_geojson, :location_description, :created_at, :updated_at, :published_at, :expires_at, :votes_needed

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  has_many :initiative_images, serializer: WebApi::V1::ImageSerializer
  has_many :topics
  has_many :areas

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :initiative_status
  belongs_to :assignee, if: Proc.new { |object, params|
    can_moderate? object, params
  }, record_type: :user, serializer: WebApi::V1::UserSerializer

  has_one :user_vote, if: Proc.new { |object, params|
    signed_in? object, params
  }, record_type: :vote, serializer: WebApi::V1::VoteSerializer do |object, params|
    cached_user_vote object, params
  end


 

  def self.can_moderate? object, params
    InitiativePolicy.new(current_user(params), object).moderate?
  end

  def self.cached_user_vote object, params
    if params[:vbii]
      params.dig(:vbii, object.id)
    else
       object.votes.where(user_id: current_user(params)&.id).first
     end
  end
end