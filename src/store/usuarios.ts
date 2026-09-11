import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Perfil } from '../types'

export type Usuario = {
  id: string
  nome: string
  email: string
  perfil: Perfil
  unidadeId: string // '' = sem unidade
  ativo: boolean
  criadoEm: string
}

export type NovoUsuario = {
  nome: string
  email: string
  perfil: Perfil
  unidadeId?: string
}

type State = {
  usuarios: Usuario[]
  criar: (u: NovoUsuario) => string
  atualizar: (id: string, patch: Partial<Omit<Usuario, 'id' | 'criadoEm'>>) => void
  remover: (id: string) => void
  definirAtivo: (id: string, ativo: boolean) => void
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

export const useUsuarios = create<State>()(
  persist(
    (set) => ({
      usuarios: [],
      criar: (u) => {
        const id = `usr${uid()}`
        set((s) => ({
          usuarios: [
            ...s.usuarios,
            {
              id,
              nome: u.nome.trim(),
              email: u.email.trim().toLowerCase(),
              perfil: u.perfil,
              unidadeId: u.unidadeId ?? '',
              ativo: true,
              criadoEm: agora(),
            },
          ],
        }))
        return id
      },
      atualizar: (id, patch) =>
        set((s) => ({
          usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      remover: (id) => set((s) => ({ usuarios: s.usuarios.filter((u) => u.id !== id) })),
      definirAtivo: (id, ativo) =>
        set((s) => ({
          usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, ativo } : u)),
        })),
    }),
    { name: 'sollai-usuarios', version: 1 },
  ),
)
