class SideFxModeratorService
  include SideFxHelper

  def after_create(moderator, project, current_user)
    LogActivityJob.set(wait: 5.seconds).perform_later(
      moderator, 'project_moderation_rights_given',
      current_user, Time.now.to_i,
      payload: { project_id: project.id }
    )
  end

  def after_destroy(moderator, _project, current_user)
    LogActivityJob.perform_later(
      moderator, 'project_moderation_rights_removed',
      current_user, Time.now.to_i
    )
  end
end

::SideFxModeratorService.prepend_if_ee('IdeaAssignment::Patches::SideFxModeratorService')
