import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { HistoryItem } from '../../types'
import { useModuleLinks } from '../../components/shell/useModuleLinks'

const CHAT_TABS = [
  { label: 'Consulta', to: '/Consulta' },
  { label: 'Artefato', to: '/Artefato' },
  { label: 'Research', to: '/Research' },
]

export const CHAT_MODULE_LINKS = [
  { key: 'consulta', label: 'Consulta Inteligente', to: '/Consulta', icon: 'scale' },
  { key: 'artefato', label: 'Artefato', to: '/Artefato', icon: 'book' },
  { key: 'research', label: 'Research', to: '/Research', icon: 'search' },
  { key: 'base', label: 'Base de conhecimento', to: '/Normativa', icon: 'database' },
]

interface ShellProps {
  /** history footer counter label, e.g. "Total Consultas" */
  counterLabel: string
  counterValue: number
  history: HistoryItem[]
  itemIcon: LucideIcon
  /** show the Consulta/Artefato/Research tab switcher */
  showTabs?: boolean
  children: ReactNode
}

export function ChatShell({
  counterLabel,
  counterValue,
  history,
  itemIcon: ItemIcon,
  showTabs = true,
  children,
}: ShellProps) {
  useModuleLinks(CHAT_MODULE_LINKS)
  const [query, setQuery] = useState('')
  const filtered = history.filter((h) => h.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex min-h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
      <aside className="flex w-[320px] shrink-0 flex-col border-r border-[var(--color-line)]">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="font-display text-lg font-bold text-[#183263]">Histórico</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#22b8a6_0%,#1f8fbf_100%)] text-white"
            aria-label="Novo"
          >
            <Plus size={18} />
          </button>
        </div>

        {showTabs && (
          <div className="mx-4 mt-3 flex rounded-[var(--radius-control)] border border-[var(--color-line)] p-1">
            {CHAT_TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex-1 rounded-[8px] px-2 py-1.5 text-center text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="relative mx-4 mt-3">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={showTabs ? 'Pesquisar no histórico...' : 'Pesquisar...'}
            className="gt-input !py-2 !pl-9 text-xs"
          />
        </div>

        <ul className="mt-2 flex-1 overflow-y-auto px-2 py-1">
          {filtered.map((h) => (
            <li key={h.id}>
              <button className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2.5 text-left hover:bg-[var(--color-primary-soft)]">
                <ItemIcon size={16} className="shrink-0 text-[var(--color-muted)]" />
                <span className="line-clamp-1 text-[13px] text-[var(--color-ink)]">{h.title}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--color-line)] px-4 py-3">
          <p className="text-center text-xs text-[var(--color-muted)]">
            {counterLabel}: <span className="font-semibold text-[var(--color-ink)]">{counterValue}</span>/
            <span className="font-semibold text-[var(--color-success)]">Ilimitado</span>
          </p>
          <div className="mt-2 grid h-7 place-items-center rounded-[var(--radius-pill)] bg-[linear-gradient(90deg,#22b8a6_0%,#1f6fd0_100%)] text-[11px] font-bold text-white">
            Ilimitado
          </div>
        </div>
      </aside>

      <section className="flex flex-1 flex-col bg-[#eef3fb]">{children}</section>
    </div>
  )
}

/** AI speech bubble with gradient avatar + teal left accent. */
export function AiBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#22b8a6_0%,#3b5bd0_60%,#7b3ff0_100%)] text-white">
        <span className="text-sm">✦</span>
      </span>
      <div className="max-w-3xl rounded-[14px] border-l-4 border-[#22b8a6] bg-[#f4f6f8] px-5 py-4 text-sm text-[var(--color-ink)]">
        {children}
      </div>
    </div>
  )
}
