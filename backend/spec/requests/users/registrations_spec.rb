require 'rails_helper'

RSpec.describe "Users::Registrations", type: :request do
  describe "POST /users/sign_up" do
    context "with valid params" do
      let(:valid_params) do
        {
          user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }
      end

      it "returns 201 and creates the user" do
        post "/users/sign_up", params: valid_params, as: :json
        puts json
        expect(response).to have_http_status(:created)
        expect(json["message"]).to eq("Signed up successfully.")
        expect(json["user"]["email"]).to eq("john@example.com")
        expect(json["user"]["name"]).to eq("John Doe")
      end

      it "returns a JWT token in the Authorization header" do
        post "/users/sign_up", params: valid_params, as: :json
        expect(response.headers["Authorization"]).to be_present
      end
    end

    context "with invalid params" do
      it "returns 422 when email is missing" do
        post "/users/sign_up", params: {
          user: { name: "John", password: "password123" }
        }, as: :json
        expect(response).to have_http_status(:unprocessable_content)
        expect(json["errors"]).to be_present
      end

      it "returns 422 when name is missing" do
        post "/users/sign_up", params: {
          user: { email: "john@example.com", password: "password123" }
        }, as: :json
        expect(response).to have_http_status(:unprocessable_content)
        expect(json["errors"]).to include("Name can't be blank")
      end

      it "returns 422 when email is already taken" do
        create(:user, email: "john@example.com")
        post "/users/sign_up", params: {
          user: {
            name: "John",
            email: "john@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json
        expect(response).to have_http_status(:unprocessable_content)
        expect(json["errors"]).to include("Email has already been taken")
      end
    end
  end
end
