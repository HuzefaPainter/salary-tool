# backend/spec/requests/insights_spec.rb
require 'rails_helper'

RSpec.describe "Insights", type: :request do
  let!(:user) { create(:user) }

  before do
    create(:employee, country: "India", job_title: "Engineer", salary: 50000)
    create(:employee, country: "India", job_title: "Engineer", salary: 100000)
    create(:employee, country: "USA", job_title: "Designer", salary: 200000)
  end

  describe "GET /insights/salary_by_country" do
    context "when authenticated" do
      it "returns salary insights grouped by country" do
        get "/insights/salary_by_country", headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:ok)
        india = json.find { |r| r["country"] == "India" }
        usa = json.find { |r| r["country"] == "USA" }
        expect(india["average_salary"].to_f).to eq(75000.0)
        expect(india["min_salary"].to_f).to eq(50000.0)
        expect(india["max_salary"].to_f).to eq(100000.0)
        expect(india["employee_count"].to_i).to eq(2)
        expect(usa["employee_count"].to_i).to eq(1)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        get "/insights/salary_by_country", as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /insights/salary_by_job_title" do
    context "when authenticated" do
      it "returns salary insights grouped by job title" do
        get "/insights/salary_by_job_title", headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:ok)
        engineer = json.find { |r| r["job_title"] == "Engineer" }
        designer = json.find { |r| r["job_title"] == "Designer" }
        expect(engineer["average_salary"].to_f).to eq(75000.0)
        expect(engineer["min_salary"].to_f).to eq(50000.0)
        expect(engineer["max_salary"].to_f).to eq(100000.0)
        expect(engineer["employee_count"].to_i).to eq(2)
        expect(designer["employee_count"].to_i).to eq(1)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        get "/insights/salary_by_job_title", as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /insights/top_paid_employees" do
    let(:url) { "/insights/top_paid_employees" }
    let(:salary) { 500000 }

    include_examples "ordered paid employees", "descending"
  end

  describe "GET /insights/bottom_paid_employees" do
    let(:url) { "/insights/bottom_paid_employees" }
    let(:salary) { 30000 }

    include_examples "ordered paid employees", "ascending"
  end
end
