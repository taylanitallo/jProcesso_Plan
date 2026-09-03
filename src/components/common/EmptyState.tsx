import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'

export function EmptyState({
  icon: Icon = Plus,
  title,
  subtitle,
}: {
  icon?: LucideIcon
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)]">
        <Icon size={26} />
      </span>
      <p className="font-display text-lg font-bold text-[#183263]">{title}</p>
      {subtitle && <p className="max-w-md text-sm text-[var(--color-muted)]">{subtitle}</p>}
    </div>
  )
}
