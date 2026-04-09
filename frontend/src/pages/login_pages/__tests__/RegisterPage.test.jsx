import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RegisterPage from '@/pages/login_pages/RegisterPage'
import { typeInField, clickButton, expectToSeeText, waitForElement } from '@/test/FormHelpers'

const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/employees" element={<div>Employees Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

const fillRegisterForm = async (
  name = 'John Doe',
  email = 'john@example.com',
  password = 'password123',
  confirmation = 'password123'
) => {
  await typeInField(/name/i, name)
  await typeInField(/email/i, email)
  await typeInField(/^password$/i, password)
  await typeInField(/confirm password/i, confirmation)
}

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('rendering', () => {
    it('renders all fields', () => {
      renderRegisterPage()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('renders a submit button', () => {
      renderRegisterPage()
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
    })

    it('renders a link to login page', () => {
      renderRegisterPage()
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows errors when all fields are empty', async () => {
      renderRegisterPage()
      await clickButton(/register/i)
      await expectToSeeText(/name is required/i)
      await expectToSeeText(/email is required/i)
      await expectToSeeText(/password is required/i)
    })

    it('shows error when email is invalid', async () => {
      renderRegisterPage()
      await typeInField(/email/i, 'notanemail')
      await clickButton(/register/i)
      await expectToSeeText(/invalid email/i)
    })

    it('shows error when password is too short', async () => {
      renderRegisterPage()
      await typeInField(/^password$/i, '123')
      await clickButton(/register/i)
      await expectToSeeText(/password must be at least 6 characters/i)
    })

    it('shows error when passwords do not match', async () => {
      renderRegisterPage()
      await typeInField(/^password$/i, 'password123')
      await typeInField(/confirm password/i, 'different')
      await clickButton(/register/i)
      await expectToSeeText(/passwords do not match/i)
    })
  })

  describe('submission', () => {
    it('calls register with correct data', async () => {
      mockRegister.mockResolvedValue({})
      renderRegisterPage()
      await fillRegisterForm()
      await clickButton(/register/i)
      await waitForElement(() => {
        expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123', 'password123')
      })
    })

    it('redirects to /employees on successful register', async () => {
      mockRegister.mockResolvedValue({})
      renderRegisterPage()
      await fillRegisterForm()
      await clickButton(/register/i)
      await waitForElement(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/employees')
      })
    })

    it('shows error message on failed register', async () => {
      const error = new Error('Email already taken')
      error.response = { status: 422, data: { errors: ['Email has already been taken'] } }
      mockRegister.mockRejectedValue(error)
      renderRegisterPage()
      await fillRegisterForm()
      await clickButton(/register/i)
      await expectToSeeText(/email has already been taken/i)
    })

    it('disables submit button while registering', async () => {
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      renderRegisterPage()
      await fillRegisterForm()
      await clickButton(/register/i)
      expect(screen.getByRole('button', { name: /registering/i })).toBeDisabled()
    })
  })
})
