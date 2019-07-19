class WebApi::V1::ActivitiesController < ApplicationController
  before_action :set_idea
  skip_after_action :verify_policy_scoped

  def index
    @activities = policy_scope(Activity).where(
      item: @idea,
      action: ['published', 'changed_status', 'changed_title', 'changed_body']
    )
      .includes(:user)
      .order(acted_at: :desc)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(
      @activities, 
      WebApi::V1::ActivitySerializer, 
      params: fastjson_params,
      include: [:user]
      )
  end


  private

  def set_idea
     @idea = Idea.find(params[:idea_id])
     authorize @idea, :get_activities?
   end

  def secure_controller?
    false
  end
end