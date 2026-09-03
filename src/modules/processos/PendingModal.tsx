import type { ReactNode } from 'react'
import { CalendarCheck, X } from 'lucide-react'

/** Wide modal with blue→green gradient header used by Revisões / Aprovações / Assinaturas. */
export function PendingModal({
  open,
  onClose,
  title,
  count = 0,
  icon,
}: {
  open: boolean
  onClose: () => void
  title: string
  count?: number
  icon: ReactNode
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
            <p className="text-sm text-white/80">{count} itens</p>
          </div>
        </header>
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <CalendarCheck size={30} className="text-[var(--color-muted)]" />
          <p className="font-display text-base font-bold text-[#183263]">Nenhum item pendente</p>
          <p className="text-sm text-[var(--color-muted)]">
            Não há artefatos aguardando ação nesse filtro.
          </p>
        </div>
      </div>
    </div>
  )
}
