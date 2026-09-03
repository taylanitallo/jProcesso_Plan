import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification } from '../types'

const NOTIF_BODIES = [
  'Consulta inteligente concluída',
  'Artefato gerado com sucesso',
  'Análise de documento concluída',
  'Chat concluído',
  'Research concluída',
]
const NOTIF_TIMES = [
  '03/09/2026 às 01:34',
  '02/09/2026 às 18:07',
  '01/09/2026 às 01:33',
  '29/08/2026 às 09:42',
  '27/08/2026 às 14:15',
  '23/12/2025 às 04:51',
  '22/12/2025 às 08:13',
  '20/12/2025 às 16:28',
  '18/12/2025 às 11:03',
]

/** 18 não lidas — reproduz o contador fixo do SollAI. */
const SEED_NOTIFICATIONS: AppNotification[] = Array.from({ length: 18 }, (_, i) => ({
  id: `n-${i + 1}`,
  title: 'SollAI',
  body: NOTIF_BODIES[i % NOTIF_BODIES.length],
  time: NOTIF_TIMES[i % NOTIF_TIMES.length],
  read: false,
}))

export interface ModuleLink {
  key: string
  label: string
  to: string
  /** lucide icon name resolved by TopBar */
  icon: string
}

interface UiState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  notifications: AppNotification[]
  markAllRead: () => void
  unreadCount: () => number
  /** context icons shown in the TopBar for the active module */
  moduleLinks: ModuleLink[]
  setModuleLinks: (links: ModuleLink[]) => void
  /** which user-menu modal is open */
  userModal: null | 'perfil' | 'instituicao' | 'senha' | 'metodo'
  setUserModal: (m: UiState['userModal']) => void
}

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      notifications: SEED_NOTIFICATIONS,
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
      moduleLinks: [],
      setModuleLinks: (links) => set({ moduleLinks: links }),
      userModal: null,
      setUserModal: (m) => set({ userModal: m }),
    }),
    {
      name: 'sollai-ui',
      partialize: (s) => ({ theme: s.theme, notifications: s.notifications }),
    },
  ),
)
