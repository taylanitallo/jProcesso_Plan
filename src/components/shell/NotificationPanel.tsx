import { useState } from 'react'
import { useUi } from '../../store/ui'

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const notifications = useUi((s) => s.notifications)
  const markAllRead = useUi((s) => s.markAllRead)
  const [tab, setTab] = useState<'nao-lidas' | 'todas'>('nao-lidas')

  const list = tab === 'nao-lidas' ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-pop)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
        <span className="text-sm font-bold text-[#183263]">Notificações</span>
        <button
          onClick={markAllRead}
          className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-2.5 py-1 text-[11px] font-semibold text-white"
        >
          Marcar todas como lidas
        </button>
      </div>

      <div className="flex gap-1 border-b border-[var(--color-line)] px-3 py-2">
        {(
          [
            ['nao-lidas', 'Não lidas'],
            ['todas', 'Todas'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold transition ${
              tab === key
                ? 'bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="max-h-96 divide-y divide-[var(--color-line)] overflow-y-auto">
        {list.length === 0 ? (
          <li className="px-4 py-8 text-center text-xs text-[var(--color-muted)]">
            Nenhuma notificação.
          </li>
        ) : (
          list.map((n) => (
            <li key={n.id} className={`px-4 py-3 ${n.read ? '' : 'bg-[var(--color-primary-soft)]'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {n.title} <span className="font-normal text-[var(--color-muted)]">— {n.time}</span>
                </p>
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{n.body}</p>
            </li>
          ))
        )}
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
