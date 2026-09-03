import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
  center,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  center?: boolean
}) {
  return (
    <div
      className={`mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${
        center ? 'sm:flex-col sm:items-center sm:text-center' : ''
      }`}
    >
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#183263]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
