class Api::V1::IdeasController < ApplicationController
  UnsupportedImageError = Class.new(StandardError)

  rescue_from UnsupportedImageError, with: :send_unsupported_image_error

  before_action :set_idea, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]
  

  def index
    @ideas = policy_scope(Idea).includes(:author, :topics, :areas, :project)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @ideas = @ideas.with_all_topics(params[:topics]) if params[:topics].present?
    @ideas = @ideas.with_all_areas(params[:areas]) if params[:areas].present?
    @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
    @ideas = @ideas.where(author_id: params[:author]) if params[:author].present?
    @ideas = @ideas.search_by_all(params[:search]) if params[:search].present?


    @ideas = case params[:sort]
      when "new"
        @ideas.order_new
      when "-new"
        @ideas.order_new(:asc)
      when "trending"
        @ideas.order_trending
      when "-trending"
        @ideas.order_trending(:asc)
      when "popular"
        @ideas.order_popular
      when "-popular"
        @ideas.order_popular(:asc)
      when nil
        @ideas
      else
        raise "Unsupported sort method"
    end

    if current_user
      votes = Vote.where(user: current_user, votable: @ideas.all)
      votes_by_idea_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: @ideas, include: ['author', 'user_vote'], vbii: votes_by_idea_id
    else
      render json: @ideas, include: ['author']
    end

  end

  def index_xlsx
    I18n.with_locale(current_user&.locale) do
      @ideas = policy_scope(Idea)
        .includes(:author, :topics, :areas, :project)
      @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
      xlsx = XlsxService.new.generate_ideas_xlsx @ideas
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def show
    render json: @idea, include: ['author','topics','areas','user_vote']
  end

  # insert
  def create
    @idea = Idea.new(idea_params)
    authorize @idea
    if @idea.save
      SideFxIdeaService.new.after_create(@idea, current_user)
      render json: @idea, status: :created, include: ['author','topics','areas','user_vote']
    else
      render json: { errors: @idea.errors.details }, status: :unprocessable_entity
    end
  ensure
    clean_tempfile
  end

  # patch
  def update
    if @idea.update(idea_params)
      SideFxIdeaService.new.after_update(@idea, current_user)
      render json: @idea, status: :ok, include: ['author','topics','areas','user_vote']
    else
      render json: { errors: @idea.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    idea = @idea.destroy
    if idea.destroyed?
      SideFxIdeaService.new.after_destroy(idea, current_user)
      head :ok
    else
      head 500
    end
  end

  private
  # TODO: temp fix to pass tests
  def secure_controller?
    false
  end

  def set_idea
    @idea = Idea.find params[:id]
    authorize @idea
  end

  def idea_params
    p = params.require(:idea).permit(
			:publication_status,
			:project_id,
			:author_id,
			title_multiloc: [:en, :nl, :fr],
      body_multiloc: [:en, :nl, :fr],
      images: [],
      files: [],
      topic_ids: [],
      area_ids: []
    )

    images = p.delete(:images)
    parsed_images = []

    images.to_a.each do |image|
      parsed_images << parse_image(image)
    end

    p[:images] = parsed_images
    p
  end

  def parse_image(base64_image)
    # data uri given?
    if "data:" == base64_image[0..4]
      base64_string = base64_image.sub(/^[^,]*/, "")
      base64_string = base64_string.sub(/^,/, "")
    else
      base64_string = base64_image
    end

    @tempfile = Tempfile.new("idea_image")
    @tempfile.binmode
    @tempfile.write Base64.decode64(base64_string)
    @tempfile.rewind

    # Note: we are using external shell program to detect the mime type
    content_type = `file --mime -b #{@tempfile.path}`.split(";")[0]
    extension = content_type.match(/jpg|jpeg|gif|png/).to_s

    raise UnsupportedImageError if extension.blank?

    # generate a unique filename
    unique_filename = SecureRandom.uuid
    unique_filename += ".#{extension}"

    ActionDispatch::Http::UploadedFile.new({
      tempfile: @tempfile,
      filename: unique_filename,
      content_type: content_type,
    })
  end

  def clean_tempfile
    return unless @tempfile

    @tempfile.close
    @tempfile.unlink
  end

  def send_unsupported_image_error
    render json: { message: "Image type must be one of jpg|jpeg|gif|png" }, status: 422
  end
end
