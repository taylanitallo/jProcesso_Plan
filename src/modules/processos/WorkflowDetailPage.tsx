import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Minus, Plus, Settings } from 'lucide-react'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ControleGeralModal } from './ControleGeralModal'
import { WORKFLOW_NODES, WORKFLOW_NODE_CHIPS } from '../../mocks'

export function WorkflowDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const { id } = useParams()
  const [zoom, setZoom] = useState(100)
  const [controle, setControle] = useState(false)
  const [active, setActive] = useState<Record<string, Set<string>>>({})

  const toggleChip = (node: string, chip: string) =>
    setActive((prev) => {
      const set = new Set(prev[node] ?? [])
      if (set.has(chip)) set.delete(chip)
      else set.add(chip)
      return { ...prev, [node]: set }
    })

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
          <span>
            {WORKFLOW_NODES.length} nós • 0 conexões
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

        <div
          className="min-h-[520px] overflow-auto bg-[repeating-linear-gradient(0deg,transparent,transparent_23px,#eef2f8_24px),repeating-linear-gradient(90deg,transparent,transparent_23px,#eef2f8_24px)] p-6"
        >
          <div
            className="flex flex-wrap gap-4"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          >
            {WORKFLOW_NODES.map((node) => (
              <div
                key={node}
                className="w-72 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]"
              >
                <p className="mb-2 font-display text-sm font-bold text-[#183263]">{node}</p>
                <div className="flex flex-wrap gap-1.5">
                  {WORKFLOW_NODE_CHIPS.map((chip) => {
                    const on = active[node]?.has(chip)
                    return (
                      <button
                        key={chip}
                        onClick={() => toggleChip(node, chip)}
                        className={`rounded-[var(--radius-pill)] border px-2.5 py-1 text-[11px] font-semibold transition ${
                          on
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                            : 'border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                        }`}
                      >
                        {chip}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ControleGeralModal open={controle} onClose={() => setControle(false)} />
    </div>
  )
}
