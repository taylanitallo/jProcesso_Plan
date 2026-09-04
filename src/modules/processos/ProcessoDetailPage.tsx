import { useState } from 'react'
import { Check, MessageSquare, MoreVertical, Package, SendHorizontal, X } from 'lucide-react'
import { ChatShell, AiBubble } from '../chat/ChatShell'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ArtefatoDetalheModal } from './ArtefatoDetalheModal'
import { PROCESSO_ARTEFATOS, PROCESSOS } from '../../mocks'

export function ProcessoDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const proc = PROCESSOS[0]
  const [value, setValue] = useState('')
  const [artefato, setArtefato] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {/* Trilha de artefatos do processo */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PROCESSO_ARTEFATOS.map((a) => (
          <button
            key={a.nome}
            onClick={() => setArtefato(a.completo)}
            className={`relative flex min-w-[190px] max-w-[190px] shrink-0 flex-col gap-1 rounded-[var(--radius-card)] border px-3 py-3 text-left text-xs transition hover:shadow-[var(--shadow-pop)] ${
              a.enviado
                ? 'border-[#a7dcc4] bg-[#e4f4ec]'
                : 'border-[#f2d59a] bg-[#fdf4e0]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${
                  a.enviado ? 'bg-[var(--color-success)]' : 'bg-[#d39a16]'
                }`}
              >
                <Package size={14} />
              </span>
              <p className="font-display font-bold leading-tight text-[#183263]">{a.nome}</p>
            </div>
            <p className="text-[var(--color-muted)]">Não designado</p>
            <p className="text-[var(--color-muted)]">Sem Prazo Definido</p>
            <span
              className={`absolute bottom-2 right-2 grid h-5 w-5 place-items-center rounded-full text-white ${
                a.enviado ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
              }`}
            >
              {a.enviado ? <Check size={12} /> : <X size={12} />}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        {/* Cartão flutuante do processo */}
        <div className="absolute right-3 top-3 z-20 w-72 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-pop)]">
          <div className="flex items-start justify-between gap-2">
            <h3 className="border-l-4 border-[var(--color-primary)] pl-2 font-display text-sm font-bold text-[#183263]">
              Processo N.º <span className="text-base">{proc.numero}</span>
            </h3>
            <div className="flex shrink-0 items-center gap-1">
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
          <p className="mt-2 text-xs font-semibold text-[var(--color-ink)]">{proc.nome}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-[var(--radius-pill)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary-strong)]">
              14.133
            </span>
            <span className="rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[#f1f4f9] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-muted)]">
              {proc.tipo}
            </span>
          </div>
        </div>

        <ChatShell
          counterLabel="Total Consultas"
          counterValue={0}
          history={[]}
          itemIcon={MessageSquare}
          showTabs={false}
          searchPlaceholder="Pesquisar no histórico..."
        >
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
        </ChatShell>
      </div>

      <ArtefatoDetalheModal artefato={artefato} onClose={() => setArtefato(null)} />
    </div>
  )
}
