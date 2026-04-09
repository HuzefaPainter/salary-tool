import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '@/pages/login_pages/LoginPage'
import { typeInField, clickButton, expectToSeeText } from '@/test/FormHelpers'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
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

const fillLoginForm = async (email = 'john@example.com', password = 'password123') => {
  await typeInField(/email/i, email)
  await typeInField(/^password$/i, password)
}

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('rendering', () => {
    it('renders email and password fields', () => {
      renderLoginPage()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
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
      await clickButton(/login/i)
      await expectToSeeText(/email is required/i)
    })

    it('shows error when password is empty', async () => {
      renderLoginPage()
      await clickButton(/login/i)
      await expectToSeeText(/password is required/i)
    })

    it('shows error when email is invalid', async () => {
      renderLoginPage()
      await typeInField(/email/i, 'notanemail')
      await clickButton(/login/i)
      await expectToSeeText(/invalid email/i)
    })
  })

  describe('submission', () => {
    it('calls login with correct credentials', async () => {
      mockLogin.mockResolvedValue({})
      renderLoginPage()
      await fillLoginForm()
      await clickButton(/login/i)
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'password123')
      })
    })

    it('redirects to /employees on successful login', async () => {
      mockLogin.mockResolvedValue({})
      renderLoginPage()
      await fillLoginForm()
      await clickButton(/login/i)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/employees')
      })
    })

    it('shows error message on failed login', async () => {
      const error = new Error('Invalid credentials')
      error.response = { status: 401 }
      mockLogin.mockRejectedValue(error)
      renderLoginPage()
      await fillLoginForm('john@example.com', 'wrongpassword')
      await clickButton(/login/i)
      await expectToSeeText(/invalid email or password/i)
    })

    it('disables submit button while logging in', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      renderLoginPage()
      await fillLoginForm()
      await clickButton(/login/i)
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    })
  })
})
