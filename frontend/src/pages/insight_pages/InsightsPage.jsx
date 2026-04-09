import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import {
  getSalaryByCountry,
  getSalaryByJobTitle,
  getTopPaidEmployees,
  getBottomPaidEmployees
} from '@/api/services/insightService'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const formatSalary = (salary) => {
  if (!salary) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(salary))
}

export default function InsightsPage() {
  const [salaryByCountry, setSalaryByCountry] = useState([])
  const [salaryByJobTitle, setSalaryByJobTitle] = useState([])
  const [topPaid, setTopPaid] = useState([])
  const [bottomPaid, setBottomPaid] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      setError(null)
      try {
        const [countryRes, jobTitleRes, topRes, bottomRes] = await Promise.all([
          getSalaryByCountry(),
          getSalaryByJobTitle(),
          getTopPaidEmployees(),
          getBottomPaidEmployees()
        ])
        setSalaryByCountry(countryRes.data)
        setSalaryByJobTitle(jobTitleRes.data)
        setTopPaid(topRes.data)
        setBottomPaid(bottomRes.data)
      } catch {
        setError('Failed to load insights')
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-8">Insights</h1>

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-col gap-10">

            {/* Salary by Country */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Salary by Country</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Avg Salary</TableHead>
                      <TableHead>Min Salary</TableHead>
                      <TableHead>Max Salary</TableHead>
                      <TableHead>Employee Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryByCountry.map((row) => (
                      <TableRow key={row.country}>
                        <TableCell>{row.country || 'N/A'}</TableCell>
                        <TableCell>{formatSalary(row.average_salary)}</TableCell>
                        <TableCell>{formatSalary(row.min_salary)}</TableCell>
                        <TableCell>{formatSalary(row.max_salary)}</TableCell>
                        <TableCell>{row.employee_count || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Salary by Job Title */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Salary by Job Title</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Avg Salary</TableHead>
                      <TableHead>Min Salary</TableHead>
                      <TableHead>Max Salary</TableHead>
                      <TableHead>Employee Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryByJobTitle.map((row) => (
                      <TableRow key={row.job_title}>
                        <TableCell>{row.job_title || 'N/A'}</TableCell>
                        <TableCell>{formatSalary(row.average_salary)}</TableCell>
                        <TableCell>{formatSalary(row.min_salary)}</TableCell>
                        <TableCell>{formatSalary(row.max_salary)}</TableCell>
                        <TableCell>{row.employee_count || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Top 10 Paid Employees */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Top 10 Paid Employees</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPaid.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A'}</TableCell>
                        <TableCell>{employee.job_title || 'N/A'}</TableCell>
                        <TableCell>{employee.country || 'N/A'}</TableCell>
                        <TableCell>{formatSalary(employee.salary)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Bottom 10 Paid Employees */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Bottom 10 Paid Employees</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bottomPaid.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'N/A'}</TableCell>
                        <TableCell>{employee.job_title || 'N/A'}</TableCell>
                        <TableCell>{employee.country || 'N/A'}</TableCell>
                        <TableCell>{formatSalary(employee.salary)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  )
}
