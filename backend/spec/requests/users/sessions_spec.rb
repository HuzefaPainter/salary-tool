require 'rails_helper'

RSpec.describe "Users::Sessions", type: :request do
  let!(:user) { create(:user, email: "john@example.com", password: "password123") }

  describe "POST /users/sign_in" do
    context "with valid credentials" do
      it "returns 200 and user data" do
        post "/users/sign_in", params: {
          user: { email: "john@example.com", password: "password123" }
        }, as: :json
        expect(response).to have_http_status(:ok)
        expect(json["message"]).to eq("Logged in successfully.")
        expect(json["user"]["email"]).to eq("john@example.com")
      end

      it "returns a JWT token in the Authorization header" do
        post "/users/sign_in", params: {
          user: { email: "john@example.com", password: "password123" }
        }, as: :json
        expect(response.headers["Authorization"]).to be_present
      end
    end

    context "with invalid credentials" do
      it "returns 401 with wrong password" do
        post "/users/sign_in", params: {
          user: { email: "john@example.com", password: "wrongpassword" }
        }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns 401 with wrong email" do
        post "/users/sign_in", params: {
          user: { email: "wrong@example.com", password: "password123" }
        }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /users/sign_out" do
    it "returns 200 and logs out successfully" do
      headers = auth_headers(user)
      delete "/users/sign_out", headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(json["message"]).to eq("Logged out successfully.")
    end

    it "invalidates the token after logout" do
      headers = auth_headers(user)
      delete "/users/sign_out", headers: headers, as: :json
      get "/health", headers: headers, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
