import { vi } from 'vitest'

export const mockNavigate = vi.fn()

export const mockAuthContext = (overrides = {}) => {
  vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
      user: { name: 'John Doe', email: 'john@example.com' },
      logout: vi.fn(),
      ...overrides
    })
  }))
}

export const mockRouter = () => {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
  })
}

export const mockEmployeeService = () => {
  vi.mock('@/api/services/employeeService')
}
