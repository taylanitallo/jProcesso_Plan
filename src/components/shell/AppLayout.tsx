import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { UserModals } from './UserModals'

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)]">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-6">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
        <footer className="py-6 text-center text-xs text-[var(--color-muted)]">
          © 2026 Grupo Negócios Públicos.
        </footer>
      </div>

      <UserModals />
    </div>
  )
}
