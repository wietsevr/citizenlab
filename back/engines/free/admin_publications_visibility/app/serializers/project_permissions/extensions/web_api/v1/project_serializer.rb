# frozen_string_literal: true

module AdminPublicationPermissions
  module Extensions
    module WebApi
      module V1
        module AdminPublicationSerializer
          def self.included(base)
            base.class_eval do
              attribute :visible_to, if: Proc.new { |object|
                object.admin_publication.respond_to?(:visible_to)
              } do |object|
                object.admin_publication.visible_to
              end
            end
          end
        end
      end
    end
  end
end
