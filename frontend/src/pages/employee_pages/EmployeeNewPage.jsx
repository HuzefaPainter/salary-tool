import { useNavigate } from 'react-router-dom'
import { createEmployee } from '@/api/services/employeeService'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import EmployeeForm from '@/components/EmployeeForm'

export default function EmployeeNewPage() {
  const navigate = useNavigate()

  const handleSubmit = async (data) => {
    const response = await createEmployee(data)
    toast.success('Employee created successfully')
    navigate(`/employees/${response.data.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">Add Employee Form</h1>
        <EmployeeForm
          onSubmit={handleSubmit}
          submitLabel="Save"
        />
      </div>
    </div>
  )
}
