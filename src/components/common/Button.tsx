import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'success' | 'danger' | 'outline' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  // geracaotech primary button: vertical blue gradient + blue shadow
  primary:
    'text-white shadow-[0_10px_24px_rgba(29,86,173,0.35)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] hover:bg-[linear-gradient(180deg,#245cb4_0%,#194a98_100%)]',
  success:
    'text-white shadow-[0_10px_24px_rgba(25,135,84,0.30)] bg-[linear-gradient(180deg,#25a06a_0%,#198754_100%)] hover:brightness-95',
  danger:
    'text-white shadow-[0_10px_24px_rgba(201,54,69,0.30)] bg-[linear-gradient(180deg,#d84a58_0%,#c93645_100%)] hover:brightness-95',
  outline:
    'border border-[#c9d6ea] bg-white text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft)]',
  ghost: 'text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft)]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', fullWidth, className = '', children, ...rest }: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
