import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import {
clickButton,
expectToSeeRole,
expectLinkToPointTo,
expectToSeeTextSync
} from '@/test/FormHelpers'

const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: { name: 'John Doe', email: 'john@example.com' }
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('rendering', () => {
    it('renders the home link', () => {
      renderNavbar()
      expectToSeeRole('link', /salary tool/i)
    })

    it('renders the insights link', () => {
      renderNavbar()
      expectToSeeRole('link', /insights/i)
    })

    it('renders the add employee link', () => {
      renderNavbar()
      expectToSeeRole('link', /add employee/i)
    })

    it('renders the logged in user name', () => {
      renderNavbar()
      expectToSeeTextSync(/john doe/i)
    })

    it('renders the logout button', () => {
      renderNavbar()
      expectToSeeRole('button', /logout/i)
    })
  })

  describe('navigation', () => {
    it('home link points to /employees', () => {
      renderNavbar()
      expectLinkToPointTo(/salary tool/i, '/employees')
    })

    it('insights link points to /insights', () => {
      renderNavbar()
      expectLinkToPointTo(/insights/i, '/insights')
    })

    it('add employee link points to /employees/new', () => {
      renderNavbar()
      expectLinkToPointTo(/add employee/i, '/employees/new')
    })
  })

  describe('logout', () => {
    it('calls logout when logout button is clicked', async () => {
      mockLogout.mockResolvedValue({})
      renderNavbar()
      await clickButton(/logout/i)
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled()
      })
    })

    it('redirects to /login after logout', async () => {
      mockLogout.mockResolvedValue({})
      renderNavbar()
      await clickButton(/logout/i)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })
  })
})
