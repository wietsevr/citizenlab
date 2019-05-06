class WebApi::V1::UserSerializer < ActiveModel::Serializer
  include Knock::Authenticable

  attributes :id, :first_name, :last_name, :slug, :locale, :avatar, :roles, :highest_role, :bio_multiloc, :registration_completed_at, :invite_status, :created_at, :updated_at
  attribute :email, if: :view_private_attributes?

  attribute :custom_field_values, if: :view_private_attributes?

  attribute :unread_notifications, if: :unread_notifications

  has_many :granted_permissions, serializer: WebApi::V1::PermissionSerializer


  def view_private_attributes?
    Pundit.policy!(current_user, object).view_private_attributes?
  end

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def unread_notifications
    # TODO Optimize this. The (rails cached, but still) query is executed
    # everytime the current_user is rendered, except if coming from the /me
    # endpoint
    instance_options[:unread_notifications] || (scope && scope.notifications.unread.count)
  end

  def granted_permissions
    @instance_options[:granted_permissions]
  end

end