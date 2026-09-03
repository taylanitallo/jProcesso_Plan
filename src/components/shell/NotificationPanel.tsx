import { useUi } from '../../store/ui'

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const notifications = useUi((s) => s.notifications)
  const markAllRead = useUi((s) => s.markAllRead)

  return (
    <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-pop)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
        <span className="text-sm font-bold text-[#183263]">Notificações</span>
        <button
          onClick={markAllRead}
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          Marcar todas como lidas
        </button>
      </div>
      <ul className="max-h-96 divide-y divide-[var(--color-line)] overflow-y-auto">
        {notifications.map((n) => (
          <li key={n.id} className={`px-4 py-3 ${n.read ? '' : 'bg-[var(--color-primary-soft)]'}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--color-ink)]">{n.title}</p>
              <span className="shrink-0 text-[11px] text-[var(--color-muted)]">{n.time}</span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{n.body}</p>
          </li>
        ))}
      </ul>
      <button
        onClick={onClose}
        className="block w-full border-t border-[var(--color-line)] py-2.5 text-center text-xs font-semibold text-[var(--color-muted)] hover:bg-[#f7f9fc]"
      >
        Fechar
      </button>
    </div>
  )
}
