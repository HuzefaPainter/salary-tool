class EmployeesController < ApplicationController
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
end
