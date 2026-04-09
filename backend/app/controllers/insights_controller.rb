class InsightsController < ApplicationController
  def salary_by_country
    render json: Employee.salary_insights_by_country, status: :ok
  end

  def salary_by_job_title
    render json: Employee.salary_insights_by_job_title, status: :ok
  end

  def top_paid_employees
    render json: Employee.top_paid_employees, status: :ok
  end

  def bottom_paid_employees
    render json: Employee.bottom_paid_employees, status: :ok
  end
end
