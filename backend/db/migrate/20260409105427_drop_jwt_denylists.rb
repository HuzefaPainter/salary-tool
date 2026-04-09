class DropJwtDenylists < ActiveRecord::Migration[8.0]
  def change
    drop_table :jwt_denylists
  end
end
