class EmployeesController < ApplicationController
  before_action :set_employee, only: [ :show, :update ]

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

  def create
    @employee = Employee.new(employee_params)
    if @employee.save
      render json: @employee, status: :created
    else
      render json: { errors: @employee.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @employee.update(employee_params)
      render json: @employee, status: :ok
    else
      render json: { errors: @employee.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_employee
    @employee = Employee.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Employee not found" }, status: :not_found
  end

  def employee_params
    params.require(:employee).permit(:first_name, :last_name, :email, :country, :job_title, :salary)
  end
end
