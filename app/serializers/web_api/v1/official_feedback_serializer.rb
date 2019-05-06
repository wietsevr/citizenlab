class WebApi::V1::OfficialFeedbackSerializer < ActiveModel::Serializer
  attributes :id, :body_multiloc, :author_multiloc, :created_at, :updated_at

  belongs_to :idea
  belongs_to :user

end