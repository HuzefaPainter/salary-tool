require 'rails_helper'

RSpec.describe Employee, type: :model do
  describe "validations" do
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:country) }
    it { should validate_presence_of(:job_title) }
    it { should validate_presence_of(:salary) }
    it { should validate_numericality_of(:salary).is_greater_than(0) }
  end

  describe "factory" do
    it "creates a valid employee" do
      employee = build(:employee)
      expect(employee).to be_valid
    end
  end

  describe ".salary_insights_by_country" do
    it "returns avg, min and max salary grouped by country" do
      create(:employee, country: "India", salary: 50000)
      create(:employee, country: "India", salary: 100000)
      create(:employee, country: "USA", salary: 200000)

      result = Employee.salary_insights_by_country

      india = result.find { |r| r["country"] == "India" }
      usa = result.find { |r| r["country"] == "USA" }

      expect(india["average_salary"].to_f).to eq(75000.0)
      expect(india["min_salary"].to_f).to eq(50000.0)
      expect(india["max_salary"].to_f).to eq(100000.0)
      expect(usa["average_salary"].to_f).to eq(200000.0)
      expect(usa["min_salary"].to_f).to eq(200000.0)
      expect(usa["max_salary"].to_f).to eq(200000.0)
    end
  end

  describe ".salary_insights_by_job_title" do
    it "returns avg, min and max salary grouped by job title" do
      create(:employee, job_title: "Engineer", salary: 80000)
      create(:employee, job_title: "Engineer", salary: 120000)
      create(:employee, job_title: "Designer", salary: 90000)

      result = Employee.salary_insights_by_job_title

      engineer = result.find { |r| r["job_title"] == "Engineer" }
      designer = result.find { |r| r["job_title"] == "Designer" }

      expect(engineer["average_salary"].to_f).to eq(100000.0)
      expect(engineer["min_salary"].to_f).to eq(80000.0)
      expect(engineer["max_salary"].to_f).to eq(120000.0)
      expect(designer["average_salary"].to_f).to eq(90000.0)
      expect(designer["min_salary"].to_f).to eq(90000.0)
      expect(designer["max_salary"].to_f).to eq(90000.0)
    end
  end

  describe ".employee_count_by_job_title" do
    it "returns employee count grouped by job title" do
      create_list(:employee, 3, job_title: "Engineer")
      create_list(:employee, 2, job_title: "Designer")

      result = Employee.employee_count_by_job_title

      engineer = result.find { |r| r["job_title"] == "Engineer" }
      designer = result.find { |r| r["job_title"] == "Designer" }

      expect(engineer["employee_count"].to_i).to eq(3)
      expect(designer["employee_count"].to_i).to eq(2)
    end
  end
end
