import api from '../axios.js'

export const loginRequest = (email, password) =>
  api.post('/users/sign_in', { user: { email, password } })

export const registerRequest = (name, email, password, password_confirmation) =>
  api.post('/users/sign_up', { user: { name, email, password, password_confirmation } })

export const logoutRequest = () =>
  api.delete('/users/sign_out')
