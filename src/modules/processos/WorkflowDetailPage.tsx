import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Minus, Move, Plus, Settings } from 'lucide-react'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ControleGeralModal } from './ControleGeralModal'
import { NodeConfigModal } from './NodeConfigModal'
import { WORKFLOW_NODES, WORKFLOW_NODE_CHIPS } from '../../mocks'

const NODE_W = 280
const COL_GAP = 320
const ROW_GAP = 230
const COLS = 4

type Pos = { x: number; y: number }

export function WorkflowDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const { id } = useParams()
  const [zoom, setZoom] = useState(100)
  const [controle, setControle] = useState(false)
  const [configNode, setConfigNode] = useState<string | null>(null)

  const initial = useMemo(() => {
    const map: Record<string, Pos> = {}
    WORKFLOW_NODES.forEach((n, i) => {
      map[n] = { x: 24 + (i % COLS) * COL_GAP, y: 24 + Math.floor(i / COLS) * ROW_GAP }
    })
    return map
  }, [])
  const [positions, setPositions] = useState<Record<string, Pos>>(initial)

  const drag = useRef<{
    node: string
    startX: number
    startY: number
    origX: number
    origY: number
    moved: boolean
  } | null>(null)
  const scale = zoom / 100

  const onPointerDown = (e: React.PointerEvent, node: string) => {
    if ((e.target as HTMLElement).closest('[data-chip]')) return
    e.preventDefault()
    const p = positions[node]
    drag.current = {
      node,
      startX: e.clientX,
      startY: e.clientY,
      origX: p.x,
      origY: p.y,
      moved: false,
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

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

  const canvasSize = useMemo(() => {
    const maxX = Math.max(...Object.values(positions).map((p) => p.x)) + NODE_W + 40
    const maxY = Math.max(...Object.values(positions).map((p) => p.y)) + 200
    return { w: maxX, h: maxY }
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
          <div>
            <h1 className="font-display text-base font-bold text-[#183263]">Modelos do Fluxo</h1>
            <p className="text-[11px] text-[var(--color-muted)]">Fluxo #{id}</p>
          </div>
          <button
            onClick={() => setControle(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-strong)]"
          >
            <Settings size={15} /> Controle geral
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-2 text-xs text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Move size={13} /> {WORKFLOW_NODES.length} nós • 0 conexões · arraste para reorganizar
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="grid h-7 w-7 place-items-center rounded-[8px] border border-[var(--color-line)]"
            >
              <Minus size={13} />
            </button>
            <span className="w-10 text-center font-semibold text-[var(--color-ink)]">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="grid h-7 w-7 place-items-center rounded-[8px] border border-[var(--color-line)]"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] min-h-[520px] overflow-auto bg-[repeating-linear-gradient(0deg,transparent,transparent_23px,#eef2f8_24px),repeating-linear-gradient(90deg,transparent,transparent_23px,#eef2f8_24px)] p-4">
          <div
            className="relative"
            style={{
              width: canvasSize.w * scale,
              height: canvasSize.h * scale,
            }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              {WORKFLOW_NODES.map((node) => {
                const p = positions[node]
                return (
                  <div
                    key={node}
                    onPointerDown={(e) => onPointerDown(e, node)}
                    style={{ left: p.x, top: p.y, width: NODE_W }}
                    className="absolute cursor-grab touch-none select-none rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)] active:cursor-grabbing"
                  >
                    <p className="mb-2 font-display text-sm font-bold text-[#183263]">{node}</p>
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
                    <p className="mt-2 text-[10px] text-[var(--color-muted)]">
                      Clique para configurar
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <ControleGeralModal open={controle} onClose={() => setControle(false)} />
      <NodeConfigModal node={configNode} onClose={() => setConfigNode(null)} />
    </div>
  )
}
