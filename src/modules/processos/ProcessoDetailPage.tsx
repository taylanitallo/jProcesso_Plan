import { useState } from 'react'
import {
  Check,
  Clock,
  MoreVertical,
  Package,
  SendHorizontal,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { AiBubble } from '../chat/ChatShell'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ArtefatoDetalheModal } from './ArtefatoDetalheModal'
import { MapaRiscoModal } from './MapaRiscoModal'
import { CadastroItensModal } from './CadastroItensModal'
import { PROCESSO_ARTEFATOS, PROCESSOS } from '../../mocks'

export function ProcessoDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const proc = PROCESSOS[0]
  const [value, setValue] = useState('')
  const [artefato, setArtefato] = useState<string | null>(null)
  const [mapaRisco, setMapaRisco] = useState(false)
  const [itensOpen, setItensOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const abrirArtefato = (a: (typeof PROCESSO_ARTEFATOS)[number]) => {
    if (a.nome === 'Mapa de Risco') setMapaRisco(true)
    else setArtefato(a.completo)
  }

  const total = PROCESSO_ARTEFATOS.length
  const feitos = PROCESSO_ARTEFATOS.filter((a) => a.enviado).length
  const pct = Math.round((feitos / total) * 100)

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho do processo */}
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
          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Sparkles size={13} /> Analisar com IA
          </button>
          <button
            onClick={() => setItensOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
          >
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

      {/* Trilha de artefatos — timeline vertical */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
        <div className="bg-[linear-gradient(135deg,#12203f_0%,#1b2f57_100%)] px-5 py-3 text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">Artefatos do Processo</h2>
            <span className="rounded-[var(--radius-pill)] bg-white/15 px-2 py-0.5 text-[11px] font-bold">
              {feitos}/{total}
            </span>
          </div>
          <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[var(--color-success)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-white/70">{pct}% concluído</p>
        </div>

        <ol className="grid gap-x-6 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {PROCESSO_ARTEFATOS.map((a) => (
            <li key={a.nome} className="relative border-b border-[var(--color-line)] py-3 pl-9">
              <span
                className={`absolute left-0 top-3 grid h-[26px] w-[26px] place-items-center rounded-full text-white ${
                  a.enviado ? 'bg-[var(--color-success)]' : 'bg-[#d9a441]'
                }`}
              >
                {a.enviado ? <Check size={14} /> : <X size={14} />}
              </span>
              <button
                onClick={() => abrirArtefato(a)}
                title={a.completo}
                className="w-full rounded-[var(--radius-control)] px-2 py-1 text-left transition hover:bg-[var(--color-primary-soft)]"
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
      </div>

      <ArtefatoDetalheModal artefato={artefato} onClose={() => setArtefato(null)} />
      <MapaRiscoModal open={mapaRisco} onClose={() => setMapaRisco(false)} />
      <CadastroItensModal open={itensOpen} onClose={() => setItensOpen(false)} />

      {/* Drawer de análise com IA */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[rgba(9,21,44,0.4)]" onClick={() => setChatOpen(false)} />
          <div className="relative flex w-full max-w-md flex-col bg-white shadow-[var(--shadow-pop)]">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#22b8a6_0%,#3b5bd0_60%,#7b3ff0_100%)] text-white">
                  <Sparkles size={15} />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-[#183263]">Analisar com IA</p>
                  <p className="text-[11px] text-[var(--color-muted)]">Processo N.º {proc.numero}</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-muted)] hover:bg-[#f4f7fc]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#eef3fb] p-5">
              <AiBubble>Como posso ajudá-lo a analisar este processo hoje?</AiBubble>
            </div>

            <div className="border-t border-[var(--color-line)] p-4">
              <div className="rounded-[16px] border border-[var(--color-line)] bg-white p-3">
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
      )}
    </div>
  )
}
