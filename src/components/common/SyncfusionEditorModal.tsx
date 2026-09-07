import { Suspense, lazy } from 'react'
import { FileText, X } from 'lucide-react'

/** Documento de exemplo servido estaticamente pelo Vite (public/modelos). */
export const DOC_EXEMPLO_URL = '/modelos/termo-referencia.docx'

// Editor pesado — só carrega quando o modal abre.
const SyncfusionEditor = lazy(() => import('./SyncfusionEditor'))

/**
 * Modal de tela cheia com o Syncfusion EJ2 Document Editor.
 * `titulo` nulo = fechado. `docUrl` opcional — usa o modelo de exemplo.
 */
export function SyncfusionEditorModal({
  titulo,
  docUrl = DOC_EXEMPLO_URL,
  painel,
  onClose,
}: {
  titulo: string | null
  docUrl?: string
  /** Painel lateral direito opcional (status do artefato, botões, etc.). */
  painel?: React.ReactNode
  onClose: () => void
}) {
  if (!titulo) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#f1f3f7]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-2.5">
        <span className="inline-flex items-center gap-2 font-display text-sm font-bold text-[#183263]">
          <FileText size={16} className="text-[var(--color-primary-strong)]" /> {titulo}
        </span>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-muted)] hover:bg-[#f4f7fc]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <Suspense
            fallback={
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-primary)]" />
                <p className="text-sm text-[var(--color-muted)]">Carregando o editor de documentos…</p>
              </div>
            }
          >
            <SyncfusionEditor titulo={titulo} docUrl={docUrl} />
          </Suspense>
        </div>

        {painel && (
          <aside className="w-80 shrink-0 overflow-y-auto border-l border-[var(--color-line)] bg-white">
            {painel}
          </aside>
        )}
      </div>
    </div>
  )
}
