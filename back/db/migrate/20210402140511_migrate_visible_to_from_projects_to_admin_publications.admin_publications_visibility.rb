class MigrateVisibleToFromProjectsToAdminPublications < ActiveRecord::Migration[6.0]
  def up
    Project.find_each do |project|
      project.admin_publication.update(visible_to: project.visible_to)
    end
  end

  def down
    AdminPublication.where(type: 'Project').find_each do |admin_publication|
      admin_publication.publication.update(visible_to: admin_publication.visible_to)
    end
  end
end
