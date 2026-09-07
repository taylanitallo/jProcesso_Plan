import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AlertTriangle, FileText, X } from 'lucide-react'

/**
 * Editor de texto padrão de todo o sistema: ONLYOFFICE Docs, servido por um
 * Document Server próprio (self-hosted). Ver docs/onlyoffice.md para subir.
 */
export const ONLYOFFICE_SERVER_URL = 'http://localhost:8082'
/** Documento de exemplo servido estaticamente pelo Vite (public/modelos). */
export const DOC_EXEMPLO_URL = 'http://host.docker.internal:5175/modelos/termo-referencia.docx'

type DocsApi = {
  DocEditor: new (id: string, config: Record<string, unknown>) => { destroyEditor: () => void }
}
declare global {
  interface Window {
    DocsAPI?: DocsApi
  }
}

let scriptPromise: Promise<void> | null = null
function loadOnlyOfficeScript(): Promise<void> {
  if (window.DocsAPI) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `${ONLYOFFICE_SERVER_URL}/web-apps/apps/api/documents/api.js`
    s.onload = () => resolve()
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('offline'))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

/** Identidade estável entre renders — não quebra o React.memo do editor. */
function useStableCallback<A extends unknown[]>(fn: (...args: A) => void) {
  const ref = useRef(fn)
  useLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: A) => ref.current(...args), [])
}

/**
 * DocsAPI troca o `<div id={containerId}>` por um iframe assim que carrega — o
 * React não sabe disso. `memo` congela este componente (nunca re-renderiza
 * depois do mount) pra evitar "insertBefore: not a child of this node".
 */
const OnlyOfficeEditor = memo(function OnlyOfficeEditor({
  titulo,
  docUrl,
  containerId,
  onReady,
  onError,
}: {
  titulo: string
  docUrl: string
  containerId: string
  onReady: () => void
  onError: () => void
}) {
  useEffect(() => {
    let cancelled = false
    let instance: { destroyEditor: () => void } | null = null

    const ext = (docUrl.split('?')[0].split('.').pop() || 'docx').toLowerCase()
    const fileType = ['docx', 'doc', 'pdf', 'odt', 'rtf', 'txt'].includes(ext) ? ext : 'docx'
    const documentType = fileType === 'pdf' ? 'pdf' : 'word'

    loadOnlyOfficeScript()
      .then(() => {
        if (cancelled || !window.DocsAPI) return
        const key = `${titulo}-${Date.now()}`.replace(/[^\w-]/g, '').slice(0, 40)
        instance = new window.DocsAPI.DocEditor(containerId, {
          documentType,
          document: {
            fileType,
            key,
            title: `${titulo}.${fileType}`,
            url: docUrl,
            permissions: { edit: true, download: true, print: true, review: true },
          },
          editorConfig: {
            lang: 'pt-BR',
            mode: 'edit',
            customization: {
              autosave: false,
              forcesave: false,
              compactHeader: true,
              help: false,
              about: false,
            },
          },
          width: '100%',
          height: '100%',
          events: {
            onAppReady: () => !cancelled && onReady(),
            onError: (e: unknown) => {
              // eslint-disable-next-line no-console
              console.error('ONLYOFFICE onError', e)
              if (!cancelled) onError()
            },
          },
        })
      })
      .catch(() => !cancelled && onError())

    return () => {
      cancelled = true
      try {
        instance?.destroyEditor()
      } catch {
        // já destruído pelo próprio DocsAPI
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulo, docUrl, containerId])

  return <div id={containerId} className="h-full w-full" />
})

/**
 * Modal de tela cheia com o editor ONLYOFFICE. `titulo` nulo = fechado.
 * `docUrl` opcional — usa o documento de exemplo se omitido.
 */
export function OnlyOfficeEditorModal({
  titulo,
  docUrl = DOC_EXEMPLO_URL,
  onClose,
}: {
  titulo: string | null
  docUrl?: string
  onClose: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'erro'>('loading')
  const containerId = useId().replace(/[^\w-]/g, '') || 'onlyoffice-editor'

  const onReady = useStableCallback(() => setStatus('ready'))
  const onError = useStableCallback(() => setStatus('erro'))

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

      <div className="relative min-h-0 flex-1">
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#f1f3f7] p-8 text-center"
          style={{ display: status === 'ready' ? 'none' : 'flex' }}
        >
          {status === 'loading' ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-muted)]">Carregando o editor de documentos…</p>
            </>
          ) : (
            <>
              <AlertTriangle size={28} className="text-[var(--color-warning)]" />
              <p className="font-display text-sm font-bold text-[#183263]">
                Document Server indisponível
              </p>
              <p className="max-w-sm text-xs text-[var(--color-muted)]">
                Não foi possível conectar ao ONLYOFFICE Document Server em{' '}
                <code className="rounded bg-[#e6e9ef] px-1">{ONLYOFFICE_SERVER_URL}</code>. Suba o
                servidor local (ver{' '}
                <code className="rounded bg-[#e6e9ef] px-1">docs/onlyoffice.md</code>) e reabra o
                documento.
              </p>
            </>
          )}
        </div>

        <OnlyOfficeEditor
          titulo={titulo}
          docUrl={docUrl}
          containerId={containerId}
          onReady={onReady}
          onError={onError}
        />
      </div>
    </div>
  )
}
