FactoryBot.define do
  factory :employee do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { "#{first_name.downcase}.#{last_name.downcase}#{rand(1..9999999)}@organization.org" }
    country { Faker::Address.country }
    job_title { Faker::Job.title }
    salary { Faker::Number.between(from: 30000, to: 500000) }
  end
end
