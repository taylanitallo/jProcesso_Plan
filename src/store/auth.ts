import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

/** Mock user captured from the real SollAI session. */
export const MOCK_USER: User = {
  id: 'u-001',
  name: 'Alef Matheus Teixeira de Sousa',
  email: 'alef.sousa@negociospublicos.com.br',
  role: 'Administrador',
  institution: 'Grupo Negócios Públicos',
  initials: 'AM',
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password) => {
        // Mock auth: any well-formed credential is accepted.
        if (!email.includes('@') || password.length < 3) return false
        set({ user: { ...MOCK_USER, email }, isAuthenticated: true })
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'sollai-auth' },
  ),
)
