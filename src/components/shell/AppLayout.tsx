import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { UserModals } from './UserModals'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-[1400px]">
          <Outlet />
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-[var(--color-muted)]">
        © 2026 Grupo Negócios Públicos.
      </footer>
      <UserModals />
    </div>
  )
}
