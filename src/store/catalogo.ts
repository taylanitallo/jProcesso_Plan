import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CatalogoItem = {
  id: string
  codigo: string
  nome: string
  especificacao: string
  unidade: string
  tipo: string
  origem: 'INTERNO' | 'CATMAT/CATSER'
}

type NovoCatalogoItem = Omit<CatalogoItem, 'id' | 'codigo' | 'origem'> & {
  codigo?: string
  origem?: CatalogoItem['origem']
}

type CatalogoState = {
  itens: CatalogoItem[]
  adicionar: (item: NovoCatalogoItem) => void
  atualizar: (id: string, patch: Partial<Omit<CatalogoItem, 'id'>>) => void
  remover: (id: string) => void
}

const SEED: CatalogoItem[] = [
  {
    id: 'c1',
    codigo: '1',
    nome: 'Papel A4 75g (resma 500 folhas)',
    especificacao: 'Papel sulfite branco, formato A4, 75g/m², resma com 500 folhas.',
    unidade: 'Caixa (CX)',
    tipo: 'Material',
    origem: 'INTERNO',
  },
  {
    id: 'c2',
    codigo: '2',
    nome: 'Cadeira de escritório giratória',
    especificacao: 'Cadeira giratória com regulagem de altura, apoio lombar e braços ajustáveis.',
    unidade: 'Unidade (Un)',
    tipo: 'Material',
    origem: 'INTERNO',
  },
  {
    id: 'c3',
    codigo: '3',
    nome: 'Serviço de manutenção de ar-condicionado',
    especificacao: 'Manutenção preventiva e corretiva de aparelhos split, com limpeza e recarga de gás.',
    unidade: 'Serviço (SV)',
    tipo: 'Serviço',
    origem: 'INTERNO',
  },
]

/** Próximo código sequencial disponível (maior número + 1). */
function proximoCodigo(itens: CatalogoItem[]): string {
  const maior = itens.reduce((m, i) => {
    const n = Number(i.codigo)
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return String(maior + 1)
}

/** Remove duplicados por origem+código, mantendo a 1ª ocorrência. */
function deduplicar(itens: CatalogoItem[]): CatalogoItem[] {
  const vistos = new Set<string>()
  return itens.filter((i) => {
    const chave = `${i.origem}|${i.codigo}`
    if (vistos.has(chave)) return false
    vistos.add(chave)
    return true
  })
}

export const useCatalogo = create<CatalogoState>()(
  persist(
    (set) => ({
      itens: SEED,
      adicionar: (item) =>
        set((s) => {
          const origem = item.origem ?? 'INTERNO'
          const codigo = item.codigo?.trim() || proximoCodigo(s.itens)
          // já importado (mesma origem + código) — evita duplicar ao reimportar
          if (s.itens.some((i) => i.origem === origem && i.codigo === codigo)) return s
          return {
            itens: [
              ...s.itens,
              {
                id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
                codigo,
                nome: item.nome.trim(),
                especificacao: item.especificacao.trim(),
                unidade: item.unidade,
                tipo: item.tipo,
                origem,
              },
            ],
          }
        }),
      atualizar: (id, patch) =>
        set((s) => ({
          itens: s.itens.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      remover: (id) => set((s) => ({ itens: s.itens.filter((i) => i.id !== id) })),
    }),
    {
      name: 'sollai-catalogo',
      version: 1,
      migrate: (persisted) => {
        const state = persisted as CatalogoState
        return { ...state, itens: deduplicar(state.itens ?? []) }
      },
    },
  ),
)
