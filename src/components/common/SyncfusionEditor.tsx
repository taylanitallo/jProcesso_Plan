import { useEffect, useRef } from 'react'
import { registerLicense } from '@syncfusion/ej2-base'
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor'
import '@syncfusion/ej2-react-documenteditor/styles/tailwind.css'

DocumentEditorContainerComponent.Inject(Toolbar)

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
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null)

  useEffect(() => {
    let cancelado = false
    const abrir = async () => {
      const editor = containerRef.current
      if (!editor) return
      try {
        const res = await fetch(docUrl)
        if (!res.ok) throw new Error(String(res.status))
        const blob = await res.blob()
        if (cancelado) return
        editor.documentEditor.open(blob)
        editor.documentEditor.documentName = titulo
      } catch {
        if (!cancelado) editor.documentEditor.openBlank()
      }
    }
    // dá um tick pro container terminar de montar
    const t = setTimeout(abrir, 0)
    return () => {
      cancelado = true
      clearTimeout(t)
    }
  }, [docUrl, titulo])

  return (
    <DocumentEditorContainerComponent
      ref={(r: DocumentEditorContainerComponent | null) => {
        containerRef.current = r
      }}
      height="100%"
      enableToolbar
      serviceUrl=""
    />
  )
}
