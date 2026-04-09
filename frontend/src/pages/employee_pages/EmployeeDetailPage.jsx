import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEmployee, deleteEmployee } from '@/api/services/employeeService'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatSalary } from '@/utils/formatSalary'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

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

  const handleDelete = async () => {
    setDeleteError(null)
    try {
      await deleteEmployee(parseInt(id))
      navigate('/employees')
    } catch {
      setDeleteError('Failed to delete employee')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-muted-foreground">Loading...</p>}

        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && employee && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold">
                {employee.first_name} {employee.last_name}
              </h1>
              <div className="flex gap-2">
                <Link to={`/employees/${id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {employee.first_name} {employee.last_name}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">First Name</p>
                  <p className="font-medium">{employee.first_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Name</p>
                  <p className="font-medium">{employee.last_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{employee.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="font-medium">{employee.job_title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary</p>
                  <p className="font-medium">{formatSalary(employee.salary)}</p>
                </div>
              </CardContent>
            </Card>

            {deleteError && (
              <p className="text-destructive mt-4">{deleteError}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
