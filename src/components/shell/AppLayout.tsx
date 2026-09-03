import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-[var(--color-muted)]">
        © 2026 Grupo Negócios Públicos.
      </footer>
    </div>
  )
}
