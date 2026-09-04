import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  BookText,
  Boxes,
  ChevronDown,
  ClipboardList,
  DatabaseBackup,
  FilePenLine,
  FileSearch,
  GraduationCap,
  Home,
  ListChecks,
  MessageSquareText,
  Scale,
  Search,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'

type Item = { label: string; to: string; icon: LucideIcon }
type Group = { key: string; label: string; icon: LucideIcon; items: Item[] }
type Entry = Item | Group

const isGroup = (e: Entry): e is Group => 'items' in e

const NAV: Entry[] = [
  { label: 'Home', to: '/Home', icon: Home },
  {
    key: 'chat',
    label: 'SollAI Chat',
    icon: MessageSquareText,
    items: [
      { label: 'Consulta Inteligente', to: '/Consulta', icon: Scale },
      { label: 'Artefato', to: '/Artefato', icon: BookText },
      { label: 'Research', to: '/Research', icon: Search },
      { label: 'Analisadores de Processos', to: '/AnalisadoresProcesso', icon: FileSearch },
    ],
  },
  {
    key: 'processos',
    label: 'Processos Inteligentes',
    icon: ListChecks,
    items: [
      { label: 'Processos Inteligentes', to: '/processosinteligentes', icon: ListChecks },
      { label: 'Fluxo de Trabalho', to: '/ProcessosWorkflow', icon: Workflow },
      { label: 'Modelos Personalizados', to: '/ModeloPersonalizado', icon: FilePenLine },
      { label: 'Catálogo de Itens', to: '/CatalogoItens', icon: Boxes },
      { label: 'Registro de Necessidades', to: '/RegistroNecessidade', icon: ClipboardList },
    ],
  },
  { label: 'SollAI Academy', to: '/SollAcademy', icon: GraduationCap },
  { label: 'Base de Conhecimento', to: '/Normativa', icon: DatabaseBackup },
]

/** Key of the group that owns the current route (auto-expanded by default). */
function activeGroupKey(pathname: string) {
  const p = pathname.toLowerCase()
  return NAV.find(
    (e): e is Group => isGroup(e) && e.items.some((i) => p.startsWith(i.to.toLowerCase())),
  )?.key
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-[var(--color-primary-soft)] font-semibold text-[var(--color-primary-strong)]'
      : 'text-[var(--color-ink)] hover:bg-[#f4f7fc]'
  }`

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  const activeKey = activeGroupKey(pathname)
  /** explicit user overrides; falls back to auto-expand of the active group */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const setGroup = (key: string, value: boolean) =>
    setOverrides((o) => ({ ...o, [key]: value }))

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-4">
        <Link to="/Home" onClick={onClose} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] font-display text-lg font-extrabold text-white">
            S
          </span>
          <span className="font-display text-lg font-extrabold text-[#183263]">SollAI</span>
        </Link>
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-muted)] hover:bg-[#f4f7fc] lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV.map((e) => {
          if (!isGroup(e)) {
            const Icon = e.icon
            return (
              <NavLink key={e.to} to={e.to} onClick={onClose} className={linkClass}>
                <Icon size={17} className="shrink-0" />
                {e.label}
              </NavLink>
            )
          }
          const Icon = e.icon
          const expanded = overrides[e.key] ?? e.key === activeKey
          return (
            <div key={e.key}>
              <button
                onClick={() => setGroup(e.key, !expanded)}
                className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[#f4f7fc]"
              >
                <Icon size={17} className="shrink-0" />
                <span className="flex-1 text-left">{e.label}</span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-[var(--color-muted)] transition ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
              {expanded && (
                <div className="mt-1 space-y-1 border-l border-[var(--color-line)] pl-3">
                  {e.items.map((i) => {
                    const ItemIcon = i.icon
                    return (
                      <NavLink key={i.to} to={i.to} end onClick={onClose} className={linkClass}>
                        <ItemIcon size={15} className="shrink-0" />
                        {i.label}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-[var(--color-line)] px-5 py-3 text-[11px] text-[var(--color-muted)]">
        <BookOpen size={13} /> © 2026 Grupo Negócios Públicos.
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-[var(--color-line)] bg-white lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-[rgba(9,21,44,0.4)]" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-[var(--shadow-pop)]">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
