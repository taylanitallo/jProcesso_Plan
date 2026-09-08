import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronLeft, Minus, Move, Plus, Settings } from 'lucide-react'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ControleGeralModal } from './ControleGeralModal'
import { NodeConfigModal } from './NodeConfigModal'
import { AdicionarArtefatoModal } from './AdicionarArtefatoModal'
import { PrimeiraVezModal } from './PrimeiraVezModal'
import { useWorkflows } from '../../store/workflows'

const NODE_W = 280
const NODE_H = 160
const COL_GAP = 320
const ROW_GAP = 230
const COLS = 4

type Pos = { x: number; y: number }

const gridPos = (i: number): Pos => ({
  x: 24 + (i % COLS) * COL_GAP,
  y: 24 + Math.floor(i / COLS) * ROW_GAP,
})

/** Índice do slot da grade mais próximo de uma posição solta em modo "Organizar ordem". */
const slotIndexFor = (pos: Pos, count: number) => {
  const col = Math.round((pos.x - 24) / COL_GAP)
  const row = Math.round((pos.y - 24) / ROW_GAP)
  const idx = row * COLS + col
  return Math.max(0, Math.min(count - 1, idx))
}

/** Caminho em cotovelo (com seta) do rodapé do nó-dependência até o rodapé do nó dependente. */
const elbowPath = (src: Pos, dst: Pos) => {
  const sx = src.x + NODE_W / 2
  const sy = src.y + NODE_H
  const tx = dst.x + NODE_W / 2
  const ty = dst.y + NODE_H
  const midY = Math.max(sy, ty) + 20
  return `M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`
}

export function WorkflowDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const { id } = useParams()

  const wf = useWorkflows((s) => s.workflows.find((w) => w.id === id))
  const renomear = useWorkflows((s) => s.renomear)
  const reordenarNos = useWorkflows((s) => s.reordenarNos)
  const adicionarNo = useWorkflows((s) => s.adicionarNo)

  const nosRef = wf?.nos
  const nodesFromStore = useMemo(() => nosRef?.map((n) => n.nome) ?? [], [nosRef])

  const [fluxoNome, setFluxoNome] = useState(wf?.nome ?? '')
  const [overrides, setOverrides] = useState<Record<string, Pos>>({})
  const [zoom, setZoom] = useState(100)
  const [controle, setControle] = useState(false)
  const [configNode, setConfigNode] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [primeiraVez, setPrimeiraVez] = useState(true)

  // modo "Organizar ordem"
  const [ordenando, setOrdenando] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [draftNodes, setDraftNodes] = useState<string[]>([])

  const nodes = ordenando ? draftNodes : nodesFromStore

  /** Posição efetiva de cada nó: override manual do drag, senão slot da grade pelo índice. */
  const positions = useMemo(() => {
    const map: Record<string, Pos> = {}
    nodes.forEach((n, i) => {
      map[n] = overrides[n] ?? gridPos(i)
    })
    return map
  }, [nodes, overrides])

  const drag = useRef<{
    node: string
    startX: number
    startY: number
    origX: number
    origY: number
    curX: number
    curY: number
    moved: boolean
  } | null>(null)
  const scale = zoom / 100

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = (e.clientX - d.startX) / scale
    const dy = (e.clientY - d.startY) / scale
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      d.moved = true
      if (ordenando) setDirty(true)
    }
    const x = Math.max(0, d.origX + dx)
    const y = Math.max(0, d.origY + dy)
    d.curX = x
    d.curY = y
    setOverrides((prev) => ({ ...prev, [d.node]: { x, y } }))
  }
  const onPointerUp = () => {
    const d = drag.current
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    if (!d) return
    if (!d.moved && !ordenando) {
      setConfigNode(d.node)
    } else if (d.moved && ordenando) {
      const dropPos = { x: d.curX, y: d.curY }
      setDraftNodes((prev) => {
        const targetIndex = slotIndexFor(dropPos, prev.length)
        const from = prev.indexOf(d.node)
        if (from === -1 || from === targetIndex) return prev
        const next = [...prev]
        next.splice(from, 1)
        next.splice(targetIndex, 0, d.node)
        return next
      })
      setOverrides({})
    }
    drag.current = null
  }
  const onPointerDown = (e: React.PointerEvent, node: string) => {
    if ((e.target as HTMLElement).closest('[data-chip]')) return
    e.preventDefault()
    const p = positions[node] ?? gridPos(0)
    drag.current = {
      node,
      startX: e.clientX,
      startY: e.clientY,
      origX: p.x,
      origY: p.y,
      curX: p.x,
      curY: p.y,
      moved: false,
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const iniciarOrganizar = () => {
    setDraftNodes(nodesFromStore)
    setOverrides({})
    setDirty(false)
    setOrdenando(true)
  }
  const cancelarOrganizar = () => {
    setOverrides({})
    setDirty(false)
    setOrdenando(false)
  }
  const salvarOrdem = () => {
    if (wf) reordenarNos(wf.id, draftNodes)
    setOverrides({})
    setDirty(false)
    setOrdenando(false)
  }

  const canvasSize = useMemo(() => {
    const xs = Object.values(positions).map((p) => p.x)
    const ys = Object.values(positions).map((p) => p.y)
    return { w: Math.max(...xs, 0) + NODE_W + 40, h: Math.max(...ys, 0) + 210 }
  }, [positions])

  /** Dependências por nó (config do próprio fluxo). */
  const depsMap = useMemo(() => {
    const m: Record<string, string[]> = {}
    nosRef?.forEach((no) => {
      if (no.config.deps.length) m[no.nome] = no.config.deps
    })
    return m
  }, [nosRef])

  /** Conectores (fios) desenhados entre um nó e cada dependência que ele exige. */
  const conexoes = useMemo(() => {
    const set = new Set(nodes)
    const list: { key: string; d: string }[] = []
    for (const node of nodes) {
      const deps = depsMap[node]
      if (!deps) continue
      for (const dep of deps) {
        if (!set.has(dep) || !positions[dep] || !positions[node]) continue
        list.push({ key: `${dep}->${node}`, d: elbowPath(positions[dep], positions[node]) })
      }
    }
    return list
  }, [nodes, positions, depsMap])

  if (!wf) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Link
          to="/ProcessosWorkflow"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
        >
          <ChevronLeft size={15} /> Fluxos de Processos
        </Link>
        <p className="text-sm text-[var(--color-muted)]">Fluxo não encontrado.</p>
      </div>
    )
  }

  const nomeAlterado = fluxoNome.trim() !== wf.nome && fluxoNome.trim() !== ''

  const addArtefato = (nome: string, afterIndex: number, icone: string) => {
    adicionarNo(wf.id, nome, afterIndex, icone)
  }

  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/ProcessosWorkflow"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
      >
        <ChevronLeft size={15} /> Fluxos de Processos
      </Link>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
          <h1 className="font-display text-base font-bold text-[#183263]">Modelos do Fluxo</h1>
          <button
            onClick={() => setControle(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-strong)]"
          >
            <Settings size={15} /> Controle geral
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] px-5 py-2 text-xs text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Move size={13} />{' '}
            {ordenando
              ? `Arraste os cards para reorganizar${dirty ? ' • alterações não salvas' : ''}`
              : `${nodes.length} nós • ${conexoes.length} conexões`}
          </span>
          <label className="flex items-center gap-2">
            <span className="sr-only">Nome do fluxo</span>
            <input
              value={fluxoNome}
              onChange={(e) => setFluxoNome(e.target.value)}
              placeholder="Nome do fluxo"
              className="gt-input h-8 w-56 min-w-0 text-xs"
            />
          </label>
          <button
            disabled={!nomeAlterado}
            onClick={() => renomear(wf.id, fluxoNome)}
            className="font-semibold text-[var(--color-primary)] disabled:cursor-not-allowed disabled:text-[var(--color-muted)]"
          >
            Salvar nome
          </button>

          {ordenando ? (
            <>
              <button onClick={cancelarOrganizar} className="font-semibold text-[var(--color-muted)]">
                Cancelar
              </button>
              <button
                onClick={salvarOrdem}
                className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-3 py-1.5 font-semibold text-white"
              >
                Salvar ordem
              </button>
            </>
          ) : (
            <button onClick={iniciarOrganizar} className="font-semibold text-[var(--color-primary)]">
              Organizar ordem
            </button>
          )}

          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-3 py-1.5 font-semibold text-white"
          >
            <Plus size={13} /> Adicionar artefato
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="grid h-7 w-7 place-items-center rounded-[8px] border border-[var(--color-line)]"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => setZoom(100)}
              title="Redefinir zoom"
              className="w-12 text-center font-semibold text-[var(--color-ink)]"
            >
              {zoom}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="grid h-7 w-7 place-items-center rounded-[8px] border border-[var(--color-line)]"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] min-h-[520px] overflow-auto bg-[repeating-linear-gradient(0deg,transparent,transparent_23px,#eef2f8_24px),repeating-linear-gradient(90deg,transparent,transparent_23px,#eef2f8_24px)] p-4">
          <div className="relative" style={{ width: canvasSize.w * scale, height: canvasSize.h * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <svg
                className="pointer-events-none absolute left-0 top-0"
                width={canvasSize.w}
                height={canvasSize.h}
              >
                <defs>
                  <marker
                    id="conexao-seta"
                    markerWidth="8"
                    markerHeight="8"
                    refX="4"
                    refY="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-primary)" />
                  </marker>
                </defs>
                {conexoes.map((c) => (
                  <path
                    key={c.key}
                    d={c.d}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    markerEnd="url(#conexao-seta)"
                  />
                ))}
              </svg>
              {nodes.map((node, i) => {
                const p = positions[node] ?? gridPos(i)
                const cfg = wf.nos.find((n) => n.nome === node)?.config
                const deps = cfg?.deps ?? []
                const inativo = cfg ? !cfg.ativo : false
                const chips: string[] = []
                if (cfg?.prazoAtivo) chips.push('Prazo')
                if (cfg?.revisao) chips.push('Revisão')
                if (cfg?.aprovacao) chips.push('Aprovação')
                if (cfg?.assinatura) chips.push('Assinatura')
                return (
                  <div
                    key={node}
                    onPointerDown={(e) => onPointerDown(e, node)}
                    style={{ left: p.x, top: p.y, width: NODE_W }}
                    title={
                      inativo
                        ? 'Artefato inativo — não exigido nos processos deste fluxo'
                        : 'Artefato ativo — Exigido nos processos deste fluxo'
                    }
                    className={`absolute cursor-grab touch-none select-none rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4 pb-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)] active:cursor-grabbing ${
                      inativo ? 'opacity-55' : ''
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full border border-[#bcd0ee] bg-[var(--color-primary-soft)] text-[10px] font-bold text-[var(--color-primary-strong)]">
                        {i + 1}
                      </span>
                      <p className="truncate font-display text-sm font-bold text-[#183263]">{node}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {chips.length ? (
                        chips.map((chip) => (
                          <span
                            key={chip}
                            data-chip
                            className="rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted)]"
                          >
                            {chip}
                          </span>
                        ))
                      ) : (
                        <span
                          data-chip
                          className="rounded-[var(--radius-pill)] border border-dashed border-[var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted)]"
                        >
                          Sem regras
                        </span>
                      )}
                      {deps.length ? (
                        <span
                          data-chip
                          className="group relative rounded-[var(--radius-pill)] border border-[#a7dcc4] bg-[#e4f4ec] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-success)]"
                        >
                          Dependências ({deps.length})
                          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-52 -translate-x-1/2 rounded-[10px] bg-[var(--color-primary)] p-3 text-left text-[11px] font-normal text-white shadow-[var(--shadow-pop)] group-hover:block">
                            <span className="font-bold">Depende de:</span>
                            <ul className="mt-1 list-disc space-y-0.5 pl-4">
                              {deps.map((d) => (
                                <li key={d}>{d}</li>
                              ))}
                            </ul>
                          </span>
                        </span>
                      ) : (
                        <span
                          data-chip
                          className="rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted)]"
                        >
                          Independente
                        </span>
                      )}
                    </div>
                    {inativo ? (
                      <span className="absolute bottom-2 right-2 rounded-[var(--radius-pill)] bg-[#eef2f8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                        Inativo
                      </span>
                    ) : (
                      <span className="absolute bottom-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-[#e4f4ec] text-[var(--color-success)]">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {primeiraVez && (
        <PrimeiraVezModal total={nodes.length} onDone={() => setPrimeiraVez(false)} />
      )}
      <ControleGeralModal open={controle} workflowId={wf.id} onClose={() => setControle(false)} />
      {configNode && (
        <NodeConfigModal
          key={configNode}
          workflowId={wf.id}
          node={configNode}
          onClose={() => setConfigNode(null)}
        />
      )}
      <AdicionarArtefatoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        nodes={nodes}
        onAdd={addArtefato}
      />
    </div>
  )
}
