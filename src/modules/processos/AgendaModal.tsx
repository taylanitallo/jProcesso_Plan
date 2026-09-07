import { Calendar, Filter, X } from 'lucide-react'

const WEEK = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']

/** Month grid for the current month; today is highlighted. Events not modelled. */
function buildGrid(base: Date) {
  const year = base.getFullYear()
  const month = base.getMonth()
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function AgendaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  const now = new Date()
  const cells = buildGrid(now)
  const monthLabel = now
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-4 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1320px] rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-3 flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-sm font-semibold text-[var(--color-primary-strong)]">
            <Calendar size={15} /> Hoje
          </button>
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-white">
            {monthLabel} <Calendar size={14} />
          </span>
          <button
            aria-label="Filtrar"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]"
          >
            <Filter size={15} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {WEEK.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const outside = d.getMonth() !== now.getMonth()
            const today = d.toDateString() === now.toDateString()
            return (
              <div
                key={i}
                className={`min-h-[92px] rounded-[10px] border p-2 text-xs ${
                  today
                    ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--color-line)]'
                } ${outside ? 'bg-[#f6f8fc] text-[var(--color-muted)]' : 'bg-white text-[var(--color-ink)]'}`}
              >
                {d.getDate()}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
