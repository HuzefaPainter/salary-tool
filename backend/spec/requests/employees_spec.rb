require 'rails_helper'

RSpec.describe "Employees", type: :request do
  let!(:user) { create(:user) }

  describe "GET /employees" do
    before { create_list(:employee, 25) }
    it "returns a paginated list of employees" do
      get "/employees", headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns 10 employees per page by default" do
      get "/employees", headers: auth_headers(user), as: :json
      expect(json["employees"].length).to eq(10)
    end

    it "returns pagination metadata" do
      get "/employees", headers: auth_headers(user), as: :json
      expect(json["meta"]["current_page"]).to eq(1)
      expect(json["meta"]["total_pages"]).to eq(3)
      expect(json["meta"]["total_count"]).to eq(25)
      expect(json["meta"]["per_page"]).to eq(10)
    end

    it "returns the correct page when page param is provided" do
      headers = auth_headers(user)
      get "/employees", params: { page: 2 }, headers: headers
      expect(json["employees"].length).to eq(10)
      expect(json["meta"]["current_page"]).to eq(2)
    end

    it "returns 401 for unauthenticated requests" do
      get "/employees", as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
