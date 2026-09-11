import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MaterialOuServico } from '../services/types'

export type StatusPca = 'RASCUNHO' | 'PRONTO_PARA_ENVIO'

export type GrauPrioridade = 'Alta' | 'Média' | 'Baixa'
export const GRAUS_PRIORIDADE: GrauPrioridade[] = ['Alta', 'Média', 'Baixa']

/**
 * Item de PCA criado localmente. Superset do `PcaItem` (formato de leitura do
 * PNCP) com os campos exigidos pelo DTO real de escrita
 * (`IncluirPlanoContratacaoItemDTO`, ver docs/integracao-apis.md) que a API
 * de leitura não devolve, mais os campos obrigatórios do PAC segundo o FAQ
 * do compras.gov.br (justificativa, grau de prioridade, data desejada,
 * vinculação/dependência).
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
  /** Código CatMat/CatSer — obrigatório no PAC. */
  codigoItemCatalogo: string
  /** Justificativa para a aquisição ou contratação — obrigatória. */
  justificativa: string
  /** Grau de prioridade da compra/contratação — obrigatório. */
  grauPrioridade: GrauPrioridade
  /** Data desejada para a compra/contratação (dd/mm/aaaa) — obrigatória. */
  dataDesejada: string
  /** Há vinculação/dependência com outro item (define a sequência). */
  temVinculo: boolean
  /** Nº do item deste PCA do qual este depende (0 = nenhum). */
  vinculoNumeroItem: number
  /** Só para exibição/auditoria local — de onde o item veio. */
  origem: 'MANUAL' | 'CATALOGO' | 'PNCP'
}

/** Campos obrigatórios do PAC preenchidos? (para liberar "Pronto para Envio"). */
export const itemPcaCompleto = (it: PcaItemLocal): boolean =>
  Boolean(
    it.descricao.trim() &&
      it.codigoItemCatalogo.trim() &&
      it.unidadeFornecimento.trim() &&
      it.quantidadeEstimada > 0 &&
      it.valorUnitarioEstimado > 0 &&
      it.justificativa.trim() &&
      it.grauPrioridade &&
      it.dataDesejada.trim() &&
      (!it.temVinculo || it.vinculoNumeroItem > 0),
  )

export type PcaLocal = {
  id: string
  nome: string
  anoPca: number
  cnpjOrgao: string
  nomeOrgao: string
  /** Unidade Orçamentária dona deste PCA — cada unidade monta o seu (ver Gerenciar Unidade/Setor). */
  unidadeId: string
  unidadeNome: string
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
  unidadeId: string
  unidadeNome: string
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
              unidadeId: p.unidadeId,
              unidadeNome: p.unidadeNome,
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
    {
      name: 'sollai-pca',
      version: 3,
      migrate: (persisted) => {
        const state = persisted as {
          pcas?: (Partial<PcaLocal> & { unidade?: string; itens?: Partial<PcaItemLocal>[] })[]
        }
        return {
          pcas: (state.pcas ?? []).map((p) => ({
            ...(p as PcaLocal),
            unidadeId: p.unidadeId ?? '',
            unidadeNome: p.unidadeNome ?? p.unidade ?? '',
            itens: (p.itens ?? []).map((it) => ({
              ...(it as PcaItemLocal),
              codigoItemCatalogo: it.codigoItemCatalogo ?? '',
              justificativa: it.justificativa ?? '',
              grauPrioridade: it.grauPrioridade ?? 'Média',
              dataDesejada: it.dataDesejada ?? '',
              temVinculo: it.temVinculo ?? false,
              vinculoNumeroItem: it.vinculoNumeroItem ?? 0,
            })),
          })),
        }
      },
    },
  ),
)
