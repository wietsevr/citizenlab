module EmailCampaigns
  class Campaigns::CommentOnYourIdea < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::CommentOnYourIdea' => {'created' => true}}
    end
  end
end