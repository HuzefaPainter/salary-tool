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

  resources :employees

  namespace :insights do
    get :salary_by_country
    get :salary_by_job_title
    get :top_paid_employees
    get :bottom_paid_employees
  end

  get "/health", to: "health#index"
end
