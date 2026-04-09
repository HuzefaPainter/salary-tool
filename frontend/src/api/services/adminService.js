import api from '../axios.js'

export const resetData = () =>
  api.post('/admin/reset_data')
