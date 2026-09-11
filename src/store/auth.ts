import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Perfil, User } from '../types'

export const PERFIS: { value: Perfil; label: string }[] = [
  { value: 'ADMIN_GERAL', label: 'Administrador Geral' },
  { value: 'GESTOR_UNIDADE', label: 'Gestor de Unidade' },
  { value: 'USUARIO', label: 'Usuário' },
]

const PERFIL_LABEL: Record<Perfil, string> = {
  ADMIN_GERAL: 'Administrador Geral',
  GESTOR_UNIDADE: 'Gestor de Unidade',
  USUARIO: 'Usuário',
}
export const perfilLabel = (p: Perfil) => PERFIL_LABEL[p]

/** Mock user captured from the real SollAI session. */
export const MOCK_USER: User = {
  id: 'u-001',
  name: 'Alef Matheus Teixeira de Sousa',
  email: 'alef.sousa@negociospublicos.com.br',
  role: 'Administrador',
  perfil: 'ADMIN_GERAL',
  institution: 'Grupo Negócios Públicos',
  initials: 'AM',
  unidadeId: '',
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, perfil?: Perfil) => boolean
  logout: () => void
  setPerfil: (perfil: Perfil) => void
  setUnidade: (unidadeId: string) => void
  atualizarUsuario: (patch: Partial<Pick<User, 'name' | 'email'>>) => void
}

/** Iniciais (até 2 letras) a partir de um nome. */
export const iniciaisDe = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password, perfil = 'ADMIN_GERAL') => {
        // Mock auth: any well-formed credential is accepted.
        if (!email.includes('@') || password.length < 3) return false
        set({
          user: { ...MOCK_USER, email, perfil, role: perfilLabel(perfil) },
          isAuthenticated: true,
        })
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      setPerfil: (perfil) =>
        set((s) =>
          s.user ? { user: { ...s.user, perfil, role: perfilLabel(perfil) } } : s,
        ),
      setUnidade: (unidadeId) =>
        set((s) => (s.user ? { user: { ...s.user, unidadeId } } : s)),
      atualizarUsuario: (patch) =>
        set((s) => {
          if (!s.user) return s
          const nome = patch.name?.trim() || s.user.name
          return {
            user: {
              ...s.user,
              ...patch,
              name: nome,
              initials: iniciaisDe(nome),
            },
          }
        }),
    }),
    {
      name: 'sollai-auth',
      version: 1,
      migrate: (persisted) => {
        const s = persisted as { user?: Partial<User> | null; isAuthenticated?: boolean }
        return {
          user: s.user
            ? {
                ...MOCK_USER,
                ...s.user,
                perfil: s.user.perfil ?? 'ADMIN_GERAL',
                unidadeId: s.user.unidadeId ?? '',
              }
            : null,
          isAuthenticated: Boolean(s.isAuthenticated),
        }
      },
    },
  ),
)
