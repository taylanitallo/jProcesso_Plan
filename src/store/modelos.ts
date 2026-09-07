import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MODELOS_PERSONALIZADOS } from '../mocks'

export type Modelo = {
  id: string
  nome: string
  identificador: string
  legislacao: string
  origem: 'SollAI' | 'Word'
  arquivo: string
  inclusao: string
  inclusaoPor: string
  ultimaEdicao: string
  ultimaEdicaoPor: string
}

type Novo = {
  nome: string
  legislacao: string
  origem: 'SollAI' | 'Word'
  arquivo?: string
}

type State = {
  modelos: Modelo[]
  adicionar: (m: Novo) => void
  atualizar: (id: string, patch: Partial<Omit<Modelo, 'id'>>) => void
  remover: (id: string) => void
}

const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

const SEED: Modelo[] = MODELOS_PERSONALIZADOS.map((m) => ({
  ...m,
  legislacao: '14.133',
  origem: 'SollAI' as const,
  arquivo: '',
}))

export const useModelos = create<State>()(
  persist(
    (set) => ({
      modelos: SEED,
      adicionar: (m) =>
        set((s) => {
          const id = String(400 + s.modelos.length + 1)
          return {
            modelos: [
              ...s.modelos,
              {
                id,
                identificador: id,
                nome: m.nome,
                legislacao: m.legislacao,
                origem: m.origem,
                arquivo: m.arquivo ?? '',
                inclusao: agora(),
                inclusaoPor: 'AM',
                ultimaEdicao: agora(),
                ultimaEdicaoPor: 'AM',
              },
            ],
          }
        }),
      atualizar: (id, patch) =>
        set((s) => ({
          modelos: s.modelos.map((m) =>
            m.id === id ? { ...m, ...patch, ultimaEdicao: agora(), ultimaEdicaoPor: 'AM' } : m,
          ),
        })),
      remover: (id) => set((s) => ({ modelos: s.modelos.filter((m) => m.id !== id) })),
    }),
    { name: 'sollai-modelos' },
  ),
)
