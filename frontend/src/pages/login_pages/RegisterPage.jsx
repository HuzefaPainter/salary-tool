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
  name: z.string()
    .min(1, 'Name is required'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string()
    .min(1, 'Password is required')
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation']
})

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
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
      await registerUser(data.name, data.email, data.password, data.password_confirmation)
      navigate('/employees')
    } catch (error) {
      if (error.response) {
        const errors = error.response.data?.errors
        setServerError(errors?.length ? errors[0] : 'Registration failed. Please try again.')
      } else {
        setServerError('Unable to connect to server. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Register" description="Create your account">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          id="name"
          label="Name"
          type="text"
          placeholder="John Doe"
          registration={register('name')}
          error={errors.name}
        />
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
        <FormField
          id="password_confirmation"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          registration={register('password_confirmation')}
          error={errors.password_confirmation}
        />

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="underline text-primary">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
