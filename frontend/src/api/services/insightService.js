import api from '@/api/axios'

export const getSalaryByCountry = () =>
  api.get('/insights/salary_by_country')

export const getSalaryByJobTitle = () =>
  api.get('/insights/salary_by_job_title')

export const getTopPaidEmployees = () =>
  api.get('/insights/top_paid_employees')

export const getBottomPaidEmployees = () =>
  api.get('/insights/bottom_paid_employees')
