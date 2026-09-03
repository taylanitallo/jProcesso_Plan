import { useState } from 'react'
import { FileText, Plus, Search, UploadCloud } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from '../processos/processosLinks'
import { NORMATIVAS } from '../../mocks'

export function NormativaPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const list = NORMATIVAS.filter((n) => n.nome.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex min-h-[calc(100vh-8rem)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
      <aside className="flex w-[340px] shrink-0 flex-col border-r border-[var(--color-line)] p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#183263]">Normativas</h2>
            <p className="text-xs text-[var(--color-muted)]">Envie suas normativas para a IA utilizar</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            aria-label="Nova normativa"
            className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#22b8a6_0%,#1f8fbf_100%)] text-white"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="relative mt-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar normativas..."
            className="gt-input !py-2 !pl-9 text-xs"
          />
        </div>

        <p className="mt-3 text-xs text-[var(--color-muted)]">{list.length} normas enviadas</p>

        <ul className="mt-2 flex-1 space-y-1 overflow-y-auto">
          {list.map((n) => (
            <li key={n.id}>
              <button className="flex w-full items-start gap-3 rounded-[10px] px-2 py-2.5 text-left hover:bg-[var(--color-primary-soft)]">
                <FileText size={16} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                <span className="min-w-0">
                  <span className="line-clamp-1 text-[13px] text-[var(--color-ink)]">{n.nome}</span>
                  <Badge tone="success">{n.status}</Badge>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 bg-[#eef3fb]" />

      <Modal open={open} onClose={() => setOpen(false)} title="Envie a sua Normativa.">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-control)] border-2 border-dashed border-[#c9d6ea] bg-[#f7f9fc] px-4 py-10 text-center">
          <UploadCloud size={28} className="text-[var(--color-muted)]" />
          <span className="text-sm font-semibold text-[var(--color-primary-strong)]">Selecionar Arquivo</span>
          <span className="text-xs text-[var(--color-muted)]">Limite de arquivos até 800 MB.</span>
          <input type="file" className="hidden" />
        </label>
        <Button className="mt-4" fullWidth onClick={() => setOpen(false)}>
          Enviar
        </Button>
      </Modal>
    </div>
  )
}
