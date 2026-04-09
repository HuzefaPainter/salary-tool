require 'rails_helper'

RSpec.describe "Employees", type: :request do
  let!(:user) { create(:user) }

  describe "GET /employees" do
    context "pagination" do
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
    end

    it "returns 401 for unauthenticated requests" do
      get "/employees", as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    describe "search" do
      before do
        create(:employee, first_name: "John", last_name: "Smith", email: "john.smith@organization.org")
        create(:employee, first_name: "Jane", last_name: "Doe", email: "jane.doe@organization.org")
        create(:employee, first_name: "Bob", last_name: "Johnson", email: "bob.johnson@organization.org")
      end

      it "returns employees matching by first_name" do
        get "/employees", params: { search: "Jane" }, headers: auth_headers(user)
        expect(json["employees"].length).to eq(1)
        expect(json["employees"].first["first_name"]).to eq("Jane")
      end

      it "returns employees matching by last_name" do
        get "/employees", params: { search: "Johnson" }, headers: auth_headers(user)
        expect(json["employees"].length).to eq(1)
        expect(json["employees"].first["last_name"]).to eq("Johnson")
      end

      it "returns employees matching by email" do
        get "/employees", params: { search: "jane.doe" }, headers: auth_headers(user)
        expect(json["employees"].length).to eq(1)
        expect(json["employees"].first["email"]).to eq("jane.doe@organization.org")
      end

      it "returns all matches across fields" do
        get "/employees", params: { search: "john" }, headers: auth_headers(user)
        # matches John Smith (first_name) and Bob Johnson (last_name)
        expect(json["employees"].length).to eq(2)
      end

      it "returns all employees when search is blank" do
        get "/employees", params: { search: "" }, headers: auth_headers(user)
        expect(json["meta"]["total_count"]).to eq(3)
      end

      it "returns empty when no match" do
        get "/employees", params: { search: "nonexistent" }, headers: auth_headers(user)
        expect(json["employees"]).to be_empty
      end

      it "returns paginated search results" do
        15.times { |i| create(:employee, first_name: "Searchable", email: "searchable#{i}@organization.org") }
        get "/employees", params: { search: "Searchable", page: 1 }, headers: auth_headers(user)
        expect(json["employees"].length).to eq(10)
        expect(json["meta"]["total_count"]).to eq(15)
      end
    end
  end

  describe "GET /employees/:id" do
    let!(:employee) { create(:employee) }

    context "when authenticated" do
      it "returns the employee" do
        get "/employees/#{employee.id}", headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:ok)
        expect(json["id"]).to eq(employee.id)
        expect(json["email"]).to eq(employee.email)
      end

      it "returns 404 for a non-existent employee" do
        get "/employees/99999", headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:not_found)
        expect(json["error"]).to eq("Employee not found")
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        get "/employees/#{employee.id}", as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # TODO: Refactor create and update to maybe do both in 1 test since no fields such that we don't allow them to be changed.

  describe "POST /employees" do
    let(:http_method) { :post }
    let(:url) { "/employees" }
    let(:base_params) do
      {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@organization.org",
        country: "United States",
        job_title: "Software Engineer",
        salary: 100000
      }
    end

    context "when authenticated" do
      it "creates a new employee" do
        post url, params: { employee: base_params }, headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:created)
        expect(json["email"]).to eq("john.doe@organization.org")
      end

      include_examples "employee validation errors"
    end

    context "when unauthenticated" do
      it "returns 401" do
        post url, params: { employee: base_params }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PUT /employees/:id" do
    let!(:employee) { create(:employee) }
    let(:http_method) { :put }
    let(:url) { "/employees/#{employee.id}" }
    let(:base_params) do
      {
        first_name: "Updated",
        last_name: "Doe",
        email: "updated.doe@organization.org",
        country: "United States",
        job_title: "Software Engineer",
        salary: 999999
      }
    end

    context "when authenticated" do
      it "updates the employee" do
        put url, params: { employee: { first_name: "Updated", salary: 999999 } }, headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:ok)
        expect(json["first_name"]).to eq("Updated")
        expect(json["salary"]).to eq("999999.0")
      end

      include_examples "employee validation errors"

      it "returns 404 for non-existent employee" do
        put "/employees/99999", params: { employee: base_params }, headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        put url, params: { employee: base_params }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /employees/:id" do
    let!(:employee) { create(:employee) }

    context "when authenticated" do
      it "deletes the employee" do
        expect {
          delete "/employees/#{employee.id}", headers: auth_headers(user), as: :json
        }.to change(Employee, :count).by(-1)
        expect(response).to have_http_status(:no_content)
      end

      it "returns 404 for non-existent employee" do
        delete "/employees/99999", headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        delete "/employees/#{employee.id}", as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
