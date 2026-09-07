import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AlertTriangle, FileText, Search, Tag, X } from 'lucide-react'
import { MODELO_TERMOS } from '../../mocks'

/**
 * Mesmo editor do SollAI: ONLYOFFICE Docs, carregado de um Document Server
 * próprio (self-hosted). Ver docs/onlyoffice.md para subir o servidor.
 */
const ONLYOFFICE_SERVER_URL = 'http://localhost:8082'
const DOC_URL = 'http://host.docker.internal:5175/modelos/termo-referencia.docx'

type DocsApi = {
  DocEditor: new (
    id: string,
    config: Record<string, unknown>,
  ) => { destroyEditor: () => void }
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

/** Retorna uma função com identidade estável entre renders (evita quebrar React.memo). */
function useStableCallback<A extends unknown[]>(fn: (...args: A) => void) {
  const ref = useRef(fn)
  useLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: A) => ref.current(...args), [])
}

/**
 * DocsAPI substitui o `<div id={containerId}>` por um iframe assim que o editor
 * carrega — o React não pode saber disso. Se este componente re-renderizasse
 * depois do mount (por causa do estado "loading"/"pronto" do pai, por ex.),
 * a reconciliação tentaria mexer num nó que já não está mais ali e quebrava
 * com "insertBefore: not a child of this node". `memo` mantém este componente
 * congelado (nunca re-renderiza) enquanto `modelo` não mudar.
 */
const OnlyOfficeEditor = memo(function OnlyOfficeEditor({
  modelo,
  containerId,
  onReady,
  onError,
}: {
  modelo: string
  containerId: string
  onReady: () => void
  onError: () => void
}) {
  useEffect(() => {
    let cancelled = false
    let instance: { destroyEditor: () => void } | null = null

    loadOnlyOfficeScript()
      .then(() => {
        if (cancelled || !window.DocsAPI) return
        const key = `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
        instance = new window.DocsAPI.DocEditor(containerId, {
          documentType: 'word',
          document: {
            fileType: 'docx',
            key,
            title: `${modelo}.docx`,
            url: DOC_URL,
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
  }, [modelo, containerId])

  return <div id={containerId} className="h-full w-full" />
})

export function ModeloEditorModal({
  modelo,
  onClose,
}: {
  modelo: string | null
  onClose: () => void
}) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'erro'>('loading')
  const containerId = useId().replace(/[^\w-]/g, '') || 'onlyoffice-editor'

  const onReady = useStableCallback(() => setStatus('ready'))
  const onError = useStableCallback(() => setStatus('erro'))

  if (!modelo) return null

  const termos = MODELO_TERMOS.filter(
    (t) =>
      t.tag.toLowerCase().includes(busca.toLowerCase()) ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f1f3f7]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-2.5">
        <span className="inline-flex items-center gap-2 font-display text-sm font-bold text-[#183263]">
          <FileText size={16} className="text-[var(--color-primary-strong)]" /> {modelo}
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
                  servidor local (ver <code className="rounded bg-[#e6e9ef] px-1">docs/onlyoffice.md</code>)
                  e reabra o modelo.
                </p>
              </>
            )}
          </div>

          <OnlyOfficeEditor
            modelo={modelo}
            containerId={containerId}
            onReady={onReady}
            onError={onError}
          />
        </div>

        {/* Painel TERMOS SOLLAI */}
        <aside className="flex w-80 shrink-0 flex-col border-l border-[var(--color-line)] bg-white">
          <div className="flex items-center gap-2 bg-[linear-gradient(135deg,#22b8a6_0%,#1f8fbf_100%)] px-4 py-4 text-white">
            <FileText size={20} />
            <span className="font-display text-sm font-extrabold uppercase leading-tight">
              {modelo}
            </span>
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
        </aside>
      </div>
    </div>
  )
}
