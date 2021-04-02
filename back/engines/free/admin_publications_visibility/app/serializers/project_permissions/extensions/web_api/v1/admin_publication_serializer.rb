# frozen_string_literal: true

module ProjectPermissions
  module Extensions
    module WebApi
      module V1
        module AdminPublicationSerializer
          def self.included(base)
            base.class_eval do
              attributes :visible_to
            end
          end
        end
      end
    end
  end
end
