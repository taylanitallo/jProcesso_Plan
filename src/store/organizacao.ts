import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATEGORIAS_ASSINANTES } from '../mocks'

export type UnidadeSetor = { id: string; codigo: string; nome: string }

type State = {
  unidades: UnidadeSetor[]
  setores: UnidadeSetor[]
  categorias: string[]
  addUnidade: (codigo: string, nome: string) => void
  removeUnidade: (id: string) => void
  addSetor: (codigo: string, nome: string) => void
  removeSetor: (id: string) => void
  addCategoria: (nome: string) => void
  removeCategoria: (nome: string) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

/** Setores padrão da instituição — usados por Registro de Necessidade,
 *  Solicitações de Preenchimento e Permissões do Processo. */
const SETORES_SEED: UnidadeSetor[] = [
  { id: 's-compras', codigo: '01', nome: 'Compras' },
  { id: 's-engenharia', codigo: '02', nome: 'Engenharia' },
  { id: 's-juridico', codigo: '03', nome: 'Jurídico' },
  { id: 's-financeiro', codigo: '04', nome: 'Financeiro' },
  { id: 's-ti', codigo: '05', nome: 'TI' },
]

export const useOrganizacao = create<State>()(
  persist(
    (set) => ({
      unidades: [],
      setores: [...SETORES_SEED],
      categorias: [...CATEGORIAS_ASSINANTES],
      addUnidade: (codigo, nome) =>
        set((s) => ({ unidades: [...s.unidades, { id: uid(), codigo, nome }] })),
      removeUnidade: (id) => set((s) => ({ unidades: s.unidades.filter((u) => u.id !== id) })),
      addSetor: (codigo, nome) =>
        set((s) => ({ setores: [...s.setores, { id: uid(), codigo, nome }] })),
      removeSetor: (id) => set((s) => ({ setores: s.setores.filter((u) => u.id !== id) })),
      addCategoria: (nome) =>
        set((s) => (s.categorias.includes(nome) ? s : { categorias: [...s.categorias, nome] })),
      removeCategoria: (nome) =>
        set((s) => ({ categorias: s.categorias.filter((c) => c !== nome) })),
    }),
    {
      name: 'sollai-organizacao',
      version: 1,
      migrate: (persisted) => {
        const s = persisted as Partial<State>
        return {
          unidades: s.unidades ?? [],
          setores: s.setores && s.setores.length > 0 ? s.setores : [...SETORES_SEED],
          categorias: s.categorias ?? [...CATEGORIAS_ASSINANTES],
        }
      },
    },
  ),
)
