// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/login_pages/LoginPage'
import RegisterPage from '@/pages/login_pages/RegisterPage'
import EmployeesPage from '@/pages/employee_pages/EmployeesPage'
import InsightsPage from '@/pages/insight_pages/InsightsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <InsightsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
