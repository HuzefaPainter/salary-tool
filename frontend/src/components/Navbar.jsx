import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { resetData } from '@/api/services/adminService'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login')
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const response = await resetData()
      toast.success(response.data.message)
      window.location.href = '/employees'
    } catch {
      toast.error('Failed to reset data')
    } finally {
      setResetting(false)
    }
  }

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link
              to="/employees"
              className="font-semibold text-lg tracking-tight"
            >
              Salary Tool
            </Link>
            <Link
              to="/insights"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Insights
            </Link>
            <Link
              to="/employees/new"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Add Employee
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={resetting}>
                  {resetting ? 'Resetting...' : 'Reset Data'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all employee data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all 10,000 employees and reseed the database with fresh data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
