import { useEffect, useRef, useState } from 'react'
import suneditor from 'suneditor'
import type SunEditor from 'suneditor/src/lib/core'
import plugins from 'suneditor/src/plugins'
import ptBr from 'suneditor/src/lang/pt_br'
import 'suneditor/dist/css/suneditor.min.css'
import { Check, FileText, Save, Search, Tag, X } from 'lucide-react'
import { MODELO_TEMPLATE, MODELO_TERMOS } from '../../mocks'

const TAG_STYLE =
  'background:#fff2cc;border-radius:4px;padding:1px 6px;font-family:ui-monospace,Menlo,monospace;font-size:12px;font-weight:600;color:#8a6d1a'

const tagSpan = (t: string) => `<span style="${TAG_STYLE}">[**${t}**]</span>`

/** HTML inicial do documento a partir do modelo padrão de Termo de Referência. */
function templateHtml() {
  return MODELO_TEMPLATE.map((b) => {
    if (b.tipo === 'h1') return `<h1 style="text-align:center">${b.texto}</h1>`
    if (b.tipo === 'h2') return `<h3>${b.texto}</h3>`
    if (b.tipo === 'tag') return `<p style="padding-left:24px">${tagSpan(b.texto)}</p>`
    return `<p style="text-align:center">${b.texto}</p>`
  }).join('')
}

const BUTTON_LIST = [
  ['undo', 'redo'],
  ['font', 'fontSize', 'formatBlock'],
  ['paragraphStyle', 'blockquote'],
  ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
  ['fontColor', 'hiliteColor', 'textStyle'],
  ['removeFormat'],
  ['outdent', 'indent'],
  ['align', 'horizontalRule', 'list', 'lineHeight'],
  ['table', 'link', 'image'],
  ['fullScreen', 'showBlocks', 'codeView'],
  ['preview', 'print'],
]

export function ModeloEditorModal({
  modelo,
  onClose,
}: {
  modelo: string | null
  onClose: () => void
}) {
  const [busca, setBusca] = useState('')
  const [salvo, setSalvo] = useState(false)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<SunEditor | null>(null)

  useEffect(() => {
    if (!modelo || !areaRef.current) return
    const ed = suneditor.create(areaRef.current, {
      plugins,
      lang: ptBr,
      width: '100%',
      height: 'auto',
      minHeight: '58vh',
      buttonList: BUTTON_LIST,
      defaultStyle: 'font-family: Calibri, Arial, sans-serif; font-size: 13px;',
      attributesWhitelist: { all: 'style' },
      value: templateHtml(),
    })
    editorRef.current = ed
    return () => {
      ed.destroy()
      editorRef.current = null
    }
  }, [modelo])

  if (!modelo) return null

  const termos = MODELO_TERMOS.filter(
    (t) =>
      t.tag.toLowerCase().includes(busca.toLowerCase()) ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()),
  )

  const inserirTag = (tag: string) => {
    const ed = editorRef.current
    if (!ed) return
    ed.core.focus()
    ed.insertHTML(`${tagSpan(tag)}&nbsp;`, true, true)
  }

  const salvar = () => {
    editorRef.current?.getContents(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f1f3f7]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-2.5">
        <span className="inline-flex items-center gap-2 font-display text-sm font-bold text-[#183263]">
          <FileText size={16} className="text-[var(--color-primary-strong)]" /> Editor de Modelo
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[900px]">
            <textarea ref={areaRef} />
          </div>
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
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => inserirTag(t.tag)}
                  className="flex w-full items-start gap-2 rounded-[var(--radius-control)] px-2 py-2 text-left transition hover:bg-[var(--color-primary-soft)]"
                >
                  <Tag size={13} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[var(--color-ink)]">
                      {t.tag}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--color-muted)]">
                      {t.descricao}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-[var(--color-line)] p-3">
            <button
              onClick={salvar}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-semibold text-white"
            >
              {salvo ? (
                <>
                  <Check size={15} /> Salvo
                </>
              ) : (
                <>
                  <Save size={15} /> Salvar alterações
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
