# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module AdminPublicationsVisibility
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'admin_publications_visibility'
    end

    def self.feature_title
      'Admin Publications Visibility'
    end

    def self.feature_description
      'Admin can make publications visible only to certain groups of users (e.g., admin only, smart groups).'
    end
  end
end
