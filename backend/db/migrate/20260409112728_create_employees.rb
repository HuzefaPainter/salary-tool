class CreateEmployees < ActiveRecord::Migration[8.0]
  def change
    create_table :employees do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :country
      t.string :job_title
      t.decimal :salary

      t.timestamps
    end
  end
end
