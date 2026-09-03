import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Bell,
  Database,
  Scale,
  BookText,
  Search,
  FileSearch,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../store/auth'
import { useUi } from '../../store/ui'
import { NotificationPanel } from './NotificationPanel'
import { UserMenuDropdown } from './UserMenuDropdown'

const ICONS: Record<string, LucideIcon> = {
  scale: Scale,
  book: BookText,
  search: Search,
  database: Database,
  analyzer: FileSearch,
  clipboard: ClipboardList,
}

export function TopBar() {
  const user = useAuth((s) => s.user)
  const unread = useUi((s) => s.notifications.filter((n) => !n.read).length)
  const moduleLinks = useUi((s) => s.moduleLinks)
  const [panel, setPanel] = useState<'none' | 'notif' | 'user'>('none')

  const toggle = (p: 'notif' | 'user') => setPanel((cur) => (cur === p ? 'none' : p))

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 md:px-6">
        <Link to="/Home" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] font-display text-lg font-extrabold text-white">
            S
          </span>
          <span className="font-display text-lg font-extrabold text-[#183263]">SollAI</span>
        </Link>

        {moduleLinks.length > 0 && (
          <nav className="flex items-center gap-2 border-l border-[var(--color-line)] pl-4">
            {moduleLinks.map((l) => {
              const Icon = ICONS[l.icon] ?? Database
              return (
                <NavLink
                  key={l.key}
                  to={l.to}
                  title={l.label}
                  aria-label={l.label}
                  className={({ isActive }) =>
                    `grid h-10 w-10 place-items-center rounded-[10px] border transition ${
                      isActive
                        ? 'border-[#bcd0ee] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                        : 'border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                    }`
                  }
                >
                  <Icon size={18} />
                </NavLink>
              )
            })}
          </nav>
        )}

        <div className="mx-auto hidden max-w-xl items-center gap-2 rounded-[var(--radius-control)] border border-[#f2d999] bg-[#fdf6e3] px-4 py-2 text-xs font-medium text-[#8a6d1a] lg:flex">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[#e0a92a] text-[10px] font-bold text-white">
            !
          </span>
          Seu contrato encerra em 5 dias. Entre em contato com nossa equipe para renovação.
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => toggle('notif')}
            aria-label="Notificações"
            className="relative rounded-full p-2 text-[var(--color-muted)] transition hover:bg-[#f4f7fc] hover:text-[var(--color-ink)]"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {panel === 'notif' && <NotificationPanel onClose={() => setPanel('none')} />}
        </div>

        <div className="relative">
          <button
            onClick={() => toggle('user')}
            className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#3b82f6_0%,#1f56ad_100%)] text-sm font-bold text-white"
          >
            {user?.initials ?? '?'}
          </button>
          {panel === 'user' && <UserMenuDropdown onClose={() => setPanel('none')} />}
        </div>
      </div>
    </header>
  )
}
