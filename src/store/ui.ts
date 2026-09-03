import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification } from '../types'

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'Artefato concluído',
    body: 'O Termo de Referência do processo 2026/00123 foi gerado.',
    time: 'há 2 h',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Revisão pendente',
    body: 'Você foi designado para revisar o ETP do processo 2026/00098.',
    time: 'há 1 dia',
    read: false,
  },
  {
    id: 'n-3',
    title: 'Nova trilha no Academy',
    body: 'Trilha "Nova Lei de Licitações na prática" disponível.',
    time: 'há 3 dias',
    read: true,
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
