shared_examples "ordered paid employees" do |order|
  it "returns employees in #{order} order" do
    get url, headers: auth_headers(user), as: :json
    expect(response).to have_http_status(:ok)
    if order == "descending"
      expect(json.first["salary"].to_f).to be >= json.last["salary"].to_f
    else
      expect(json.first["salary"].to_f).to be <= json.last["salary"].to_f
    end
  end

  it "returns at most 10 employees when more than 10 exist" do
    create_list(:employee, 15, salary: salary)
    get url, headers: auth_headers(user), as: :json
    expect(json.length).to eq(10)
    expect(json.first["salary"].to_f).to eq(salary.to_f)
  end

  it "returns 401 when unauthenticated" do
    get url, as: :json
    expect(response).to have_http_status(:unauthorized)
  end
end
