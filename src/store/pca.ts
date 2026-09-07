import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MaterialOuServico } from '../services/types'

export type StatusPca = 'RASCUNHO' | 'PRONTO_PARA_ENVIO'

/**
 * Item de PCA criado localmente. Superset do `PcaItem` (formato de leitura do
 * PNCP) com os campos exigidos pelo DTO real de escrita
 * (`IncluirPlanoContratacaoItemDTO`, ver docs/integracao-apis.md) que a API
 * de leitura não devolve.
 */
export type PcaItemLocal = {
  id: string
  numeroItem: number
  materialOuServico: MaterialOuServico
  categoriaItemId: number
  categoriaItemNome: string
  criterioJulgamentoId: number
  criterioJulgamentoNome: string
  aplicabilidadeMargemPreferencia: boolean
  exigenciaConteudoNacional: boolean
  classificacao: string
  descricao: string
  informacaoComplementar?: string
  unidadeFornecimento: string
  quantidadeEstimada: number
  valorUnitarioEstimado: number
  valorTotalEstimado: number
  codigoItemCatalogo?: string
  /** Só para exibição/auditoria local — de onde o item veio. */
  origem: 'MANUAL' | 'CATALOGO' | 'PNCP'
}

export type PcaLocal = {
  id: string
  nome: string
  anoPca: number
  cnpjOrgao: string
  nomeOrgao: string
  unidade: string
  legislacao: string
  observacoes: string
  status: StatusPca
  itens: PcaItemLocal[]
  criadoEm: string
  atualizadoEm: string
}

type NovoPca = {
  nome: string
  anoPca: number
  cnpjOrgao: string
  nomeOrgao: string
  unidade?: string
  legislacao?: string
  observacoes?: string
}

type NovoItemPca = Omit<PcaItemLocal, 'id' | 'valorTotalEstimado'>

type State = {
  pcas: PcaLocal[]
  criar: (p: NovoPca) => string
  atualizar: (id: string, patch: Partial<Omit<PcaLocal, 'id' | 'itens'>>) => void
  remover: (id: string) => void
  definirStatus: (id: string, status: StatusPca) => void
  adicionarItem: (pcaId: string, item: NovoItemPca) => void
  atualizarItem: (pcaId: string, itemId: string, patch: Partial<Omit<PcaItemLocal, 'id'>>) => void
  removerItem: (pcaId: string, itemId: string) => void
}

/** Domínio real do PNCP (categoriaItemId) — ver docs/integracao-apis.md. */
export const CATEGORIAS_ITEM_PCA: { id: number; nome: string }[] = [
  { id: 1, nome: 'Material' },
  { id: 2, nome: 'Serviço' },
  { id: 3, nome: 'Obras' },
  { id: 4, nome: 'Serviços de Engenharia' },
  { id: 5, nome: 'Soluções de TIC' },
  { id: 6, nome: 'Locação de Imóveis' },
  { id: 7, nome: 'Alienação de Bens Móveis/Imóveis' },
  { id: 8, nome: 'Outros' },
]

/** Domínio real do PNCP (criterioJulgamentoId). */
export const CRITERIOS_JULGAMENTO_PCA: { id: number; nome: string }[] = [
  { id: 1, nome: 'Menor preço' },
  { id: 2, nome: 'Maior desconto' },
  { id: 3, nome: 'Melhor técnica ou conteúdo artístico' },
  { id: 4, nome: 'Técnica e preço' },
  { id: 5, nome: 'Maior lance (leilão)' },
  { id: 6, nome: 'Maior retorno econômico' },
  { id: 7, nome: 'Não se aplica' },
  { id: 8, nome: 'Melhor destinação de bens alienados' },
]

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

export const usePca = create<State>()(
  persist(
    (set) => ({
      pcas: [],
      criar: (p) => {
        const id = `pca${uid()}`
        const carimbo = agora()
        set((s) => ({
          pcas: [
            ...s.pcas,
            {
              id,
              nome: p.nome.trim(),
              anoPca: p.anoPca,
              cnpjOrgao: p.cnpjOrgao.trim(),
              nomeOrgao: p.nomeOrgao.trim(),
              unidade: p.unidade?.trim() ?? '',
              legislacao: p.legislacao ?? '14.133',
              observacoes: p.observacoes?.trim() ?? '',
              status: 'RASCUNHO',
              itens: [],
              criadoEm: carimbo,
              atualizadoEm: carimbo,
            },
          ],
        }))
        return id
      },
      atualizar: (id, patch) =>
        set((s) => ({
          pcas: s.pcas.map((p) => (p.id === id ? { ...p, ...patch, atualizadoEm: agora() } : p)),
        })),
      remover: (id) => set((s) => ({ pcas: s.pcas.filter((p) => p.id !== id) })),
      definirStatus: (id, status) =>
        set((s) => ({
          pcas: s.pcas.map((p) => (p.id === id ? { ...p, status, atualizadoEm: agora() } : p)),
        })),
      adicionarItem: (pcaId, item) =>
        set((s) => ({
          pcas: s.pcas.map((p) =>
            p.id !== pcaId
              ? p
              : {
                  ...p,
                  atualizadoEm: agora(),
                  itens: [
                    ...p.itens,
                    {
                      ...item,
                      id: `item${uid()}`,
                      valorTotalEstimado: Number(
                        (item.quantidadeEstimada * item.valorUnitarioEstimado).toFixed(2),
                      ),
                    },
                  ],
                },
          ),
        })),
      atualizarItem: (pcaId, itemId, patch) =>
        set((s) => ({
          pcas: s.pcas.map((p) => {
            if (p.id !== pcaId) return p
            return {
              ...p,
              atualizadoEm: agora(),
              itens: p.itens.map((it) => {
                if (it.id !== itemId) return it
                const mesclado = { ...it, ...patch }
                return {
                  ...mesclado,
                  valorTotalEstimado: Number(
                    (mesclado.quantidadeEstimada * mesclado.valorUnitarioEstimado).toFixed(2),
                  ),
                }
              }),
            }
          }),
        })),
      removerItem: (pcaId, itemId) =>
        set((s) => ({
          pcas: s.pcas.map((p) =>
            p.id !== pcaId
              ? p
              : { ...p, atualizadoEm: agora(), itens: p.itens.filter((it) => it.id !== itemId) },
          ),
        })),
    }),
    { name: 'sollai-pca', version: 1 },
  ),
)
