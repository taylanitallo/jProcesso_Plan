import { Modal } from '../../components/common/Modal'
import { Button } from '../../components/common/Button'
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

/** "+ Novo" → cadastro de processo. Campos conforme o wizard real do SollAI. */
export function NovoProcessoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Novo Processo" size="lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Número do Processo" placeholder="2026/00000" />
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Legislação
          <select className="gt-input">
            {ARTEFATO_LEGISLACOES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Tipo de Processo
          <select className="gt-input">
            {TIPOS_PROCESSO.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <Field label="Nome do Processo" placeholder="Ex.: Aquisição de material de expediente" />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-[var(--color-ink)]">
        <input type="checkbox" className="accent-[var(--color-primary)]" defaultChecked />
        Lote Único
      </label>

      <label className="mt-3 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        Descrição do Processo
        <textarea rows={3} className="gt-input resize-y" placeholder="Descreva o objeto do processo..." />
      </label>

      <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-4">
        <p className="text-sm font-bold text-[#183263]">Mapa de Risco</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Após criar o processo, preencha as etapas: <strong>1</strong> — Identificação dos Riscos ·{' '}
          <strong>2</strong> — Avaliação do Risco (probabilidade × impacto) · <strong>3</strong> —
          Resposta ao Risco.
        </p>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          Cancelar
        </button>
        <Button onClick={onClose}>Salvar</Button>
      </div>
    </Modal>
  )
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
      {label}
      <input className="gt-input" {...rest} />
    </label>
  )
}
