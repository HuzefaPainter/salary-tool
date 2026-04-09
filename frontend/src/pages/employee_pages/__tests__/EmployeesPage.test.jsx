import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EmployeesPage from '@/pages/employee_pages/EmployeesPage'
import {
  clickButton,
  typeInField,
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

const mockEmployees = [
  {
    id: 1,
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice.smith@organization.org',
    country: 'USA',
    job_title: 'Engineer',
    salary: '100000.0'
  },
  {
    id: 2,
    first_name: 'Bob',
    last_name: 'Jones',
    email: 'bob.jones@organization.org',
    country: 'India',
    job_title: 'Designer',
    salary: '80000.0'
  },
]

const mockMeta = {
  current_page: 1,
  total_pages: 3,
  total_count: 25,
  per_page: 10
}

function renderEmployeesPage() {
  return render(
    <MemoryRouter initialEntries={['/employees']}>
      <Routes>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<div>Employee Detail</div>} />
        <Route path="/employees/new" element={<div>New Employee</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    employeeService.getEmployees.mockResolvedValue({
      data: { employees: mockEmployees, meta: mockMeta }
    })
  })

  describe('rendering', () => {
    it('renders the navbar', async () => {
      renderEmployeesPage()
      await waitForElement(() => expectToSeeTextSync(/salary tool/i))
    })

    it('renders the table headers', async () => {
      renderEmployeesPage()
      await waitForElement(() => {
        expectToSeeTextSync(/first name/i)
        expectToSeeTextSync(/last name/i)
        expectToSeeTextSync(/email/i)
        expectToSeeTextSync(/country/i)
        expectToSeeTextSync(/job title/i)
        expectToSeeTextSync(/^salary$/i)
      })
    })

    it('renders employee data from the api', async () => {
      renderEmployeesPage()
      await waitForElement(() => {
        expectToSeeTextSync('Alice')
        expectToSeeTextSync('Bob')
        expectToSeeTextSync('alice.smith@organization.org')
        expectToSeeTextSync('bob.jones@organization.org')
      })
    })

    it('renders a view link for each employee', async () => {
      renderEmployeesPage()
      await waitForElement(() => {
        const viewLinks = screen.getAllByRole('link', { name: /view/i })
        expect(viewLinks).toHaveLength(2)
      })
    })

    it('view link points to correct employee url', async () => {
      renderEmployeesPage()
      await waitForElement(() => {
        const viewLinks = screen.getAllByRole('link', { name: /view/i })
        expect(viewLinks[0]).toHaveAttribute('href', '/employees/1')
        expect(viewLinks[1]).toHaveAttribute('href', '/employees/2')
      })
    })

    it('renders salary formatted as a number', async () => {
      renderEmployeesPage()
      await waitForElement(() => {
        expectToSeeTextSync('$100,000.00')
      })
    })

    it('renders a search input', async () => {
      renderEmployeesPage()
      await waitForElement(() => expectToSeeRole('textbox', /search/i))
    })

    it('shows empty state when no employees found', async () => {
      employeeService.getEmployees.mockResolvedValue({
        data: { employees: [], meta: { ...mockMeta, total_count: 0, total_pages: 0 } }
      })
      renderEmployeesPage()
      await waitForElement(() => expectToSeeTextSync(/no employees found/i))
    })

    it('shows loading state while fetching', async () => {
      employeeService.getEmployees.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      renderEmployeesPage()
      expectToSeeTextSync(/loading/i)
    })

    it('shows error message when api call fails', async () => {
      employeeService.getEmployees.mockRejectedValue(new Error('Network error'))
      renderEmployeesPage()
      await waitForElement(() => expectToSeeTextSync(/failed to load employees/i))
    })
  })

  describe('pagination', () => {
    it('renders pagination info', async () => {
      renderEmployeesPage()
      await waitForElement(() => expectToSeeTextSync(/page 1 of 3/i))
    })

    it('renders next and previous buttons', async () => {
      renderEmployeesPage()
      await waitForElement(() => {
        expectToSeeRole('button', /next/i)
        expectToSeeRole('button', /previous/i)
      })
    })

    it('disables previous button on first page', async () => {
      renderEmployeesPage()
      await waitForElement(() => {
        expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
      })
    })

    it('disables next button on last page', async () => {
      employeeService.getEmployees.mockResolvedValue({
        data: { employees: mockEmployees, meta: { ...mockMeta, current_page: 3, total_pages: 3 } }
      })
      renderEmployeesPage()
      await waitForElement(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
      })
    })

    it('fetches next page when next is clicked', async () => {
      renderEmployeesPage()
      await waitForElement(() => expectToSeeRole('button', /next/i))
      await clickButton(/next/i)
      await waitForElement(() => {
        expect(employeeService.getEmployees).toHaveBeenCalledWith(2, '')
      })
    })

    it('fetches previous page when previous is clicked', async () => {
      employeeService.getEmployees.mockResolvedValue({
        data: { employees: mockEmployees, meta: { ...mockMeta, current_page: 2 } }
      })
      renderEmployeesPage()
      await waitForElement(() => expectToSeeRole('button', /previous/i))
      await clickButton(/previous/i)
      await waitForElement(() => {
        expect(employeeService.getEmployees).toHaveBeenCalledWith(1, '')
      })
    })
  })

  describe('search', () => {
    it('fetches employees with search term', async () => {
      renderEmployeesPage()
      await waitForElement(() => expectToSeeRole('textbox', /search/i))
      await typeInField(/search/i, 'alice')
      await waitFor(() => {
        expect(employeeService.getEmployees).toHaveBeenCalledWith(1, 'alice')
      }, { timeout: 1000 }) // debounce needs longer timeout
    })

    it('resets to page 1 when searching', async () => {
      renderEmployeesPage()
      await waitForElement(() => expectToSeeRole('textbox', /search/i))
      await typeInField(/search/i, 'bob')
      await waitFor(() => {
        expect(employeeService.getEmployees).toHaveBeenCalledWith(1, 'bob')
      }, { timeout: 1000 }) // debounce needs longer timeout
    })

    it('shows empty state when search returns no results', async () => {
      employeeService.getEmployees.mockResolvedValue({
        data: { employees: [], meta: { ...mockMeta, total_count: 0, total_pages: 0 } }
      })
      renderEmployeesPage()
      await waitForElement(() => expectToSeeTextSync(/no employees found/i))
    })
  })
})
