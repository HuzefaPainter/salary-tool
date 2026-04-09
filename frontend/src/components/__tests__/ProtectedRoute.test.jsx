import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '@/contexts/AuthContext'

describe('ProtectedRoute', () => {
  it('redirects to /login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null })

    render(
      <MemoryRouter initialEntries={['/employees']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    useAuth.mockReturnValue({ user: { id: 1, name: 'John', email: 'john@example.com' } })

    render(
      <MemoryRouter initialEntries={['/employees']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})
