class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def sign_up(resource_name, resource)
    sign_in(resource_name, resource, store: false, bypass: false)
  end

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        message: "Signed up successfully.",
        user: user_data(resource)
      }, status: :created
    else
      render json: {
        message: "Signup failed.",
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def user_data(resource)
    { id: resource.id, name: resource.name, email: resource.email }
  end
end
