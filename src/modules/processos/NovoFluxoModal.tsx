import { useState } from 'react'
import { Info, Plus, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { ARTEFATO_LEGISLACOES } from '../../mocks'

const TIPOS_PROCESSO = [
  'Obras',
  'Pregão - Bens e Serviços',
  'Pregão - Serviços de Engenharia',
  'Contratação Direta - dispensa',
  'Contratação Direta - inexigibilidade',
  'Adesão a Ata de Registro de Preços',
  'Credenciamento',
]

/** "+ Novo Fluxo" — conforme o modal real do SollAI. */
export function NovoFluxoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [legislacao, setLegislacao] = useState('')
  const [tipo, setTipo] = useState('')

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative my-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
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
            <h3 className="font-display text-lg font-extrabold text-[#183263] sm:text-xl">Novo Fluxo</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Complete os campos para criar um fluxo automatizado associado aos seus processos
              inteligentes.
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Defina a legislação e o tipo de processo que serão vinculados a este fluxo. Lembre-se: cada
          combinação pode possuir apenas um fluxo ativo.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Legislação
            <Combo
              value={legislacao}
              onChange={setLegislacao}
              options={ARTEFATO_LEGISLACOES}
              placeholder="Selecione uma Legislação"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Tipo de Processo
            <Combo
              value={tipo}
              onChange={setTipo}
              options={TIPOS_PROCESSO}
              placeholder="Selecione um Tipo"
            />
          </label>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] px-3 py-2.5 text-xs text-[var(--color-muted)]">
          <Info size={14} className="mt-0.5 shrink-0 text-[var(--color-info)]" />
          Cada legislação e tipo de processo suporta apenas um fluxo. Caso já exista um fluxo ativo,
          edite-o antes de criar um novo.
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-3 text-sm font-bold text-white"
        >
          Salvar Fluxo
        </button>
      </div>
    </div>
  )
}
