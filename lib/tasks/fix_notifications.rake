namespace :fix_existing_tenants do
  desc "Delete new idea/initiative/comment for admin notifications"
  task :delete_admin_new_content_notifications => [:environment] do |t, args|
    failures = []
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        types = ["Notifications::NewIdeaForAdmin", "Notifications::NewCommentForAdmin", "Notifications::NewInitiativeForAdmin"]
        # We first have to clear the types of the removed notifications,
        # otherwise Rails will try to load the model subtype, try to
        # find the corresponding model and fail.
        Notification.where(type: types).update_all(type: nil)
        Notification.where('type IS NULL').destroy_all
      end
    end
  end
end