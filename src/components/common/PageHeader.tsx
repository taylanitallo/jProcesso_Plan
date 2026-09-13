import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ACCENTS, type Accent } from './accents'

export function PageHeader({
  title,
  subtitle,
  actions,
  center,
  icon: Icon,
  accent = 'blue',
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  center?: boolean
  /** Ícone colorido ao lado do título — identifica o módulo de relance. */
  icon?: LucideIcon
  accent?: Accent
}) {
  const a = ACCENTS[accent]
  return (
    <div
      className={`mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${
        center ? 'sm:flex-col sm:items-center sm:text-center' : ''
      }`}
    >
      <div className={`flex items-start gap-3 ${center ? 'sm:flex-col sm:items-center' : ''}`}>
        {Icon && (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[12px] ${a.bg} ${a.text}`}>
            <Icon size={22} />
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#183263]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--color-muted)]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
