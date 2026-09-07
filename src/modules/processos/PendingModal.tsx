import type { ReactNode } from 'react'
import { CalendarCheck, Clock, FileText, X } from 'lucide-react'

export type PendingItem = {
  id: string
  titulo: string
  processo: string
  status: string
  quando?: string
}

/** Wide modal with blue→green gradient header used by Revisões / Aprovações / Assinaturas. */
export function PendingModal({
  open,
  onClose,
  title,
  icon,
  items = [],
  onOpen,
}: {
  open: boolean
  onClose: () => void
  title: string
  icon: ReactNode
  items?: PendingItem[]
  onOpen?: (id: string) => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-4 backdrop-blur-sm sm:p-10"
      onClick={onClose}
    >
      <div
        className="relative mt-8 w-full max-w-4xl overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>
        <header className="flex items-center gap-3 bg-[linear-gradient(90deg,#1f6fd0_0%,#22b8a6_100%)] px-6 py-5 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-white/20">{icon}</span>
          <div>
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <p className="text-sm text-white/80">{items.length} item{items.length === 1 ? '' : 's'}</p>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <CalendarCheck size={30} className="text-[var(--color-muted)]" />
            <p className="font-display text-base font-bold text-[#183263]">Nenhum item pendente</p>
            <p className="text-sm text-[var(--color-muted)]">
              Não há artefatos aguardando ação nesse filtro.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 p-6">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#ede9fe] text-[#7c3aed]">
                      <FileText size={17} />
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-[#183263]">{it.titulo}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                        <Clock size={12} /> {it.quando || '--/--/----'}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        Processo: <span className="font-semibold">{it.processo}</span>
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-[var(--radius-pill)] bg-[#d7f5ea] px-2.5 py-1 text-[11px] font-bold text-[var(--color-success)]">
                    {it.status}
                  </span>
                </div>
                <button
                  onClick={() => onOpen?.(it.id)}
                  className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                >
                  Ver detalhes →
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
