import { useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  FileText,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Save,
  Search,
  Tag,
  Underline,
  Undo2,
  X,
} from 'lucide-react'
import { MODELO_TEMPLATE, MODELO_TERMOS } from '../../mocks'

const RIBBON_TABS = ['Lar', 'Inserir', 'Layout', 'Análise', 'Visualizar', 'Referências', 'Desenvolvedor']

/** HTML inicial do documento a partir do modelo padrão de Termo de Referência. */
function templateHtml() {
  return MODELO_TEMPLATE.map((b) => {
    if (b.tipo === 'h1') return `<h1>${b.texto}</h1>`
    if (b.tipo === 'h2') return `<h2>${b.texto}</h2>`
    if (b.tipo === 'tag')
      return `<p style="padding-left:1.5rem"><span class="tag" contenteditable="false">[**${b.texto}**]</span></p>`
    return `<p style="text-align:center">${b.texto}</p>`
  }).join('')
}

const exec = (cmd: string, val?: string) => document.execCommand(cmd, false, val)

export function ModeloEditorModal({
  modelo,
  onClose,
}: {
  modelo: string | null
  onClose: () => void
}) {
  const [tab, setTab] = useState('Lar')
  const [busca, setBusca] = useState('')
  const [salvo, setSalvo] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const selRef = useRef<Range | null>(null)

  useEffect(() => {
    if (modelo && editorRef.current) editorRef.current.innerHTML = templateHtml()
  }, [modelo])

  if (!modelo) return null

  const termos = MODELO_TERMOS.filter(
    (t) =>
      t.tag.toLowerCase().includes(busca.toLowerCase()) ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()),
  )

  /** guarda a posição do cursor ao sair do editor (para inserir tag depois) */
  const guardarSelecao = () => {
    const s = window.getSelection()
    if (s && s.rangeCount && editorRef.current?.contains(s.anchorNode)) {
      selRef.current = s.getRangeAt(0).cloneRange()
    }
  }

  const inserirTag = (tag: string) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const sel = window.getSelection()
    if (sel && selRef.current) {
      sel.removeAllRanges()
      sel.addRange(selRef.current)
    }
    exec(
      'insertHTML',
      `<span class="tag" contenteditable="false">[**${tag}**]</span>&nbsp;`,
    )
    guardarSelecao()
  }

  const salvar = () => {
    setSalvo(true)
    setTimeout(() => setSalvo(false), 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f1f3f7]">
      {/* Ribbon */}
      <div className="border-b border-[var(--color-line)] bg-white">
        <div className="flex items-center justify-between px-4 pt-2">
          <div className="flex gap-4 text-[13px]">
            {RIBBON_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-1 py-1.5 font-medium transition ${
                  t === tab
                    ? 'border-[var(--color-primary)] text-[var(--color-primary-strong)]'
                    : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-muted)] hover:bg-[#f4f7fc]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-[var(--color-line)] px-4 py-2 text-[var(--color-muted)]">
          <ToolBtn icon={Undo2} onClick={() => exec('undo')} title="Desfazer" />
          <ToolBtn icon={Redo2} onClick={() => exec('redo')} title="Refazer" />
          <Sep />
          <select
            onChange={(e) => exec('fontName', e.target.value)}
            className="h-7 rounded border border-[var(--color-line)] bg-white px-1 text-xs"
          >
            <option>Calibri</option>
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Georgia</option>
          </select>
          <select
            onChange={(e) => exec('fontSize', e.target.value)}
            className="h-7 w-14 rounded border border-[var(--color-line)] bg-white px-1 text-xs"
            defaultValue="3"
            title="Tamanho"
          >
            <option value="1">8</option>
            <option value="2">10</option>
            <option value="3">11</option>
            <option value="4">14</option>
            <option value="5">18</option>
            <option value="6">24</option>
          </select>
          <Sep />
          <ToolBtn icon={Bold} onClick={() => exec('bold')} title="Negrito" />
          <ToolBtn icon={Italic} onClick={() => exec('italic')} title="Itálico" />
          <ToolBtn icon={Underline} onClick={() => exec('underline')} title="Sublinhado" />
          <Sep />
          <ToolBtn icon={AlignLeft} onClick={() => exec('justifyLeft')} title="Alinhar à esquerda" />
          <ToolBtn icon={AlignCenter} onClick={() => exec('justifyCenter')} title="Centralizar" />
          <ToolBtn icon={AlignRight} onClick={() => exec('justifyRight')} title="Alinhar à direita" />
          <Sep />
          <ToolBtn icon={List} onClick={() => exec('insertUnorderedList')} title="Lista" />
          <ToolBtn icon={ListOrdered} onClick={() => exec('insertOrderedList')} title="Lista numerada" />
          <Sep />
          <select
            onChange={(e) => exec('formatBlock', e.target.value)}
            className="h-7 rounded border border-[var(--color-line)] bg-white px-1 text-xs"
            defaultValue="p"
          >
            <option value="p">Normal</option>
            <option value="h1">Cabeçalho 1</option>
            <option value="h2">Título 2</option>
          </select>
          <button
            onClick={() => {
              const q = window.prompt('Encontrar:')
              const finder = (window as unknown as { find?: (s: string) => boolean }).find
              if (q && finder) finder(q)
            }}
            className="ml-auto inline-flex items-center gap-1 text-xs hover:text-[var(--color-ink)]"
          >
            <Search size={13} /> Encontrar
          </button>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex min-h-0 flex-1">
        {/* Documento editável */}
        <div className="flex-1 overflow-y-auto p-8">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={guardarSelecao}
            onKeyUp={guardarSelecao}
            onMouseUp={guardarSelecao}
            className="mx-auto min-h-[60vh] max-w-[820px] rounded-[4px] bg-white p-14 text-[13px] leading-relaxed text-[var(--color-ink)] shadow-[var(--shadow-card)] outline-none [&_h1]:mb-2 [&_h1]:text-center [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-[#183263] [&_h2]:mb-1 [&_h2]:mt-5 [&_h2]:text-[13px] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-[#183263] [&_.tag]:mx-0.5 [&_.tag]:rounded [&_.tag]:bg-[#fff2cc] [&_.tag]:px-1.5 [&_.tag]:py-0.5 [&_.tag]:font-mono [&_.tag]:text-[12px] [&_.tag]:font-semibold [&_.tag]:text-[#8a6d1a] [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-8"
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

      <div className="flex items-center justify-between border-t border-[var(--color-line)] bg-white px-4 py-1.5 text-[11px] text-[var(--color-muted)]">
        <span>Página 1 de 11</span>
        <span>100%</span>
      </div>
    </div>
  )
}

function ToolBtn({
  icon: Icon,
  onClick,
  title,
}: {
  icon: typeof Bold
  onClick: () => void
  title: string
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded hover:bg-[#f4f7fc]"
    >
      <Icon size={14} />
    </button>
  )
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-[var(--color-line)]" />
}
