import { useState, type ReactNode } from 'react'
import {
  CalendarClock,
  FileCheck2,
  FilePen,
  FileSignature,
  Network,
  Settings,
  X,
} from 'lucide-react'

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-[var(--color-primary)]' : 'bg-[#cdd6e4]'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
      {label}
    </button>
  )
}

function Card({
  icon,
  title,
  desc,
  children,
  full,
}: {
  icon: ReactNode
  title: string
  desc: string
  children: ReactNode
  full?: boolean
}) {
  return (
    <div
      className={`rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4 ${full ? 'sm:col-span-3' : ''}`}
    >
      <div className={`flex items-start gap-3 ${full ? 'justify-between' : ''}`}>
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            {icon}
          </span>
          <div>
            <p className="font-display text-sm font-bold text-[#183263]">{title}</p>
            <p className="text-xs text-[var(--color-muted)]">{desc}</p>
          </div>
        </div>
        {full && children}
      </div>
      {!full && <div className="mt-3">{children}</div>}
    </div>
  )
}

/** Abre ao clicar num nó do fluxo. Espelha "Configuração do Fluxo de Trabalho" do SollAI. */
export function NodeConfigModal({
  node,
  onClose,
}: {
  node: string | null
  onClose: () => void
}) {
  const [deps, setDeps] = useState(false)
  const [prazo, setPrazo] = useState(false)
  const [revisao, setRevisao] = useState(false)
  const [aprovacao, setAprovacao] = useState(false)
  const [assinatura, setAssinatura] = useState(false)

  if (!node) return null

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
            <Settings size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-extrabold text-[#183263] sm:text-xl">
              Configuração do Fluxo de Trabalho
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Personalize dependências, prazos e etapas do artefato selecionado no fluxo.
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--color-primary-strong)]">{node}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card
            full
            icon={<Network size={18} />}
            title="Dependências"
            desc="Indique se este artefato depende do envio prévio de outros modelos do processo."
          >
            <Toggle
              label="Exige dependências"
              checked={deps}
              onChange={() => setDeps((v) => !v)}
            />
          </Card>
          <Card
            full
            icon={<CalendarClock size={18} />}
            title="Prazos"
            desc="Determine o tempo de execução previsto e como ele será contabilizado."
          >
            <Toggle label="Possui prazo" checked={prazo} onChange={() => setPrazo((v) => !v)} />
          </Card>
          <Card
            icon={<FilePen size={18} />}
            title="Revisão"
            desc="Defina se o artefato precisa passar por revisão antes de avançar."
          >
            <Toggle
              label="Necessário revisão"
              checked={revisao}
              onChange={() => setRevisao((v) => !v)}
            />
          </Card>
          <Card
            icon={<FileCheck2 size={18} />}
            title="Aprovação"
            desc="Defina se o artefato precisa ser aprovado antes de avançar."
          >
            <Toggle
              label="Necessário aprovação"
              checked={aprovacao}
              onChange={() => setAprovacao((v) => !v)}
            />
          </Card>
          <Card
            icon={<FileSignature size={18} />}
            title="Assinatura"
            desc="Indique se é necessário coletar assinatura digital do artefato."
          >
            <Toggle
              label="Necessário assinatura"
              checked={assinatura}
              onChange={() => setAssinatura((v) => !v)}
            />
          </Card>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-3 text-sm font-bold uppercase tracking-wide text-white"
        >
          Salvar configurações
        </button>
      </div>
    </div>
  )
}
