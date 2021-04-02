class RemoveVisibleToFromProjects < ActiveRecord::Migration[6.0]
  def change
    remove_column :projects, :visible_to, :string
  end
end
