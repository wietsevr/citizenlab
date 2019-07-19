class WebApi::V1::TopicsController < ApplicationController
   before_action :set_topic, only: [:show, :update, :destroy]

   def index
     @topics = policy_scope(Topic)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
     @topics = @topics.order(created_at: :desc)

     render json: linked_json(@topics, WebApi::V1::TopicSerializer, params: fastjson_params)
   end

   def show
     render json: WebApi::V1::TopicSerializer.new(@topic, params: fastjson_params).serialized_json
   end

   private

   def set_topic
     @topic = Topic.find(params[:id])
     authorize @topic
   end

   def secure_controller?
     false
   end
end