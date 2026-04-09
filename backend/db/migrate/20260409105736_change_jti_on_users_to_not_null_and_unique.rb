class ChangeJtiOnUsersToNotNullAndUnique < ActiveRecord::Migration[8.0]
  def change
    change_column_null :users, :jti, false
    change_column_default :users, :jti, from: nil, to: ""
  end
end
