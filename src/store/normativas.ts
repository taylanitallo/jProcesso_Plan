import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NORMATIVAS } from '../mocks'

export type Normativa = {
  id: string
  nome: string
  arquivoUrl: string
  status: 'PROCESSADO'
  criadoEm: string
}

export type NovaNormativa = { nome: string; arquivoUrl?: string }

type State = {
  normativas: Normativa[]
  /** processoId → ids das normativas aplicadas ('' de valor = herda todas) */
  selecoes: Record<string, string[]>
  adicionar: (n: NovaNormativa) => string
  remover: (id: string) => void
  definirSelecao: (processoId: string, ids: string[]) => void
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

const SEED: Normativa[] = NORMATIVAS.map((n) => ({
  id: n.id,
  nome: n.nome,
  arquivoUrl: '',
  status: 'PROCESSADO',
  criadoEm: '01/09/2026 00:00',
}))

export const useNormativas = create<State>()(
  persist(
    (set) => ({
      normativas: SEED,
      selecoes: {},
      adicionar: (n) => {
        const id = `nrm${uid()}`
        set((s) => ({
          normativas: [
            ...s.normativas,
            {
              id,
              nome: n.nome.trim(),
              arquivoUrl: n.arquivoUrl ?? '',
              status: 'PROCESSADO',
              criadoEm: agora(),
            },
          ],
        }))
        return id
      },
      remover: (id) =>
        set((s) => {
          const selecoes: Record<string, string[]> = {}
          for (const [proc, ids] of Object.entries(s.selecoes)) {
            selecoes[proc] = ids.filter((x) => x !== id)
          }
          return { normativas: s.normativas.filter((n) => n.id !== id), selecoes }
        }),
      definirSelecao: (processoId, ids) =>
        set((s) => ({ selecoes: { ...s.selecoes, [processoId]: ids } })),
    }),
    { name: 'sollai-normativas', version: 1 },
  ),
)

/** Ids das normativas aplicadas a um processo; sem seleção salva = todas. */
export function selecaoDe(
  processoId: string,
  selecoes: Record<string, string[]>,
  normativas: Normativa[],
): string[] {
  return selecoes[processoId] ?? normativas.map((n) => n.id)
}
