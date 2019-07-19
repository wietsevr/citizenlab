module EmailCampaigns
  class Campaigns::NewIdeaForAdmin < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def activity_triggers
      {'Notifications::NewIdeaForAdmin' => {'created' => true}}
    end

    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end