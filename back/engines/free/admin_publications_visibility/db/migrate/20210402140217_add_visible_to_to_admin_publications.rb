class AddVisibleToToAdminPublications < ActiveRecord::Migration[6.0]
  def change
    add_column :admin_publications, :visible_to, :string, default: 'public', null: false
  end
end
