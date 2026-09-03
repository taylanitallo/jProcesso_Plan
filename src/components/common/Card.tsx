import type { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function Card({ title, actions, className = '', bodyClassName = '', children }: CardProps) {
  return (
    <section
      className={`overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-5 py-4">
          {title && (
            <h3 className="text-[0.98rem] font-bold text-[#183263]">{title}</h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`px-5 py-5 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
