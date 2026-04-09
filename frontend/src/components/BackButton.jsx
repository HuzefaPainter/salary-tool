import { Link } from 'react-router-dom'

export default function BackButton({ to, label = 'Back' }) {
  return (
    <Link
      to={to}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      ← {label}
    </Link>
  )
}
