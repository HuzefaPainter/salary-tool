Devise.setup do |config|
  config.mailer_sender = "please-change-me-at-config-initializers-devise@example.com"

  require "devise/orm/active_record"

  config.navigational_formats = []
  config.jwt do |jwt|
    jwt.secret = ENV["DEVISE_JWT_SECRET_KEY"]
    jwt.dispatch_requests = [
      [ "POST", %r{^/users/sign_in$} ],
      [ "POST", %r{^/users/sign_up$} ]
    ]
    jwt.revocation_requests = [
      [ "DELETE", %r{^/users/sign_out$} ]
    ]
    jwt.expiration_time = 24.hours.to_i
  end

  config.case_insensitive_keys = [ :email ]

  config.strip_whitespace_keys = [ :email ]

  config.skip_session_storage = [ :http_auth, :params_auth ]
  config.stretches = Rails.env.test? ? 1 : 12

  config.reconfirmable = true

  config.expire_all_remember_me_on_sign_out = true

  config.password_length = 6..128

  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  config.reset_password_within = 6.hours

  config.sign_out_via = :delete

  config.responder.error_status = :unprocessable_content
  config.responder.redirect_status = :see_other

  config.warden do |manager|
    manager.default_strategies(scope: :user).unshift :jwt
  end
end
