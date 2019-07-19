namespace :cl2_back do
  desc "Create a tenant with given host and optional template"
  task :create_tenant, [:host,:template] => [:environment] do |t, args|
    host = args[:host] || raise("Please provide the 'host' arg")
    tenant_template = args[:template] || 'e2etests_template'

    Tenant.find_by(host: host)&.destroy!

    tenant = Tenant.create!({
      name: host,
      host: host,
      logo: Rails.root.join("spec/fixtures/logo.png").open,
      header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
      settings: {
        core: {
          allowed: true,
          enabled: true,
          locales: ['en-GB','nl-BE'],
          organization_type: 'medium_city',
          organization_name: {
            "en-GB" => 'Wonderville',
            "nl-BE" => 'Mirakelgem',
          },
          timezone: "Europe/Brussels",
          currency: 'EUR',
          color_main: '#163A7D',
          color_secondary: '#CF4040',
          color_text: '#163A7D',
          signup_helper_text: {
            en: 'If you don\'t want to register, use hello@citizenlab.co/democrazy as email/password'
          }
        },
        groups: {
          enabled: true,
          allowed:true
        },
        private_projects: {
          enabled: true,
          allowed: true
        },
        manual_project_sorting: {
          enabled: true,
          allowed: true
        },
        user_custom_fields: {
          enabled: true,
          allowed: true
        },
        clustering: {
          enabled: true,
          allowed: true
        },
        widgets: {
          enabled: true,
          allowed: true
        },
        manual_emailing: {
          enabled: true,
          allowed: true
        },
        automated_emailing_control: {
          enabled: true,
          allowed: true
        },
        granular_permissions: {
          enabled: true,
          allowed: true
        },
        password_login: {
          enabled: true,
          allowed: true
        },
        participatory_budgeting: {
          enabled: true,
          allowed: true
        },
        similar_ideas: {
          enabled: true,
          allowed: true
        },
        geographic_dashboard: {
          enabled: true,
          allowed: true
        },
        surveys: {
          enabled: true,
          allowed: true
        },
        typeform_surveys: {
          enabled: true,
          allowed: true
        },
        google_forms_surveys: {
          enabled: true,
          allowed: true
        },
        surveymonkey_surveys: {
          enabled: true,
          allowed: true
        },
        initiatives: {
          enabled: true,
          allowed: true,
          voting_threshold: 300,
          days_limit: 90,
          threshold_reached_message: MultilocService.new.i18n_to_multiloc(
            'initiatives.default_threshold_reached_message',
            locales: CL2_SUPPORTED_LOCALES
          ),
          eligibility_criteria: MultilocService.new.i18n_to_multiloc(
            'initiatives.default_eligibility_criteria',
            locales: CL2_SUPPORTED_LOCALES
          ),
          success_stories: [
            {
              "page_slug": "success_story_1",
              "location": Faker::Address.city,
              "image_url": "https://www.quebecoriginal.com/en/listing/images/800x600/7fd3e9f7-aec9-4966-9751-bc0a1ab56127/parc-des-deux-rivieres-parc-des-deux-rivieres-en-ete.jpg",
            },
            {
              "page_slug": "success_story_2",
              "location": Faker::Address.city,
              "image_url": "https://www.washingtonpost.com/resizer/I9IJifRLgy3uHVKcwZlvdjUBirc=/1484x0/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZQIB4NHDUMI6RKZMWMO42U6KNM.jpg",
            },
            {
              "page_slug": "success_story_3",
              "location": Faker::Address.city,
              "image_url": "http://upthehillandthroughthewoods.files.wordpress.com/2012/12/1____image.jpg",
            }
          ]
        }
      }
    })


    Apartment::Tenant.switch tenant.schema_name do
      TenantTemplateService.new.resolve_and_apply_template tenant_template, external_subfolder: 'release'
      User.create(
        roles: [{type: 'admin'}],
        first_name: 'Citizen',
        last_name: 'Lab',
        email: 'hello@citizenlab.co',
        password: 'democrazy',
        locale: tenant.settings.dig('core', 'locales')&.first || 'en',
        registration_completed_at: Time.now
      )
    end


    SideFxTenantService.new.after_apply_template(tenant, nil)
    SideFxTenantService.new.after_create(tenant, nil)

  end
end