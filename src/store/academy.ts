import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
  /** chave do curso (título) → ids das aulas concluídas */
  progresso: Record<string, string[]>
  alternar: (cursoKey: string, aulaId: string) => void
  resetar: (cursoKey: string) => void
}

export const useAcademy = create<State>()(
  persist(
    (set) => ({
      progresso: {},
      alternar: (cursoKey, aulaId) =>
        set((s) => {
          const atual = s.progresso[cursoKey] ?? []
          const nova = atual.includes(aulaId)
            ? atual.filter((id) => id !== aulaId)
            : [...atual, aulaId]
          return { progresso: { ...s.progresso, [cursoKey]: nova } }
        }),
      resetar: (cursoKey) =>
        set((s) => {
          const rest = { ...s.progresso }
          delete rest[cursoKey]
          return { progresso: rest }
        }),
    }),
    { name: 'sollai-academy', version: 1 },
  ),
)

/** Percentual concluído (0–100) de um curso. */
export const pctConcluido = (concluidas: number, total: number) =>
  total === 0 ? 0 : Math.round((concluidas / total) * 100)
