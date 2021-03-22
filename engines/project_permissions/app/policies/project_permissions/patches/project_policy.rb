# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module ProjectPolicy
      module Scope
        def resolve
          super
            .or resolve_for_normal_user_only
            .or resolve_for_project_moderator_only
        end

        private
        
        def resolve_for_visitors
          super.where(visible_to: 'public')
        end

        # Additional projects a logged-in user can see compared to a visitor (= non logged-in user).
        def resolve_for_normal_user_only
          return scope.none unless user

          scope.where("projects.visible_to = 'groups'")
               .where("EXISTS(SELECT 1 FROM groups_projects WHERE project_id = projects.id AND group_id IN (?))", user.group_ids)
        end

        def resolve_for_project_moderator_only
          scope.where(id: user&.moderatable_project_ids)
        end
      end

      module InverseScope
        def resolve
          if record.visible_to == 'public' && record.admin_publication.publication_status != 'draft'
            scope.all
          elsif record.visible_to == 'groups' && record.admin_publication.publication_status != 'draft'
            scope.in_any_group(record.groups).or(scope.admin).or(scope.project_moderator(record.id))
          else
            scope.admin.or(scope.project_moderator(record.id))
          end
        end
      end

      def shared_permitted_attributes
        super.unshift(:visible_to)
      end

      def moderate_for_active?
        super || (record.id && user.project_moderator?(record.id))
      end

      def show_to_non_moderators?
        return unless super

        project_public? ||
          (record.visible_to == 'groups' && user_belongs?(record.groups))
      end

      private

      def project_public?
        record.visible_to == 'public'
      end

      def user_belongs?(groups)
        return unless user

        (groups.ids & user.group_ids).present?
      end
    end
  end
end