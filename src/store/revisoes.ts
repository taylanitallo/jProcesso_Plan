import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Revisao = {
  id: string
  artefato: string
  artefatoCurto: string
  numeroArtefato: string
  processoId: string
  processoNome: string
  processoNumero: string
  docUrl: string
  revisores: string[]
  enviadoEm: string
  status: 'Aguardando Revisão' | 'Revisado'
  revisadoEm?: string
}

type Nova = Omit<Revisao, 'id' | 'enviadoEm' | 'status' | 'revisadoEm'>

type State = {
  revisoes: Revisao[]
  abrir: (r: Nova) => string
  concluir: (id: string) => void
  remover: (id: string) => void
}

const carimbo = () =>
  `${new Date().toLocaleDateString('pt-BR')}, ${new Date().toLocaleTimeString('pt-BR')}`

export const useRevisoes = create<State>()(
  persist(
    (set, get) => ({
      revisoes: [],
      abrir: (r) => {
        const id = String(1860 + get().revisoes.length)
        set((s) => ({
          revisoes: [
            { ...r, id, enviadoEm: carimbo(), status: 'Aguardando Revisão' as const },
            ...s.revisoes,
          ],
        }))
        return id
      },
      concluir: (id) =>
        set((s) => ({
          revisoes: s.revisoes.map((v) =>
            v.id === id ? { ...v, status: 'Revisado' as const, revisadoEm: carimbo() } : v,
          ),
        })),
      remover: (id) => set((s) => ({ revisoes: s.revisoes.filter((v) => v.id !== id) })),
    }),
    {
      name: 'sollai-revisoes',
      version: 1,
      migrate: (persisted) => {
        const s = persisted as { revisoes?: (Omit<Revisao, 'processoId'> & { processoId: unknown })[] }
        return {
          revisoes: (s.revisoes ?? []).map((v) => ({ ...v, processoId: String(v.processoId ?? '') })),
        }
      },
    },
  ),
)

export const revisoesPendentes = (revisoes: Revisao[]) =>
  revisoes.filter((v) => v.status === 'Aguardando Revisão')
