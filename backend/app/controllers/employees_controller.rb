class EmployeesController < ApplicationController
  before_action :set_employee, only: [ :show ]

  def index
    @employees = Employee.page(params[:page]).per(10)
    render json: {
      employees: @employees,
      meta: {
        current_page: @employees.current_page,
        total_pages: @employees.total_pages,
        total_count: @employees.total_count,
        per_page: 10
      }
    }, status: :ok
  end

  def show
    render json: @employee, status: :ok
  end

  private

  def set_employee
    @employee = Employee.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Employee not found" }, status: :not_found
  end
end
