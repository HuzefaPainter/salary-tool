import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InsightsPage from '@/pages/insight_pages/InsightsPage'
import { expectToSeeTextSync, waitForElement } from '@/test/FormHelpers'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'John Doe', email: 'john@example.com' },
    logout: vi.fn()
  })
}))

vi.mock('@/api/services/insightService')
import * as insightService from '@/api/services/insightService'

const mockSalaryByCountry = [
  { country: 'USA', average_salary: '155000.0', min_salary: '80000.0', max_salary: '255000.0', employee_count: '100' },
  { country: 'India', average_salary: '80000.0', min_salary: '40000.0', max_salary: '150000.0', employee_count: '200' }
]

const mockSalaryByJobTitle = [
  { job_title: 'Engineer', average_salary: '120000.0', min_salary: '80000.0', max_salary: '200000.0', employee_count: '50' },
  { job_title: 'Designer', average_salary: '90000.0', min_salary: '60000.0', max_salary: '130000.0', employee_count: '30' }
]

const mockTopPaid = [
  { id: 1, first_name: 'Alice', last_name: 'Smith', job_title: 'IT', country: 'Japan', salary: '250000.0' },
  { id: 2, first_name: 'Bob', last_name: 'Jones', job_title: 'Manager', country: 'China', salary: '230000.0' }
]

const mockBottomPaid = [
  { id: 3, first_name: 'Charlie', last_name: 'Brown', job_title: 'Intern', country: 'UK', salary: '30000.0' },
  { id: 4, first_name: 'Diana', last_name: 'Prince', job_title: 'Analyst', country: 'Brazil', salary: '35000.0' }
]

function renderInsightsPage() {
  return render(
    <MemoryRouter>
      <InsightsPage />
    </MemoryRouter>
  )
}

describe('InsightsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    insightService.getSalaryByCountry.mockResolvedValue({ data: mockSalaryByCountry })
    insightService.getSalaryByJobTitle.mockResolvedValue({ data: mockSalaryByJobTitle })
    insightService.getTopPaidEmployees.mockResolvedValue({ data: mockTopPaid })
    insightService.getBottomPaidEmployees.mockResolvedValue({ data: mockBottomPaid })
  })

  describe('rendering', () => {
    it('renders all four section titles', async () => {
      renderInsightsPage()
      await waitForElement(() => {
        expectToSeeTextSync(/salary by country/i)
        expectToSeeTextSync(/salary by job title/i)
        expectToSeeTextSync(/top 10 paid employees/i)
        expectToSeeTextSync(/bottom 10 paid employees/i)
      })
    })

    it('renders salary by country data', async () => {
      renderInsightsPage()
      await waitForElement(() => {
        expectToSeeTextSync('USA')
        expectToSeeTextSync('India')
      })
    })

    it('renders salary by job title data', async () => {
      renderInsightsPage()
      await waitForElement(() => {
        expectToSeeTextSync('Engineer')
        expectToSeeTextSync('Designer')
      })
    })

    it('renders top paid employees data', async () => {
      renderInsightsPage()
      await waitForElement(() => {
        expectToSeeTextSync('Alice Smith')
        expectToSeeTextSync('Bob Jones')
      })
    })

    it('renders bottom paid employees data', async () => {
      renderInsightsPage()
      await waitForElement(() => {
        expectToSeeTextSync('Charlie Brown')
        expectToSeeTextSync('Diana Prince')
      })
    })

    it('renders employee counts in country table', async () => {
      renderInsightsPage()
      await waitForElement(() => {
        expectToSeeTextSync('100')
        expectToSeeTextSync('200')
      })
    })

    it('renders formatted salaries', async () => {
      renderInsightsPage()
      await waitForElement(() => {
        expectToSeeTextSync('$150,000.00')
        expectToSeeTextSync('$250,000.00')
      })
    })
  })

  describe('loading and error states', () => {
    it('shows loading state while fetching', () => {
      insightService.getSalaryByCountry.mockImplementation(() => new Promise(() => {}))
      insightService.getSalaryByJobTitle.mockImplementation(() => new Promise(() => {}))
      insightService.getTopPaidEmployees.mockImplementation(() => new Promise(() => {}))
      insightService.getBottomPaidEmployees.mockImplementation(() => new Promise(() => {}))
      renderInsightsPage()
      expectToSeeTextSync(/loading/i)
    })

    it('shows error when any api call fails', async () => {
      insightService.getSalaryByCountry.mockRejectedValue(new Error('Network error'))
      renderInsightsPage()
      await waitForElement(() => expectToSeeTextSync(/failed to load insights/i))
    })
  })
})
