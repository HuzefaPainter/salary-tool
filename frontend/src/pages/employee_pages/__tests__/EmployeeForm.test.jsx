import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EmployeeForm from '@/components/EmployeeForm'
import {
  clickButton,
  expectToSeeRole,
  expectToSeeTextSync,
  typeInField,
  waitForElement,
  expectFieldToBeInDocument,
  expectFieldToHaveValue
} from '@/test/FormHelpers'

const mockOnSubmit = vi.fn()

const defaultEmployee = {
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice.smith@organization.org',
  country: 'USA',
  job_title: 'Engineer',
  salary: '100000.0'
}

function renderEmployeeForm(props = {}) {
  return render(
    <MemoryRouter>
      <EmployeeForm
        onSubmit={mockOnSubmit}
        submitLabel="Save"
        {...props}
      />
    </MemoryRouter>
  )
}

describe('EmployeeForm', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('rendering', () => {
    it('renders all fields', () => {
      renderEmployeeForm()
      expectFieldToBeInDocument(/first name/i)
      expectFieldToBeInDocument(/last name/i)
      expectFieldToBeInDocument(/email/i)
      expectFieldToBeInDocument(/country/i)
      expectFieldToBeInDocument(/job title/i)
      expectFieldToBeInDocument(/salary/i)
    })

    it('renders submit button with correct label', () => {
      renderEmployeeForm({ submitLabel: 'Save Employee' })
      expectToSeeRole('button', /save employee/i)
    })

    it('prefills form with existing employee data', () => {
      renderEmployeeForm({ defaultValues: defaultEmployee })
      expectFieldToHaveValue(/first name/i, 'Alice')
      expectFieldToHaveValue(/last name/i, 'Smith')
      expectFieldToHaveValue(/email/i, 'alice.smith@organization.org')
      expectFieldToHaveValue(/country/i, 'USA')
      expectFieldToHaveValue(/job title/i, 'Engineer')
      expectFieldToHaveValue(/salary/i, '100000.0')
    })
  })

  describe('validation', () => {
    [
      ['first name', /first name is required/i],
      ['last name', /last name is required/i],
      ['email', /email is required/i],
      ['country', /country is required/i],
      ['job title', /job title is required/i],
      ['salary', /salary is required/i],
    ].forEach(([field, errorMessage]) => {
      it(`shows error when ${field} is empty`, async () => {
        renderEmployeeForm()
        await clickButton(/save/i)
        await waitForElement(() => expectToSeeTextSync(errorMessage))
      })
    })

    it('shows error when email is invalid', async () => {
      renderEmployeeForm()
      await typeInField(/email/i, 'notanemail')
      await clickButton(/save/i)
      await waitForElement(() => expectToSeeTextSync(/invalid email/i))
    })

    it('shows error when salary is not a number', async () => {
      renderEmployeeForm()
      await typeInField(/salary/i, 'abc')
      await clickButton(/save/i)
      await waitForElement(() => expectToSeeTextSync(/salary must be a number/i))
    })

    it('shows error when salary is negative', async () => {
      renderEmployeeForm()
      await typeInField(/salary/i, '-1000')
      await clickButton(/save/i)
      await waitForElement(() => expectToSeeTextSync(/salary must be greater than 0/i))
    })
  })

  describe('submission', () => {
    it('calls onSubmit with correct data when form is valid', async () => {
      mockOnSubmit.mockResolvedValue({})
      renderEmployeeForm()
      await typeInField(/first name/i, 'Alice')
      await typeInField(/last name/i, 'Smith')
      await typeInField(/email/i, 'alice.smith@organization.org')
      await typeInField(/country/i, 'USA')
      await typeInField(/job title/i, 'Engineer')
      await typeInField(/salary/i, '100000')
      await clickButton(/save/i)
      await waitForElement(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice.smith@organization.org',
          country: 'USA',
          job_title: 'Engineer',
          salary: '100000'
        })
      })
    })

    it('disables submit button while submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      renderEmployeeForm()
      await typeInField(/first name/i, 'Alice')
      await typeInField(/last name/i, 'Smith')
      await typeInField(/email/i, 'alice.smith@organization.org')
      await typeInField(/country/i, 'USA')
      await typeInField(/job title/i, 'Engineer')
      await typeInField(/salary/i, '100000')
      await clickButton(/save/i)
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })

    it('shows server error message on failed submission', async () => {
      const error = new Error('Failed')
      error.response = { status: 422, data: { errors: ['Email has already been taken'] } }
      mockOnSubmit.mockRejectedValue(error)
      renderEmployeeForm()
      await typeInField(/first name/i, 'Alice')
      await typeInField(/last name/i, 'Smith')
      await typeInField(/email/i, 'alice.smith@organization.org')
      await typeInField(/country/i, 'USA')
      await typeInField(/job title/i, 'Engineer')
      await typeInField(/salary/i, '100000')
      await clickButton(/save/i)
      await waitForElement(() => expectToSeeTextSync(/email has already been taken/i))
    })
  })
})
