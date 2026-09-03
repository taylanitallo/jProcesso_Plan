import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronLeft, Minus, Move, Plus, Settings } from 'lucide-react'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ControleGeralModal } from './ControleGeralModal'
import { NodeConfigModal } from './NodeConfigModal'
import { AdicionarArtefatoModal } from './AdicionarArtefatoModal'
import { WORKFLOW_NODES, WORKFLOW_NODE_CHIPS, WORKFLOWS } from '../../mocks'

const NODE_W = 280
const COL_GAP = 320
const ROW_GAP = 230
const COLS = 4

type Pos = { x: number; y: number }

const gridFor = (list: string[]): Record<string, Pos> => {
  const map: Record<string, Pos> = {}
  list.forEach((n, i) => {
    map[n] = { x: 24 + (i % COLS) * COL_GAP, y: 24 + Math.floor(i / COLS) * ROW_GAP }
  })
  return map
}

export function WorkflowDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const { id } = useParams()

  const current = WORKFLOWS.find((w) => w.id === id)
  const nomeOriginal = current?.nome ?? 'Novo fluxo'
  const [fluxoNome, setFluxoNome] = useState(nomeOriginal)
  const nomeAlterado = fluxoNome.trim() !== nomeOriginal && fluxoNome.trim() !== ''

  const [nodes, setNodes] = useState<string[]>(WORKFLOW_NODES)
  const [positions, setPositions] = useState<Record<string, Pos>>(() => gridFor(WORKFLOW_NODES))
  const [zoom, setZoom] = useState(100)
  const [controle, setControle] = useState(false)
  const [configNode, setConfigNode] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const drag = useRef<{
    node: string
    startX: number
    startY: number
    origX: number
    origY: number
    moved: boolean
  } | null>(null)
  const scale = zoom / 100

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = (e.clientX - d.startX) / scale
    const dy = (e.clientY - d.startY) / scale
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true
    setPositions((prev) => ({
      ...prev,
      [d.node]: { x: Math.max(0, d.origX + dx), y: Math.max(0, d.origY + dy) },
    }))
  }
  const onPointerUp = () => {
    const d = drag.current
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    if (d && !d.moved) setConfigNode(d.node)
    drag.current = null
  }
  const onPointerDown = (e: React.PointerEvent, node: string) => {
    if ((e.target as HTMLElement).closest('[data-chip]')) return
    e.preventDefault()
    const p = positions[node]
    drag.current = { node, startX: e.clientX, startY: e.clientY, origX: p.x, origY: p.y, moved: false }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const organizar = () => setPositions(gridFor(nodes))

  const addArtefato = (nome: string, afterIndex: number) => {
    setNodes((prev) => {
      const next = [...prev]
      next.splice(afterIndex + 1, 0, nome)
      setPositions(gridFor(next))
      return next
    })
  }

  const canvasSize = useMemo(() => {
    const xs = Object.values(positions).map((p) => p.x)
    const ys = Object.values(positions).map((p) => p.y)
    return { w: Math.max(...xs, 0) + NODE_W + 40, h: Math.max(...ys, 0) + 210 }
  }, [positions])

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
            <Move size={13} /> {nodes.length} nós • 0 conexões
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
            className="font-semibold text-[var(--color-primary)] disabled:cursor-not-allowed disabled:text-[var(--color-muted)]"
          >
            Salvar nome
          </button>
          <button onClick={organizar} className="font-semibold text-[var(--color-primary)]">
            Organizar ordem
          </button>
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
              {nodes.map((node, i) => {
                const p = positions[node] ?? { x: 24, y: 24 }
                return (
                  <div
                    key={node}
                    onPointerDown={(e) => onPointerDown(e, node)}
                    style={{ left: p.x, top: p.y, width: NODE_W }}
                    title="Artefato ativo — Exigido nos processos deste fluxo"
                    className="absolute cursor-grab touch-none select-none rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4 pb-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)] active:cursor-grabbing"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full border border-[#bcd0ee] bg-[var(--color-primary-soft)] text-[10px] font-bold text-[var(--color-primary-strong)]">
                        {i + 1}
                      </span>
                      <p className="truncate font-display text-sm font-bold text-[#183263]">{node}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {WORKFLOW_NODE_CHIPS.map((chip) => (
                        <span
                          key={chip}
                          data-chip
                          className="rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    <span className="absolute bottom-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-[#e4f4ec] text-[var(--color-success)]">
                      <Check size={12} />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <ControleGeralModal open={controle} onClose={() => setControle(false)} />
      <NodeConfigModal node={configNode} onClose={() => setConfigNode(null)} />
      <AdicionarArtefatoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        nodes={nodes}
        onAdd={addArtefato}
      />
    </div>
  )
}
