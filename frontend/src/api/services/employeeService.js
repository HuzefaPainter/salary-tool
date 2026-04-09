import api from '@/api/axios'

export const getEmployees = (page = 1, search = '') =>
  api.get('/employees', { params: { page, search } })

export const getEmployee = (id) =>
  api.get(`/employees/${id}`)

export const createEmployee = (data) =>
  api.post('/employees', { employee: data })

export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, { employee: data })

export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}`)
