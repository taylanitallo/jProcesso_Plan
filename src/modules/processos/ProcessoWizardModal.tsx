import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { ProcessoFields } from './ProcessoFields'

/**
 * Wizard multi-etapa de criação de Processo Inteligente — usado pelos modos
 * "a partir de Registro de Necessidade" e "com solicitação integrada".
 * A primeira aba é sempre "Processo" (campos do processo); as demais são
 * etapas de seleção de itens, exibidas como placeholder nesta versão.
 */
export function ProcessoWizardModal({
  open,
  onClose,
  title,
  subtitle,
  tabs,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  tabs: string[]
}) {
  const [tab, setTab] = useState(0)

  if (!open) return null

  const last = tab === tabs.length - 1

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

        <div className="mb-4 flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">{title}</h3>
            <p className="text-sm text-[var(--color-muted)]">{subtitle}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 border-b border-[var(--color-line)]">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition ${
                i === tab
                  ? 'border-[var(--color-primary)] text-[var(--color-primary-strong)]'
                  : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 ? (
          <ProcessoFields />
        ) : (
          <EmptyState
            title="Nenhum item selecionado"
            subtitle="Avance pelas etapas para escolher os registros e itens que comporão o processo."
          />
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={() => (last ? onClose() : setTab((t) => t + 1))}
            className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white"
          >
            {last ? 'Concluir' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
