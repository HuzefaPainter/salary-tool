import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import * as authService from '@/api/services/authService'

vi.mock('@/api/services/authService')

function TestComponent() {
  const { user, isAuthenticated, login, register, logout } = useAuth()
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no user'}</div>
      <div data-testid="isAuthenticated">{String(isAuthenticated)}</div>
      <button onClick={() => login('john@example.com', 'password123').catch(() => {})}>Login</button>
      <button onClick={() => register('John', 'john@example.com', 'password123', 'password123').catch(() => {})}>Register</button>
      <button onClick={() => logout().catch(() => {})}>Logout</button>
    </div>
  )
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has no user by default', () => {
      renderWithAuth()
      expect(screen.getByTestId('user').textContent).toBe('no user')
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    })

    it('restores user from localStorage', () => {
      const storedUser = { id: 1, name: 'John', email: 'john@example.com' }
      localStorage.setItem('user', JSON.stringify(storedUser))
      renderWithAuth()
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(storedUser))
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })
  })

  describe('login', () => {
    it('stores token and user in localStorage on success', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@example.com' }
      authService.loginRequest.mockResolvedValue({
        data: { user: mockUser },
        headers: { authorization: 'Bearer token123' }
      })

      renderWithAuth()

      await act(async () => {
        screen.getByText('Login').click()
      })

      expect(localStorage.getItem('token')).toBe('Bearer token123')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser))
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })

    it('throws error on failed login', async () => {
      authService.loginRequest.mockRejectedValue(new Error('Invalid credentials'))

      renderWithAuth()

      let error
      await act(async () => {
        try {
          screen.getByText('Login').click()
        } catch (e) {
          error = e
        }
      })

      expect(localStorage.getItem('token')).toBeNull()
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    })
  })

  describe('register', () => {
    it('stores token and user in localStorage on success', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@example.com' }
      authService.registerRequest.mockResolvedValue({
        data: { user: mockUser },
        headers: { authorization: 'Bearer token123' }
      })

      renderWithAuth()

      await act(async () => {
        screen.getByText('Register').click()
      })

      expect(localStorage.getItem('token')).toBe('Bearer token123')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser))
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })
  })

  describe('logout', () => {
    it('clears token and user from localStorage on success', async () => {
      localStorage.setItem('token', 'Bearer token123')
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'John' }))
      authService.logoutRequest.mockResolvedValue({})

      renderWithAuth()

      await act(async () => {
        screen.getByText('Logout').click()
      })

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
      expect(screen.getByTestId('user').textContent).toBe('no user')
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    })

    it('clears localStorage even if logout request fails', async () => {
      localStorage.setItem('token', 'Bearer token123')
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'John' }))
      authService.logoutRequest.mockRejectedValue(new Error('Network error'))

      renderWithAuth()

      await act(async () => {
        try {
          screen.getByText('Logout').click()
        } catch (e) {
        }
      })

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    })
  })

  describe('useAuth', () => {
    it('throws error when used outside AuthProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      )

      consoleSpy.mockRestore()
    })
  })
})
