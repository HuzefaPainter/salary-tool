import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EmployeeNewPage from '@/pages/employee_pages/EmployeeNewPage'
import {
  clickButton,
  typeInField,
  expectToSeeText,
  expectToSeeTextSync,
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

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderEmployeeNewPage() {
  return render(
    <MemoryRouter initialEntries={['/employees/new']}>
      <Routes>
        <Route path="/employees/new" element={<EmployeeNewPage />} />
        <Route path="/employees" element={<div>Employees Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

const fillForm = async () => {
  await typeInField(/first name/i, 'Alice')
  await typeInField(/last name/i, 'Smith')
  await typeInField(/email/i, 'alice.smith@organization.org')
  await typeInField(/country/i, 'USA')
  await typeInField(/job title/i, 'Engineer')
  await typeInField(/salary/i, '100000')
}

describe('EmployeeNewPage', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('rendering', () => {
    it('renders the page title', async () => {
      renderEmployeeNewPage()
      await expectToSeeText(/add employee form/i)
    })

    it('renders the employee form', () => {
      renderEmployeeNewPage()
      expectToSeeTextSync(/first name/i)
    })
  })

  describe('submission', () => {
    it('calls createEmployee with correct data', async () => {
      employeeService.createEmployee.mockResolvedValue({ data: { id: 1 } })
      renderEmployeeNewPage()
      await fillForm()
      await clickButton(/save/i)
      await waitForElement(() => {
        expect(employeeService.createEmployee).toHaveBeenCalledWith({
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice.smith@organization.org',
          country: 'USA',
          job_title: 'Engineer',
          salary: '100000'
        })
      })
    })

    it('redirects to employee detail page on success', async () => {
      employeeService.createEmployee.mockResolvedValue({ data: { id: 1 } })
      renderEmployeeNewPage()
      await fillForm()
      await clickButton(/save/i)
      await waitForElement(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/employees/1')
      })
    })
  })
})
