import { useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
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

export function ModeloEditorModal({
  modelo,
  onClose,
}: {
  modelo: string | null
  onClose: () => void
}) {
  const [tab, setTab] = useState('Lar')
  const [busca, setBusca] = useState('')

  if (!modelo) return null

  const termos = MODELO_TERMOS.filter(
    (t) =>
      t.tag.toLowerCase().includes(busca.toLowerCase()) ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()),
  )

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
          <ToolBtn icon={Undo2} />
          <ToolBtn icon={Redo2} />
          <Sep />
          <select className="h-7 rounded border border-[var(--color-line)] bg-white px-1 text-xs">
            <option>Calibri</option>
            <option>Arial</option>
            <option>Times New Roman</option>
          </select>
          <select className="h-7 w-14 rounded border border-[var(--color-line)] bg-white px-1 text-xs">
            <option>11</option>
            <option>12</option>
            <option>14</option>
          </select>
          <Sep />
          <ToolBtn icon={Bold} />
          <ToolBtn icon={Italic} />
          <ToolBtn icon={Underline} />
          <Sep />
          <ToolBtn icon={AlignLeft} />
          <ToolBtn icon={AlignCenter} />
          <ToolBtn icon={AlignRight} />
          <Sep />
          <ToolBtn icon={List} />
          <ToolBtn icon={ListOrdered} />
          <Sep />
          <select className="h-7 rounded border border-[var(--color-line)] bg-white px-1 text-xs">
            <option>Normal</option>
            <option>Cabeçalho 1</option>
            <option>Título 2</option>
          </select>
          <span className="ml-auto inline-flex items-center gap-1 text-xs">
            <Search size={13} /> Encontrar
          </span>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex min-h-0 flex-1">
        {/* Documento */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[820px] rounded-[4px] bg-white p-14 shadow-[var(--shadow-card)]">
            {MODELO_TEMPLATE.map((b, i) => {
              if (b.tipo === 'h1')
                return (
                  <h1 key={i} className="mb-2 text-center font-display text-lg font-bold text-[#183263]">
                    {b.texto}
                  </h1>
                )
              if (b.tipo === 'h2')
                return (
                  <h2 key={i} className="mb-1 mt-5 text-[13px] font-bold uppercase text-[#183263]">
                    {b.texto}
                  </h2>
                )
              if (b.tipo === 'tag')
                return (
                  <p key={i} className="my-1.5 pl-6">
                    <span className="rounded bg-[#fff2cc] px-1.5 py-0.5 font-mono text-[12px] font-semibold text-[#8a6d1a]">
                      [**{b.texto}**]
                    </span>
                  </p>
                )
              return (
                <p key={i} className="my-1 text-center text-[13px] text-[var(--color-ink)]">
                  {b.texto}
                </p>
              )
            })}
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
                <button className="flex w-full items-start gap-2 rounded-[var(--radius-control)] px-2 py-2 text-left transition hover:bg-[var(--color-primary-soft)]">
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
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-semibold text-white"
            >
              <Save size={15} /> Salvar alterações
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

function ToolBtn({ icon: Icon }: { icon: typeof Bold }) {
  return (
    <button className="grid h-7 w-7 place-items-center rounded hover:bg-[#f4f7fc]">
      <Icon size={14} />
    </button>
  )
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-[var(--color-line)]" />
}
