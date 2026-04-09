// src/pages/login_pages/__tests__/LoginPage.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '@/pages/login_pages/LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employees" element={<div>Employees Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders email and password fields', () => {
      renderLoginPage()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('renders a submit button', () => {
      renderLoginPage()
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('renders a link to register page', () => {
      renderLoginPage()
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows error when email is empty', async () => {
      renderLoginPage()
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    })

    it('shows error when password is empty', async () => {
      renderLoginPage()
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    })

    it('shows error when email is invalid', async () => {
      renderLoginPage()
      await userEvent.type(screen.getByLabelText(/email/i), 'notanemail')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
      expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  describe('submission', () => {
    it('calls login with correct credentials', async () => {
      mockLogin.mockResolvedValue({})
      renderLoginPage()

      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'password123')
      })
    })

    it('redirects to /employees on successful login', async () => {
      mockLogin.mockResolvedValue({})
      renderLoginPage()

      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/employees')
      })
    })

    it('shows error message on failed login', async () => {
      const error = new Error('Invalid credentials')
      error.response = { status: 401 }
      mockLogin.mockRejectedValue(error)

      renderLoginPage()

      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))

      expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
    })

    it('disables submit button while logging in', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      renderLoginPage()

      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /login/i }))

      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    })
  })
})
