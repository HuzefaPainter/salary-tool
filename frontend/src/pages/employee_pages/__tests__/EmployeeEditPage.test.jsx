// src/pages/employee_pages/__tests__/EmployeeEditPage.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EmployeeEditPage from '@/pages/employee_pages/EmployeeEditPage'
import {
  clickButton,
  typeInField,
  expectToSeeTextSync,
  waitForElement,
  expectFieldToHaveValue
} from '@/test/FormHelpers'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'John Doe', email: 'john@example.com' },
    logout: vi.fn()
  })
}))

vi.mock('@/api/services/employeeService')
import * as employeeService from '@/api/services/employeeService'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockEmployee = {
  id: 1,
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice.smith@organization.org',
  country: 'USA',
  job_title: 'Engineer',
  salary: '100000.0'
}

function renderEmployeeEditPage() {
  return render(
    <MemoryRouter initialEntries={['/employees/1/edit']}>
      <Routes>
        <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
        <Route path="/employees/:id" element={<div>Employee Detail</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EmployeeEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    employeeService.getEmployee.mockResolvedValue({ data: mockEmployee })
  })

  describe('rendering', () => {
    it('renders the page title', async () => {
      renderEmployeeEditPage()
      await waitForElement(() => expectToSeeTextSync(/edit employee/i))
    })

    it('prefills form with existing employee data', async () => {
      renderEmployeeEditPage()
      await waitForElement(() => {
        expectFieldToHaveValue(/first name/i, 'Alice')
        expectFieldToHaveValue(/last name/i, 'Smith')
        expectFieldToHaveValue(/email/i, 'alice.smith@organization.org')
        expectFieldToHaveValue(/country/i, 'USA')
        expectFieldToHaveValue(/job title/i, 'Engineer')
        expectFieldToHaveValue(/salary/i, '100000.0')
      })
    })

    it('shows loading state while fetching', () => {
      employeeService.getEmployee.mockImplementation(() => new Promise(() => {}))
      renderEmployeeEditPage()
      expectToSeeTextSync(/loading/i)
    })

    it('shows error when fetch fails', async () => {
      employeeService.getEmployee.mockRejectedValue(new Error('Network error'))
      renderEmployeeEditPage()
      await waitForElement(() => expectToSeeTextSync(/failed to load employee/i))
    })
  })

  describe('submission', () => {
    it('calls updateEmployee with correct data', async () => {
      employeeService.updateEmployee.mockResolvedValue({ data: mockEmployee })
      renderEmployeeEditPage()
      await waitForElement(() => expectFieldToHaveValue(/first name/i, 'Alice'))
      await clickButton(/save/i)
      await waitForElement(() => {
        expect(employeeService.updateEmployee).toHaveBeenCalledWith(1, {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice.smith@organization.org',
          country: 'USA',
          job_title: 'Engineer',
          salary: '100000.0'
        })
      })
    })

    it('redirects to employee detail page on success', async () => {
      employeeService.updateEmployee.mockResolvedValue({ data: mockEmployee })
      renderEmployeeEditPage()
      await waitForElement(() => expectFieldToHaveValue(/first name/i, 'Alice'))
      await clickButton(/save/i)
      await waitForElement(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/employees/1')
      })
    })

    it('shows error message on failed update', async () => {
      const error = new Error('Failed')
      error.response = { status: 422, data: { errors: ['Email has already been taken'] } }
      employeeService.updateEmployee.mockRejectedValue(error)
      renderEmployeeEditPage()
      await waitForElement(() => expectFieldToHaveValue(/first name/i, 'Alice'))
      await clickButton(/save/i)
      await waitForElement(() => expectToSeeTextSync(/email has already been taken/i))
    })
  })
})
