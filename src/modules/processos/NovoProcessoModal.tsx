import { Plus, X } from 'lucide-react'
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
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-4 backdrop-blur-sm sm:p-10"
      onClick={onClose}
    >
      <div
        className="relative mt-6 w-full max-w-3xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div>
            <h3 className="font-display text-xl font-extrabold text-[#183263]">Novo Processo</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Complete os campos para cadastrar um novo Processo Inteligente.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="NÚMERO DO PROCESSO" placeholder="Digite o número do processo" />
          <Select label="LEGISLAÇÃO" placeholder="Selecione uma Legislação" options={ARTEFATO_LEGISLACOES} />
          <Select label="TIPO DE PROCESSO" placeholder="Selecione um Tipo" options={TIPOS_PROCESSO} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field label="NOME DO PROCESSO" placeholder="Digite o nome do processo" />
          <Select label="LOTE ÚNICO" placeholder="Selecione:" options={['Sim', 'Não']} />
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

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <input className="gt-input font-normal normal-case" {...rest} />
    </label>
  )
}

function Select({
  label,
  placeholder,
  options,
}: {
  label: string
  placeholder: string
  options: string[]
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <select className="gt-input font-normal normal-case" defaultValue="">
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}
