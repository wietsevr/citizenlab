# frozen_string_literal: true

module MultiTenancy
  class SideFxTenantService
    include SideFxHelper

    def before_create(tenant, current_user = nil) end

    def after_create(tenant, current_user = nil)
      LogActivityJob.perform_later(tenant, 'created', current_user, tenant.created_at.to_i)
    end

    def after_apply_template(tenant, current_user = nil)
      tenant.switch do 
        EmailCampaigns::AssureCampaignsService.new.assure_campaigns # fix campaigns
        PermissionsService.new.update_all_permissions # fix permissions
        track_tenant_async(tenant)
      end
    ensure
      LogActivityJob.perform_later(tenant, 'template_loaded', current_user, tenant.created_at.to_i)
    end

    def before_update(tenant, current_user = nil) end

    def after_update(tenant, current_user = nil)
      LogActivityJob.perform_later(tenant, 'changed', current_user, tenant.updated_at.to_i)

      if tenant.host_previously_changed?
        LogActivityJob.perform_later(tenant, 'changed_host', current_user, tenant.updated_at.to_i, payload: { changes: tenant.host_previous_change })
      end

      track_tenant_async(tenant)
    end

    def before_destroy(tenant, current_user = nil)
      tenant.switch { Surveys::TypeformWebhookManager.new.delete_all_webhooks }
    end

    def after_destroy(frozen_tenant, current_user = nil)
      serialized_tenant = clean_time_attributes(frozen_tenant.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_tenant), 'deleted', current_user, Time.now.to_i, payload: { tenant: serialized_tenant })
    end

    private

    # @param [Tenant] tenant
    def track_tenant_async(tenant)
      tenant.switch { TrackTenantJob.perform_later(tenant) }
    end
  end
end 