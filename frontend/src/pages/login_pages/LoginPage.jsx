// src/pages/login_pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/components/AuthLayout'
import FormField from '@/components/FormField'

const schema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: z.string()
    .min(1, 'Password is required')
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    setServerError(null)
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/employees')
    } catch (error) {
      if (error.response) {
        setServerError('Invalid email or password')
      } else {
        setServerError('Unable to connect to server. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Login" description="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="text"
          placeholder="john@example.com"
          registration={register('email')}
          error={errors.email}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          registration={register('password')}
          error={errors.password}
        />

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="underline text-primary">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
