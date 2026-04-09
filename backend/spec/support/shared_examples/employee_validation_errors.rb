shared_examples "employee validation errors" do
  [
    [ :first_name, "First name can't be blank" ],
    [ :last_name,  "Last name can't be blank" ],
    [ :email,      "Email can't be blank" ],
    [ :country,    "Country can't be blank" ],
    [ :job_title,  "Job title can't be blank" ],
    [ :salary,     "Salary can't be blank" ]
  ].each do |field, error_message|
    it "returns 422 when #{field} is blank" do
      send(http_method, url, params: { employee: base_params.merge(field => "") }, headers: auth_headers(user), as: :json)
      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to include(error_message)
    end
  end

  it "returns 422 when salary is negative" do
    send(http_method, url, params: { employee: base_params.merge(salary: -1) }, headers: auth_headers(user), as: :json)
    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"]).to include("Salary must be greater than 0")
  end

  it "returns 422 when email is already taken" do
    create(:employee, email: "taken@organization.org")
    send(http_method, url, params: { employee: base_params.merge(email: "taken@organization.org") }, headers: auth_headers(user), as: :json)
    expect(response).to have_http_status(:unprocessable_content)
    expect(json["errors"]).to include("Email has already been taken")
  end
end
