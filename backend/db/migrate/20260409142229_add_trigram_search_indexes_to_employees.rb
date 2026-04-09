class AddTrigramSearchIndexesToEmployees < ActiveRecord::Migration[8.0]
  def up
    execute "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
    add_index :employees, :first_name, using: :gin, opclass: :gin_trgm_ops
    add_index :employees, :last_name, using: :gin, opclass: :gin_trgm_ops
    add_index :employees, :email, using: :gin, opclass: :gin_trgm_ops
  end

  def down
    remove_index :employees, :first_name
    remove_index :employees, :last_name
    remove_index :employees, :email
    execute "DROP EXTENSION IF EXISTS pg_trgm;"
  end
end
