import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Assinante = {
  id: string
  nome: string
  email: string
  documento: string
  ativo: boolean
  criadoEm: string
}

export type NovoAssinante = { nome: string; email: string; documento?: string }

type State = {
  assinantes: Assinante[]
  criar: (a: NovoAssinante) => string
  atualizar: (id: string, patch: Partial<Omit<Assinante, 'id' | 'criadoEm'>>) => void
  remover: (id: string) => void
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

export const useAssinantes = create<State>()(
  persist(
    (set) => ({
      assinantes: [],
      criar: (a) => {
        const id = `asx${uid()}`
        set((s) => ({
          assinantes: [
            ...s.assinantes,
            {
              id,
              nome: a.nome.trim(),
              email: a.email.trim().toLowerCase(),
              documento: a.documento?.trim() ?? '',
              ativo: true,
              criadoEm: agora(),
            },
          ],
        }))
        return id
      },
      atualizar: (id, patch) =>
        set((s) => ({
          assinantes: s.assinantes.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      remover: (id) => set((s) => ({ assinantes: s.assinantes.filter((a) => a.id !== id) })),
    }),
    { name: 'sollai-assinantes', version: 1 },
  ),
)
