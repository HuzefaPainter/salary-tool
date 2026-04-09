import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EmployeeDetailPage from '@/pages/employee_pages/EmployeeDetailPage'
import {
  clickButton,
  expectToSeeTextSync,
  expectToSeeRole,
  expectLinkToPointTo,
  waitForElement
} from '@/test/FormHelpers'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'John Doe', email: 'john@example.com' },
    logout: vi.fn()
  })
}))

vi.mock('@/api/services/employeeService')
import * as employeeService from '@/api/services/employeeService'

const mockEmployee = {
  id: 1,
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice.smith@organization.org',
  country: 'USA',
  job_title: 'Engineer',
  salary: '100000.0'
}

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderEmployeeDetailPage() {
  return render(
    <MemoryRouter initialEntries={['/employees/1']}>
      <Routes>
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/employees" element={<div>Employees Page</div>} />
        <Route path="/employees/:id/edit" element={<div>Edit Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EmployeeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    employeeService.getEmployee.mockResolvedValue({
      data: mockEmployee
    })
  })

  describe('rendering', () => {
    it('renders employee details', async () => {
      renderEmployeeDetailPage()
      await waitForElement(() => {
        expectToSeeTextSync('Alice')
        expectToSeeTextSync('Smith')
        expectToSeeTextSync('alice.smith@organization.org')
        expectToSeeTextSync('USA')
        expectToSeeTextSync('Engineer')
        expectToSeeTextSync('$100,000.00')
      })
    })

    it('renders N/A for missing fields', async () => {
      employeeService.getEmployee.mockResolvedValue({
        data: { id: 1, first_name: 'Alice', last_name: null, email: null, country: null, job_title: null, salary: null }
      })
      renderEmployeeDetailPage()
      await waitForElement(() => {
        expect(screen.getAllByText('N/A').length).toBeGreaterThan(4)
      })
    })

    it('renders edit link pointing to correct url', async () => {
      renderEmployeeDetailPage()
      await waitForElement(() => {
        expectLinkToPointTo(/edit/i, '/employees/1/edit')
      })
    })

    it('renders delete button', async () => {
      renderEmployeeDetailPage()
      await waitForElement(() => expectToSeeRole('button', /delete/i))
    })

    it('shows loading state while fetching', () => {
      employeeService.getEmployee.mockImplementation(() => new Promise(() => {}))
      renderEmployeeDetailPage()
      expectToSeeTextSync(/loading/i)
    })

    it('shows error message when api call fails', async () => {
      employeeService.getEmployee.mockRejectedValue(new Error('Network error'))
      renderEmployeeDetailPage()
      await waitForElement(() => expectToSeeTextSync(/failed to load employee/i))
    })
  })

  describe('delete', () => {
    it('calls deleteEmployee when delete button is clicked', async () => {
      employeeService.deleteEmployee.mockResolvedValue({})
      renderEmployeeDetailPage()
      await waitForElement(() => expectToSeeRole('button', /delete/i))
      await clickButton(/delete/i)
      // confirm in dialog
      await clickButton(/delete/i)
      await waitFor(() => {
        expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1)
      }, { timeout: 500 })
    })

    it('redirects to /employees after successful delete', async () => {
      employeeService.deleteEmployee.mockResolvedValue({})
      renderEmployeeDetailPage()
      await waitForElement(() => expectToSeeRole('button', /delete/i))
      await clickButton(/delete/i)
      await clickButton(/delete/i)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/employees')
      }, { timeout: 500 })
    })

    it('shows error message when delete fails', async () => {
      const error = new Error('Delete failed')
      error.response = { status: 500 }
      employeeService.deleteEmployee.mockRejectedValue(error)
      renderEmployeeDetailPage()
      await waitForElement(() => expectToSeeRole('button', /delete/i))
      await clickButton(/delete/i)
      await clickButton(/delete/i)
      await waitForElement(() => expectToSeeTextSync(/failed to delete employee/i))
    })
  })
})
