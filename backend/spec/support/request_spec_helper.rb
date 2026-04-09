module RequestSpecHelper
  def json
    JSON.parse(response.body)
  end

  def auth_headers(user)
    post "/users/sign_in", params: {
      user: { email: user.email, password: user.password }
    }, as: :json
    token = response.headers["Authorization"]
    { "Authorization" => token }
  end
end

RSpec.configure do |config|
  config.include RequestSpecHelper, type: :request
end
