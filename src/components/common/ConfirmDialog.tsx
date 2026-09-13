import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

/**
 * Modal de confirmação padrão pra qualquer exclusão do sistema — nenhuma
 * exclusão deve rodar direto no onClick de um botão. `open` controla se
 * renderiza; passe `null`/`undefined` quando não há nada a confirmar.
 */
export function ConfirmDialog({
  open,
  title = 'Excluir?',
  message,
  confirmLabel = 'Sim, excluir',
  onCancel,
  onConfirm,
}: {
  open: boolean
  title?: string
  message: ReactNode
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
          <Trash2 size={24} />
        </span>
        <p className="mt-3 font-display text-base font-bold text-[#183263]">{title}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
