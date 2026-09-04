import { useState } from 'react'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../../store/auth'
import { useUi } from '../../store/ui'
import { NotificationPanel } from './NotificationPanel'
import { UserMenuDropdown } from './UserMenuDropdown'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const user = useAuth((s) => s.user)
  const unread = useUi((s) => s.notifications.filter((n) => !n.read).length)
  const [panel, setPanel] = useState<'none' | 'notif' | 'user'>('none')

  const toggle = (p: 'notif' | 'user') => setPanel((cur) => (cur === p ? 'none' : p))

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          onClick={onMenu}
          aria-label="Abrir menu"
          className="grid h-9 w-9 place-items-center rounded-[10px] text-[var(--color-muted)] transition hover:bg-[#f4f7fc] hover:text-[var(--color-ink)] lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
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
      </div>
    </header>
  )
}
