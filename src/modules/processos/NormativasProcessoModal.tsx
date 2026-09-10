import { useState } from 'react'
import { Check, FileText, Search, X } from 'lucide-react'
import { useNormativas, selecaoDe } from '../../store/normativas'

/**
 * "Normativas" do menu Mais Opções — associa quais normativas (já cadastradas
 * em /Normativa) se aplicam a este processo especifico.
 */
export function NormativasProcessoModal({
  processoId,
  onClose,
  onSave,
}: {
  processoId: string
  onClose: () => void
  onSave: () => void
}) {
  const normativas = useNormativas((s) => s.normativas)
  const selecoes = useNormativas((s) => s.selecoes)
  const definirSelecao = useNormativas((s) => s.definirSelecao)

  const [busca, setBusca] = useState('')
  const [selecionadas, setSelecionadas] = useState<string[]>(() =>
    selecaoDe(processoId, selecoes, normativas),
  )

  const toggle = (id: string) => {
    setSelecionadas((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const filtradas = normativas.filter((n) => n.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-[1320px] rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <FileText size={20} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Normativas do Processo</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Selecione as normativas que serão utilizadas neste processo.
            </p>
          </div>
        </div>

        <label className="mt-5 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          Buscar Normativa
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome do arquivo ou normativa"
              className="gt-input !pl-9 font-normal normal-case"
            />
          </div>
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtradas.length === 0 && (
            <p className="col-span-2 py-6 text-center text-sm text-[var(--color-muted)]">
              Nenhuma normativa encontrada.
            </p>
          )}
          {filtradas.map((n) => {
            const ativo = selecionadas.includes(n.id)
            return (
              <button
                key={n.id}
                onClick={() => toggle(n.id)}
                className={`flex items-start gap-2.5 rounded-[var(--radius-control)] border p-3 text-left transition ${
                  ativo
                    ? 'border-[#bcd0ee] bg-[var(--color-primary-soft)]'
                    : 'border-[var(--color-line)] bg-white hover:bg-[#f8fafd]'
                }`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-2 ${
                    ativo
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-line)] bg-white'
                  }`}
                >
                  {ativo && <Check size={13} />}
                </span>
                <span className="min-w-0">
                  <span className="block break-words text-[13px] font-bold text-[var(--color-ink)]">
                    {n.nome}
                  </span>
                  <span className="block break-words text-xs text-[var(--color-muted)]">{n.nome}</span>
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => {
            definirSelecao(processoId, selecionadas)
            onSave()
            onClose()
          }}
          className="mt-5 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white"
        >
          Salvar Seleções ({selecionadas.length}/{normativas.length})
        </button>
      </div>
    </div>
  )
}
