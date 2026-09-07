import { useEffect, useRef } from 'react'
import { L10n, registerLicense } from '@syncfusion/ej2-base'
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor'
import ptBR from '@syncfusion/ej2-locale/src/pt-BR.json'
// bundle completo (todos os componentes + fontes de ícones) — sem isso o
// editor renderiza com os ícones quebrados e o layout bugado.
import '@syncfusion/ej2/tailwind.css'

DocumentEditorContainerComponent.Inject(Toolbar)
L10n.load(ptBR)

// Chave de licença do Syncfusion (opcional). Sem ela o editor funciona,
// mas mostra o aviso de versão trial. Defina VITE_SYNCFUSION_LICENSE no .env.
const licenca = import.meta.env.VITE_SYNCFUSION_LICENSE as string | undefined
if (licenca) registerLicense(licenca)

/**
 * Editor de texto do sistema: Syncfusion EJ2 Document Editor — abre/edita
 * .docx 100% no navegador, sem servidor.
 */
export default function SyncfusionEditor({
  titulo,
  docUrl,
}: {
  titulo: string
  docUrl: string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null)

  useEffect(() => {
    let cancelado = false

    const resize = () => {
      const editor = containerRef.current
      const host = hostRef.current
      if (editor && host) editor.resize(host.clientWidth, host.clientHeight)
    }

    const abrir = async () => {
      const editor = containerRef.current
      if (!editor) return
      resize()
      try {
        const res = await fetch(docUrl)
        if (!res.ok) throw new Error(String(res.status))
        const blob = await res.blob()
        if (cancelado) return
        // O open() do Syncfusion só faz o parse client-side de .docx quando
        // recebe um File nomeado (usa a extensão pra detectar o formato) —
        // um Blob puro abre em branco.
        const file = new File([blob], `${titulo || 'documento'}.docx`, {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        editor.documentEditor.documentName = titulo
        editor.documentEditor.open(file)
      } catch {
        if (!cancelado) editor.documentEditor.openBlank()
      }
      resize()
    }

    const t = setTimeout(abrir, 60)
    const ro = new ResizeObserver(resize)
    if (hostRef.current) ro.observe(hostRef.current)
    window.addEventListener('resize', resize)

    return () => {
      cancelado = true
      clearTimeout(t)
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [docUrl, titulo])

  return (
    <div ref={hostRef} className="h-full w-full">
      <DocumentEditorContainerComponent
        ref={(r: DocumentEditorContainerComponent | null) => {
          containerRef.current = r
        }}
        locale="pt-BR"
        height="100%"
        enableToolbar
        serviceUrl=""
      />
    </div>
  )
}
