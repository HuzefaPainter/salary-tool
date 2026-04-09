import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FormField({ id, label, type = 'text', placeholder, registration, error }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
      />
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </Field>
  )
}
