class TrackEventJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def run activity
    tenant = nil

    begin
      tenant = Tenant.current
      if tenant
        if tenant.feature_activated?('intercom')
          intercom_service = TrackIntercomService.new()
          intercom_service.track(activity, tenant)
        end
        if tenant.feature_activated?('segment')
          segment_service = TrackSegmentService.new()
          segment_service.track(activity, tenant)
        end
      end
    rescue ActiveRecord::RecordNotFound => e
    end
  end
end