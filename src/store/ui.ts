import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification } from '../types'

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'SollAI',
    body: 'Consulta inteligente concluída',
    time: '03/09/2026 às 01:34',
    read: false,
  },
  {
    id: 'n-2',
    title: 'SollAI',
    body: 'Consulta inteligente concluída',
    time: '23/12/2025 às 4:51',
    read: false,
  },
  {
    id: 'n-3',
    title: 'SollAI',
    body: 'Chat concluído',
    time: '22/12/2025 às 08:13',
    read: false,
  },
]

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
