import { useState, type ReactNode } from 'react'
import { CalendarClock, FileCheck2, FilePen, FileSignature, Settings, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? 'bg-[var(--color-primary)]' : 'bg-[#cdd6e4]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
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
  below,
  full,
}: {
  icon: ReactNode
  title: string
  desc: string
  children: ReactNode
  below?: ReactNode
  full?: boolean
}) {
  return (
    <div
      className={`rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4 ${full ? 'sm:col-span-3' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
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
      {below && <div className="mt-3">{below}</div>}
    </div>
  )
}

export function ControleGeralModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [prazo, setPrazo] = useState(false)
  const [revisao, setRevisao] = useState(false)
  const [aprovacao, setAprovacao] = useState(false)
  const [assinatura, setAssinatura] = useState(false)
  const [duracao, setDuracao] = useState('')
  const [contagem, setContagem] = useState('')

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative my-4 max-h-[90vh] w-full max-w-[1320px] overflow-y-auto rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 pr-8">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
              <Settings size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
                Controle Geral do Fluxo
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                Aplique regras de prazo, revisão, aprovação e assinatura em todos os artefatos de uma
                só vez.
              </p>
            </div>
          </div>
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
            Aplicação a todos os artefatos
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card
            full
            icon={<CalendarClock size={18} />}
            title="Prazos"
            desc="Defina a duração padrão e o tipo de contagem que todos os artefatos seguirão."
            below={
              prazo ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                    Duração padrão (dias)
                    <input
                      type="number"
                      min={1}
                      value={duracao}
                      onChange={(e) => setDuracao(e.target.value)}
                      placeholder="Ex.: 5"
                      className="gt-input font-normal normal-case"
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                    Tipo de contagem
                    <Combo
                      value={contagem}
                      onChange={setContagem}
                      options={['Dias corridos', 'Dias úteis']}
                      placeholder="Selecione:"
                    />
                  </label>
                </div>
              ) : undefined
            }
          >
            <Toggle label="Possui prazo" checked={prazo} onChange={() => setPrazo((v) => !v)} />
          </Card>
          <Card
            icon={<FilePen size={18} />}
            title="Revisão"
            desc="Determine se todos os artefatos exigirão revisão."
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
            desc="Determine se todos os artefatos exigirão aprovação."
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
            desc="Opcionalmente exija assinatura digital em todos os artefatos gerados."
          >
            <Toggle
              label="Necessário assinatura"
              checked={assinatura}
              onChange={() => setAssinatura((v) => !v)}
            />
          </Card>
        </div>

        <p className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] px-3 py-2.5 text-xs text-[var(--color-muted)]">
          Ao salvar, aplicaremos essas definições a{' '}
          <strong className="text-[var(--color-primary-strong)]">todas</strong> as configurações de
          artefato deste fluxo.
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-3 text-sm font-bold uppercase tracking-wide text-white"
        >
          Salvar para todos
        </button>
      </div>
    </div>
  )
}
