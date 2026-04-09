class Employee < ApplicationRecord
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :country, presence: true
  validates :job_title, presence: true
  validates :salary, presence: true, numericality: { greater_than: 0 }

  def self.salary_insights_by_country
    select("country, AVG(salary) as average_salary, MIN(salary) as min_salary, MAX(salary) as max_salary, COUNT(*) as employee_count")
      .group(:country)
      .map do |r|
        {
          "country"        => r.country,
          "average_salary" => r.average_salary,
          "min_salary"     => r.min_salary,
          "max_salary"     => r.max_salary,
          "employee_count" => r.employee_count
        }
      end
  end

  def self.salary_insights_by_job_title
    select("job_title, AVG(salary) as average_salary, MIN(salary) as min_salary, MAX(salary) as max_salary, COUNT(*) as employee_count")
      .group(:job_title)
      .map do |r|
        {
          "job_title"      => r.job_title,
          "average_salary" => r.average_salary,
          "min_salary"     => r.min_salary,
          "max_salary"     => r.max_salary,
          "employee_count" => r.employee_count
        }
      end
  end

  def self.top_paid_employees
    order(salary: :desc).limit(10)
  end

  def self.bottom_paid_employees
    order(salary: :asc).limit(10)
  end
end
