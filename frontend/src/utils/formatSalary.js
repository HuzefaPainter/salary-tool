export const formatSalary = (salary) => {
  if (!salary) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(salary))
}
