import { useMemo, useState, type ReactNode } from 'react'
import {
  CalendarClock,
  FileCheck2,
  FilePen,
  FileSignature,
  Network,
  Power,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { CATEGORIAS_ASSINANTES, WORKFLOW_NODES } from '../../mocks'

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
  toggle,
  children,
  inlineToggle,
}: {
  icon: ReactNode
  title: string
  desc: string
  toggle: ReactNode
  children?: ReactNode
  /** put the toggle on the header row (wide cards) instead of below (narrow cards) */
  inlineToggle?: boolean
}) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4">
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
        {inlineToggle && <div className="flex items-center gap-2">{toggle}</div>}
      </div>
      {!inlineToggle && <div className="mt-3">{toggle}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

/** Abre ao clicar num nó do fluxo. Espelha "Configuração do Fluxo de Trabalho" do SollAI. */
export function NodeConfigModal({ node, onClose }: { node: string | null; onClose: () => void }) {
  const [ativo, setAtivo] = useState(true)
  const [deps, setDeps] = useState(false)
  const [prazo, setPrazo] = useState(false)
  const [revisao, setRevisao] = useState(false)
  const [aprovacao, setAprovacao] = useState(false)
  const [assinatura, setAssinatura] = useState(false)

  const [depSel, setDepSel] = useState<Set<string>>(new Set())
  const [depQuery, setDepQuery] = useState('')
  const [duracao, setDuracao] = useState('')
  const [contagem, setContagem] = useState('')
  const [respRevisao, setRespRevisao] = useState('')
  const [respAprovacao, setRespAprovacao] = useState('')
  const [respAssinatura, setRespAssinatura] = useState('')

  const outros = useMemo(() => WORKFLOW_NODES.filter((n) => n !== node), [node])
  const depList = outros.filter((n) => n.toLowerCase().includes(depQuery.toLowerCase()))

  if (!node) return null

  const toggleDep = (n: string) =>
    setDepSel((prev) => {
      const s = new Set(prev)
      if (s.has(n)) s.delete(n)
      else s.add(n)
      return s
    })
  const allSelected = depSel.size === outros.length && outros.length > 0

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
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
              Configuração do Fluxo de Trabalho
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Personalize dependências, prazos e etapas do artefato selecionado no fluxo.
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--color-primary-strong)]">{node}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Situação do artefato */}
          <Card
            inlineToggle
            icon={<Power size={18} />}
            title="Situação do artefato"
            desc="Ao inativar, o artefato deixa de ser exigido. Nos processos, ele só permanece visível quando já possui um envio, para consulta do histórico."
            toggle={
              <Toggle
                label={ativo ? 'Ativo' : 'Inativo'}
                checked={ativo}
                onChange={() => setAtivo((v) => !v)}
              />
            }
          />

          {/* Dependências */}
          <Card
            inlineToggle
            icon={<Network size={18} />}
            title="Dependências"
            desc="Indique se este artefato depende do envio prévio de outros modelos do processo."
            toggle={
              <>
                <Toggle
                  label="Exige dependências"
                  checked={deps}
                  onChange={() => setDeps((v) => !v)}
                />
                {deps && (
                  <span className="rounded-[var(--radius-pill)] bg-[var(--color-primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-primary-strong)]">
                    {depSel.size} selecionado(s)
                  </span>
                )}
              </>
            }
          >
            {deps && (
              <>
                <div className="flex flex-col gap-3 rounded-[var(--radius-control)] bg-[#f8fafd] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[var(--color-muted)]">
                    Selecione os <strong>modelos</strong> que precisam ser concluídos antes deste
                    artefato iniciar.
                  </p>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                      />
                      <input
                        value={depQuery}
                        onChange={(e) => setDepQuery(e.target.value)}
                        placeholder="Buscar modelo..."
                        className="gt-input !py-2 !pl-9 text-xs"
                      />
                    </div>
                    <Toggle
                      label="Selecionar todos"
                      checked={allSelected}
                      onChange={() =>
                        setDepSel(allSelected ? new Set() : new Set(outros))
                      }
                    />
                  </div>
                </div>
                <ul className="mt-2 flex flex-col gap-2">
                  {depList.map((n) => (
                    <li key={n}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 text-sm font-semibold text-[var(--color-ink)]">
                        <input
                          type="checkbox"
                          checked={depSel.has(n)}
                          onChange={() => toggleDep(n)}
                          className="accent-[var(--color-primary)]"
                        />
                        {n}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          {/* Prazos */}
          <Card
            inlineToggle
            icon={<CalendarClock size={18} />}
            title="Prazos"
            desc="Determine o tempo de execução previsto e como ele será contabilizado."
            toggle={<Toggle label="Possui prazo" checked={prazo} onChange={() => setPrazo((v) => !v)} />}
          >
            {prazo && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Duração (dias)
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
            )}
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card
              icon={<FilePen size={18} />}
              title="Revisão"
              desc="Defina se o artefato precisa passar por revisão antes de avançar."
              toggle={
                <Toggle
                  label="Necessário revisão"
                  checked={revisao}
                  onChange={() => setRevisao((v) => !v)}
                />
              }
            >
              {revisao && (
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Responsável pela revisão
                  <Combo
                    value={respRevisao}
                    onChange={setRespRevisao}
                    options={CATEGORIAS_ASSINANTES}
                    placeholder="Selecione:"
                  />
                </label>
              )}
            </Card>
            <Card
              icon={<FileCheck2 size={18} />}
              title="Aprovação"
              desc="Defina se o artefato precisa ser aprovado antes de avançar."
              toggle={
                <Toggle
                  label="Necessário aprovação"
                  checked={aprovacao}
                  onChange={() => setAprovacao((v) => !v)}
                />
              }
            >
              {aprovacao && (
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Responsável pela aprovação
                  <Combo
                    value={respAprovacao}
                    onChange={setRespAprovacao}
                    options={CATEGORIAS_ASSINANTES}
                    placeholder="Selecione:"
                  />
                </label>
              )}
            </Card>
            <Card
              icon={<FileSignature size={18} />}
              title="Assinatura"
              desc="Indique se é necessário coletar assinatura digital do artefato."
              toggle={
                <Toggle
                  label="Necessário assinatura"
                  checked={assinatura}
                  onChange={() => setAssinatura((v) => !v)}
                />
              }
            >
              {assinatura && (
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Quem assina
                  <Combo
                    value={respAssinatura}
                    onChange={setRespAssinatura}
                    options={CATEGORIAS_ASSINANTES}
                    placeholder="Selecione:"
                  />
                </label>
              )}
            </Card>
          </div>
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
