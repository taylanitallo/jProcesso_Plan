import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Registro = {
  id: string
  nome: string
  descricao: string
  setor: string
  dataDesejada: string
  itens: number
  ativo: boolean
  inclusao: string
}

type NovoRegistro = {
  nome: string
  descricao?: string
  setor?: string
  dataDesejada?: string
  itens?: number
}

type State = {
  registros: Registro[]
  adicionar: (r: NovoRegistro) => string
  atualizar: (id: string, patch: Partial<Omit<Registro, 'id'>>) => void
  remover: (id: string) => void
}

const hoje = () => new Date().toLocaleDateString('pt-BR')

export const useNecessidades = create<State>()(
  persist(
    (set) => ({
      registros: [],
      adicionar: (r) => {
        const id = `r${Date.now().toString(36)}`
        set((s) => ({
          registros: [
            ...s.registros,
            {
              id,
              nome: r.nome.trim(),
              descricao: r.descricao?.trim() ?? '',
              setor: r.setor || 'Sem setor',
              dataDesejada: r.dataDesejada ?? '',
              itens: r.itens ?? 0,
              ativo: true,
              inclusao: hoje(),
            },
          ],
        }))
        return id
      },
      atualizar: (id, patch) =>
        set((s) => ({
          registros: s.registros.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      remover: (id) => set((s) => ({ registros: s.registros.filter((r) => r.id !== id) })),
    }),
    { name: 'sollai-necessidades' },
  ),
)

export const SETORES_NECESSIDADE = [
  'Sem setor',
  'Compras',
  'Engenharia',
  'Jurídico',
  'Financeiro',
  'TI',
]
