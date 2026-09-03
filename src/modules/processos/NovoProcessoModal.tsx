import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { ARTEFATO_LEGISLACOES } from '../../mocks'

const TIPOS_PROCESSO = [
  'Pregão - Bens e Serviços',
  'Pregão - Serviços de Engenharia',
  'Concorrência - Obras',
  'Dispensa Eletrônica',
  'Inexigibilidade',
  'Adesão a Ata de Registro de Preços',
  'Credenciamento',
]

/** "+ Novo" → cadastro de processo. Campos conforme o modal real do SollAI. */
export function NovoProcessoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [legislacao, setLegislacao] = useState('')
  const [tipo, setTipo] = useState('')
  const [lote, setLote] = useState('')

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

        <div className="mb-5 flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-extrabold text-[#183263] sm:text-xl">
              Novo Processo
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Complete os campos para cadastrar um novo Processo Inteligente.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="NÚMERO DO PROCESSO" placeholder="Digite o número do processo" />
          <Labelled label="LEGISLAÇÃO">
            <Combo
              value={legislacao}
              onChange={setLegislacao}
              options={ARTEFATO_LEGISLACOES}
              placeholder="Selecione uma Legislação"
            />
          </Labelled>
          <Labelled label="TIPO DE PROCESSO">
            <Combo
              value={tipo}
              onChange={setTipo}
              options={TIPOS_PROCESSO}
              placeholder="Selecione um Tipo"
            />
          </Labelled>
          <Labelled label="LOTE ÚNICO">
            <Combo value={lote} onChange={setLote} options={['Sim', 'Não']} placeholder="Selecione:" />
          </Labelled>
          <div className="sm:col-span-2">
            <Field label="NOME DO PROCESSO" placeholder="Digite o nome do processo" />
          </div>
        </div>

        <label className="mt-4 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          Descrição do Processo
          <textarea
            rows={4}
            maxLength={500}
            className="gt-input resize-y font-normal normal-case"
            placeholder="Caso queira, descreva detalhes adicionais"
          />
        </label>
        <p className="mt-1 text-xs text-[var(--color-muted)]">Máximo de 500 caracteres.</p>

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

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      {children}
    </div>
  )
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <input className="gt-input min-w-0 font-normal normal-case" {...rest} />
    </label>
  )
}
