import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import FormField from '@/components/FormField'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  country: z.string().min(1, 'Country is required'),
  job_title: z.string().min(1, 'Job title is required'),
  salary: z.string()
    .min(1, 'Salary is required')
    .refine((val) => !isNaN(parseFloat(val)), 'Salary must be a number')
    .refine((val) => parseFloat(val) > 0, 'Salary must be greater than 0')
})

export default function EmployeeForm({ onSubmit, submitLabel = 'Save', defaultValues = {} }) {
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  })

  const handleFormSubmit = async (data) => {
    setServerError(null)
    setLoading(true)
    try {
      await onSubmit(data)
    } catch (error) {
      if (error.response?.data?.errors?.length) {
        setServerError(error.response.data.errors[0])
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <FormField
        id="first_name"
        label="First Name"
        type="text"
        placeholder="Alice"
        registration={register('first_name')}
        error={errors.first_name}
      />
      <FormField
        id="last_name"
        label="Last Name"
        type="text"
        placeholder="Smith"
        registration={register('last_name')}
        error={errors.last_name}
      />
      <FormField
        id="email"
        label="Email"
        type="text"
        placeholder="alice.smith@organization.org"
        registration={register('email')}
        error={errors.email}
      />
      <FormField
        id="country"
        label="Country"
        type="text"
        placeholder="USA"
        registration={register('country')}
        error={errors.country}
      />
      <FormField
        id="job_title"
        label="Job Title"
        type="text"
        placeholder="Engineer"
        registration={register('job_title')}
        error={errors.job_title}
      />
      <FormField
        id="salary"
        label="Salary"
        type="text"
        placeholder="100000"
        registration={register('salary')}
        error={errors.salary}
      />

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
