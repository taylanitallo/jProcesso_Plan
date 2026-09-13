import { useState } from 'react'
import { DatabaseBackup, ExternalLink, FileText, Plus, Search, Trash2, UploadCloud } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from '../processos/processosLinks'
import { useNormativas } from '../../store/normativas'

/** Sobe o anexo pro dev-server; devolve a URL relativa ou null. */
async function enviarAnexo(file: File): Promise<string | null> {
  try {
    const res = await fetch('/__upload', {
      method: 'POST',
      headers: { 'x-file-name': encodeURIComponent(file.name) },
      body: file,
    })
    if (!res.ok) return null
    const json = (await res.json()) as { url?: string }
    return json.url ?? null
  } catch {
    return null
  }
}

export function NormativaPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const normativas = useNormativas((s) => s.normativas)
  const adicionar = useNormativas((s) => s.adicionar)
  const remover = useNormativas((s) => s.remover)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selId, setSelId] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)

  const list = normativas.filter((n) => n.nome.toLowerCase().includes(query.toLowerCase()))
  const atual = normativas.find((n) => n.id === selId) ?? null

  const enviar = async () => {
    if (!arquivo) return
    setEnviando(true)
    const url = await enviarAnexo(arquivo)
    setEnviando(false)
    adicionar({ nome: arquivo.name, arquivoUrl: url ?? '' })
    setArquivo(null)
    setOpen(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
      <aside className="flex w-[340px] shrink-0 flex-col border-r border-[var(--color-line)] p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--color-indigo-soft)] text-[var(--color-indigo)]">
              <DatabaseBackup size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-[#183263]">Normativas</h2>
              <p className="text-xs text-[var(--color-muted)]">Envie suas normativas para a IA utilizar</p>
            </div>
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
            <li key={n.id} className="group flex items-center gap-1">
              <button
                onClick={() => setSelId(n.id)}
                className={`flex flex-1 items-start gap-3 rounded-[10px] px-2 py-2.5 text-left ${
                  selId === n.id ? 'bg-[var(--color-primary-soft)]' : 'hover:bg-[var(--color-primary-soft)]'
                }`}
              >
                <FileText size={16} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                <span className="min-w-0">
                  <span className="line-clamp-1 text-[13px] text-[var(--color-ink)]">{n.nome}</span>
                  <Badge tone="success">{n.status}</Badge>
                </span>
              </button>
              <button
                onClick={() => {
                  remover(n.id)
                  if (selId === n.id) setSelId(null)
                }}
                aria-label="Excluir normativa"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-control)] text-[var(--color-muted)] opacity-0 transition group-hover:opacity-100 hover:text-[var(--color-danger)]"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 bg-[#eef3fb] p-6">
        {atual ? (
          <div className="max-w-xl rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                <FileText size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="break-words font-display text-base font-bold text-[#183263]">
                  {atual.nome}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">Enviada em {atual.criadoEm}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Badge tone="success">{atual.status}</Badge>
              {atual.arquivoUrl && (
                <a
                  href={atual.arquivoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]"
                >
                  <ExternalLink size={13} /> Abrir arquivo
                </a>
              )}
            </div>
            <p className="mt-4 text-xs text-[var(--color-muted)]">
              A IA usa esta normativa como referência ao gerar e analisar documentos.
            </p>
          </div>
        ) : (
          <EmptyState icon={FileText} title="Selecione uma normativa" subtitle="Escolha um item na lista para ver os detalhes." />
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Envie a sua Normativa.">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-control)] border-2 border-dashed border-[#c9d6ea] bg-[#f7f9fc] px-4 py-10 text-center">
          <UploadCloud size={28} className="text-[var(--color-muted)]" />
          <span className="text-sm font-semibold text-[var(--color-primary-strong)]">
            {arquivo ? arquivo.name : 'Selecionar Arquivo'}
          </span>
          <span className="text-xs text-[var(--color-muted)]">Limite de arquivos até 800 MB.</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          />
        </label>
        <Button className="mt-4" fullWidth disabled={!arquivo || enviando} onClick={enviar}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </Button>
      </Modal>
    </div>
  )
}
