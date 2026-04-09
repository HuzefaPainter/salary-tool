class AdminController < ApplicationController
  def reset_data
    Employee.delete_all

    seeds_dir = Rails.root.join("db", "seeds")
    first_names = File.readlines(seeds_dir.join("first_names.txt")).map(&:strip).reject(&:empty?)
    last_names  = File.readlines(seeds_dir.join("last_names.txt")).map(&:strip).reject(&:empty?)
    countries   = File.readlines(seeds_dir.join("countries.txt")).map(&:strip).reject(&:empty?)
    job_titles  = File.readlines(seeds_dir.join("job_titles.txt")).map(&:strip).reject(&:empty?)

    employees = 10_000.times.map do
      first_name = first_names.sample
      last_name  = last_names.sample
      {
        first_name: first_name,
        last_name:  last_name,
        email:      "#{first_name.downcase}.#{last_name.downcase}.#{SecureRandom.hex(4)}@organization.org",
        country:    countries.sample,
        job_title:  job_titles.sample,
        salary:     rand(30_000..500_000),
        created_at: Time.current,
        updated_at: Time.current
      }
    end

    Employee.insert_all(employees)
    render json: { message: "Data reset successfully. #{Employee.count} employees seeded." }, status: :ok
  end
end
