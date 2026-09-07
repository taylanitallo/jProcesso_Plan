import { useState } from 'react'
import { Building2, FileText, Plus, Search, X } from 'lucide-react'
import { useNecessidades } from '../../store/necessidades'

/** ~itens fictícios por PCA, só pra ter o que mostrar/importar. */
function itensDoPca(n: number): number {
  return 40 + ((n * 37) % 90)
}

export function ImportarPcaModal({ onClose }: { onClose: () => void }) {
  const adicionar = useNecessidades((s) => s.adicionar)

  const [cnpj, setCnpj] = useState('')
  const [ano, setAno] = useState(String(new Date().getFullYear()))
  const [consultado, setConsultado] = useState(false)
  const [pcas, setPcas] = useState<number[]>([])
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [visualizar, setVisualizar] = useState<number | null>(null)

  const consultar = () => {
    if (!cnpj.trim()) return
    setPcas(Array.from({ length: 13 }, (_, i) => i + 1))
    setSelecionados([])
    setVisualizar(null)
    setConsultado(true)
  }

  const toggle = (n: number) =>
    setSelecionados((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))

  const totalItens = selecionados.reduce((sum, n) => sum + itensDoPca(n), 0)

  const importar = () => {
    if (selecionados.length === 0) return
    adicionar({
      nome: `Importação PCA/PNCP ${ano}`,
      descricao: `CNPJ ${cnpj} — PCA(s) ${selecionados.sort((a, b) => a - b).join(', ')}.`,
      itens: totalItens,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-4xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Importar do PCA / PNCP</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Pesquise pelo CNPJ da instituição e ano para criar o Registro de Necessidade.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[240px] flex-1 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              CNPJ do Órgão
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="gt-input !pl-9 font-normal normal-case"
                />
              </div>
            </label>
            <label className="flex w-28 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Ano
              <input
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="gt-input font-normal normal-case"
              />
            </label>
            <button
              onClick={consultar}
              disabled={!cnpj.trim()}
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={15} /> Consultar
            </button>
          </div>
        </div>

        {consultado && (
          <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <FileText size={13} /> Este órgão possui <strong>{pcas.length}</strong> PCA(s). Marque
                os que deseja importar e clique no PCA para visualizar os itens.
              </p>
              <button
                onClick={() =>
                  setSelecionados(selecionados.length === pcas.length ? [] : [...pcas])
                }
                className="rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)]"
              >
                {selecionados.length === pcas.length
                  ? 'Limpar seleção'
                  : 'Selecionar todos para importação'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {pcas.map((n) => (
                <div key={n} className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(n)}
                    onChange={() => toggle(n)}
                    className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                  />
                  <button
                    onClick={() => setVisualizar(n)}
                    className={`rounded-[6px] px-2.5 py-1 text-xs font-semibold transition ${
                      visualizar === n
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    PCA #{n}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 min-h-[120px] rounded-[var(--radius-control)] bg-[#f8fafd] p-4 text-sm text-[var(--color-muted)]">
              {visualizar
                ? `PCA #${visualizar} — ${itensDoPca(visualizar)} itens de plano de contratação (visualização).`
                : 'Clique num PCA para visualizar seus itens.'}
            </div>
          </div>
        )}

        <button
          onClick={importar}
          disabled={selecionados.length === 0}
          className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Importar Itens Selecionados{selecionados.length > 0 ? ` (${totalItens})` : ''}
        </button>
      </div>
    </div>
  )
}
