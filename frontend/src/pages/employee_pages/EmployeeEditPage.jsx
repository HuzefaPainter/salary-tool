import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmployee, updateEmployee } from '@/api/services/employeeService'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import EmployeeForm from '@/components/EmployeeForm'

export default function EmployeeEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getEmployee(id)
        setEmployee(response.data)
      } catch {
        setError('Failed to load employee')
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [id])

  const handleSubmit = async (data) => {
    await updateEmployee(parseInt(id), data)
    toast.success('Employee updated successfully')
    navigate(`/employees/${id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-muted-foreground">Loading...</p>}

        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && employee && (
          <>
            <h1 className="text-2xl font-semibold mb-6">Edit Employee</h1>
            <EmployeeForm
              onSubmit={handleSubmit}
              submitLabel="Save"
              defaultValues={{
                first_name: employee.first_name || '',
                last_name: employee.last_name || '',
                email: employee.email || '',
                country: employee.country || '',
                job_title: employee.job_title || '',
                salary: employee.salary || ''
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
