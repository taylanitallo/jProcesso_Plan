import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Instituicao = {
  nome: string
  cnpj: string
  cidade: string
  uf: string
  logoUrl: string
}

type State = {
  instituicao: Instituicao
  atualizar: (patch: Partial<Instituicao>) => void
}

const VAZIA: Instituicao = { nome: '', cnpj: '', cidade: '', uf: '', logoUrl: '' }

export const useInstituicao = create<State>()(
  persist(
    (set) => ({
      instituicao: VAZIA,
      atualizar: (patch) => set((s) => ({ instituicao: { ...s.instituicao, ...patch } })),
    }),
    { name: 'sollai-instituicao', version: 1 },
  ),
)

/** A instituição está pronta pra uso em PCA/PNCP? */
export const instituicaoConfigurada = (i: Instituicao) =>
  Boolean(i.nome.trim() && i.cnpj.trim())
