Rails.application.routes.draw do
  devise_for :users,
    path: "users",
    path_names: {
      sign_in: "sign_in",
      sign_out: "sign_out",
      registration: "sign_up"
    },
    controllers: {
      sessions: "users/sessions",
      registrations: "users/registrations"
    }

  get "/health", to: "health#index"
end
