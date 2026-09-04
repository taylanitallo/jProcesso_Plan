import { useState } from 'react'
import { Check, Clock, MoreVertical, Package, SendHorizontal, UserRound, X } from 'lucide-react'
import { AiBubble } from '../chat/ChatShell'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ArtefatoDetalheModal } from './ArtefatoDetalheModal'
import { PROCESSO_ARTEFATOS, PROCESSOS } from '../../mocks'

export function ProcessoDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const proc = PROCESSOS[0]
  const [value, setValue] = useState('')
  const [artefato, setArtefato] = useState<string | null>(null)

  const total = PROCESSO_ARTEFATOS.length
  const feitos = PROCESSO_ARTEFATOS.filter((a) => a.enviado).length
  const pct = Math.round((feitos / total) * 100)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Trilha de artefatos — timeline vertical */}
      <aside className="w-full shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)] lg:sticky lg:top-20 lg:w-[264px]">
        <div className="bg-[linear-gradient(135deg,#12203f_0%,#1b2f57_100%)] px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">Artefatos do Processo</h2>
            <span className="rounded-[var(--radius-pill)] bg-white/15 px-2 py-0.5 text-[11px] font-bold">
              {feitos}/{total}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[var(--color-success)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-white/70">{pct}% concluído</p>
        </div>

        <ol className="max-h-[60vh] overflow-y-auto p-3 lg:max-h-[calc(100vh-13rem)]">
          {PROCESSO_ARTEFATOS.map((a, i) => (
            <li key={a.nome} className="relative pl-8">
              {/* linha conectora */}
              {i < total - 1 && (
                <span className="absolute bottom-0 left-[12px] top-8 w-0.5 bg-[#cdd6e4]" />
              )}
              {/* nó de status */}
              <span
                className={`absolute left-0 top-1.5 grid h-[26px] w-[26px] place-items-center rounded-full text-white ${
                  a.enviado ? 'bg-[var(--color-success)]' : 'bg-[#d9a441]'
                }`}
              >
                {a.enviado ? <Check size={14} /> : <X size={14} />}
              </span>

              <button
                onClick={() => setArtefato(a.completo)}
                title={a.completo}
                className="mb-1 w-full rounded-[var(--radius-control)] px-2 py-2 text-left transition hover:bg-[var(--color-primary-soft)]"
              >
                <p className="font-display text-[13px] font-bold leading-tight text-[#183263]">
                  {a.nome}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
                  <UserRound size={11} /> Não designado
                </p>
                <p className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
                  <Clock size={11} /> Sem Prazo Definido
                </p>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      {/* Chat + cartão do processo */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
          <h3 className="border-l-4 border-[var(--color-primary)] pl-2 font-display text-sm font-bold text-[#183263]">
            Processo N.º <span className="text-base">{proc.numero}</span>
          </h3>
          <span className="text-xs font-semibold text-[var(--color-ink)]">{proc.nome}</span>
          <span className="rounded-[var(--radius-pill)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary-strong)]">
            14.133
          </span>
          <span className="rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[#f1f4f9] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-muted)]">
            {proc.tipo}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white">
              <Package size={13} /> Itens
            </button>
            <button
              aria-label="Mais opções"
              className="grid h-7 w-7 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-14rem)] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[#eef3fb] shadow-[var(--shadow-card)]">
          <div className="flex-1 overflow-y-auto p-6">
            <AiBubble>Como posso ajudá-lo hoje?</AiBubble>
          </div>
          <div className="border-t border-[var(--color-line)] bg-white/60 p-4">
            <div className="rounded-[16px] border border-[var(--color-line)] bg-white p-3 shadow-[var(--shadow-card)]">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={3}
                placeholder="Digite sua pergunta aqui..."
                className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none"
              />
              <div className="flex justify-end">
                <button
                  disabled={!value.trim()}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendHorizontal size={16} />
                  Enviar Pergunta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArtefatoDetalheModal artefato={artefato} onClose={() => setArtefato(null)} />
    </div>
  )
}
