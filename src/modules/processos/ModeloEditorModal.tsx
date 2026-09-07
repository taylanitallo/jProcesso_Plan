import { useState } from 'react'
import { FileText, Search, Tag } from 'lucide-react'
import { SyncfusionEditorModal } from '../../components/common/SyncfusionEditorModal'
import { MODELO_TERMOS } from '../../mocks'

const MODELO_DOC_URL = '/modelos/termo-referencia.docx'

/**
 * Editor de Modelo Personalizado — Syncfusion EJ2 Document Editor (mesmo
 * editor de todo o sistema) + painel lateral "Termos SollAI".
 */
export function ModeloEditorModal({
  modelo,
  onClose,
}: {
  modelo: string | null
  onClose: () => void
}) {
  const [busca, setBusca] = useState('')

  if (!modelo) return null

  const termos = MODELO_TERMOS.filter(
    (t) =>
      t.tag.toLowerCase().includes(busca.toLowerCase()) ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()),
  )

  const painel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 bg-[linear-gradient(135deg,#22b8a6_0%,#1f8fbf_100%)] px-4 py-4 text-white">
        <FileText size={20} />
        <span className="font-display text-sm font-extrabold uppercase leading-tight">{modelo}</span>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        <Tag size={14} /> Termos SollAI
      </div>

      <div className="relative m-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar tag"
          className="gt-input !py-2 !pl-9 text-xs"
        />
      </div>

      <ul className="flex-1 overflow-y-auto px-3 pb-3">
        {termos.map((t) => (
          <li key={t.tag}>
            <div className="flex items-start gap-2 rounded-[var(--radius-control)] px-2 py-2">
              <Tag size={13} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-[var(--color-ink)]">
                  [**{t.tag}**]
                </span>
                <span className="block truncate text-[11px] text-[var(--color-muted)]">
                  {t.descricao}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--color-line)] px-4 py-3 text-[11px] text-[var(--color-muted)]">
        Copie e cole o marcador no documento onde o dado deve entrar.
      </p>
    </div>
  )

  return (
    <SyncfusionEditorModal
      titulo={modelo}
      docUrl={MODELO_DOC_URL}
      painel={painel}
      onClose={onClose}
    />
  )
}
