import { Plus, X } from 'lucide-react'
import { ProcessoFields } from './ProcessoFields'

/** "+ Novo" → "Processo com preenchimento manual". Campos conforme o modal real do SollAI. */
export function NovoProcessoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative my-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-5 flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
              Novo Processo
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Complete os campos para cadastrar um novo Processo Inteligente.
            </p>
          </div>
        </div>

        <ProcessoFields />

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-3 text-sm font-bold uppercase tracking-wide text-white"
        >
          Salvar Processo
        </button>
      </div>
    </div>
  )
}
