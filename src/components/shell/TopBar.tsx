import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bell, Boxes, ClipboardList, ScrollText } from 'lucide-react'
import { useAuth } from '../../store/auth'
import { useUi } from '../../store/ui'
import { NotificationPanel } from './NotificationPanel'
import { UserMenuDropdown } from './UserMenuDropdown'

const FIXED_LINKS = [
  { to: '/catalogo', label: 'Catálogo de Itens', icon: Boxes },
  { to: '/necessidades', label: 'Registro de Necessidades', icon: ClipboardList },
  { to: '/normativa', label: 'Normativa', icon: ScrollText },
]

export function TopBar() {
  const user = useAuth((s) => s.user)
  const unread = useUi((s) => s.notifications.filter((n) => !n.read).length)
  const [panel, setPanel] = useState<'none' | 'notif' | 'user'>('none')

  const toggle = (p: 'notif' | 'user') => setPanel((cur) => (cur === p ? 'none' : p))

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] font-display text-lg font-extrabold text-white">
            S
          </span>
          <span className="font-display text-lg font-extrabold text-[#183263]">SollAI</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {FIXED_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                    : 'text-[var(--color-muted)] hover:bg-[#f4f7fc] hover:text-[var(--color-ink)]'
                }`
              }
            >
              <Icon size={16} />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative ml-auto md:ml-0">
          <button
            onClick={() => toggle('notif')}
            aria-label="Notificações"
            className="relative rounded-full p-2 text-[var(--color-muted)] transition hover:bg-[#f4f7fc] hover:text-[var(--color-ink)]"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold text-white">
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
