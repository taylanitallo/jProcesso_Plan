import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MaterialOuServico } from '../services/types'

export type StatusPca = 'RASCUNHO' | 'PRONTO_PARA_ENVIO' | 'TRANSMITIDO'

export type GrauPrioridade = 'Alta' | 'Média' | 'Baixa'
export const GRAUS_PRIORIDADE: GrauPrioridade[] = ['Alta', 'Média', 'Baixa']

/**
 * Item de uma DFD dentro do PCA. Superset do `PcaItem` (formato de leitura do
 * PNCP) com os campos do DTO real de escrita (`IncluirPlanoContratacaoItemDTO`,
 * ver docs/integracao-apis.md) que a API de leitura não devolve.
 *
 * O que é da **demanda** (grau de prioridade, data desejada, justificativa,
 * departamentos) fica na `PcaDfd`, não no item — cada DFD agrupa vários itens
 * com a mesma prioridade/prazo.
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
  /** Quantidade total estimada (soma dos departamentos quando houver rateio). */
  quantidadeEstimada: number
  /**
   * Rateio da quantidade por departamento demandante da DFD. Ausente/vazio =
   * quantidade geral (um número só). Quando presente, `quantidadeEstimada` é a
   * soma dos valores.
   */
  quantidades?: Record<string, number>
  valorUnitarioEstimado: number
  valorTotalEstimado: number
  /** Código CatMat/CatSer — do Catálogo de Itens. */
  codigoItemCatalogo: string
  /** Há vinculação/dependência com outro item (define a sequência). */
  temVinculo: boolean
  /** Nº do item da mesma DFD do qual este depende (0 = nenhum). */
  vinculoNumeroItem: number
  /** Só para exibição/auditoria local — de onde o item veio. */
  origem: 'MANUAL' | 'CATALOGO' | 'PNCP'
}

/**
 * DFD — Documento de Formalização da Demanda. Dentro de um PCA existem várias
 * (ex.: "Material de Limpeza", "Material de Expediente", "Material Gráfico").
 * A DFD carrega o grau de prioridade, a data desejada, a justificativa e os
 * departamentos demandantes; os itens ficam dentro dela.
 */
export type PcaDfd = {
  id: string
  numero: number
  objeto: string
  grauPrioridade: GrauPrioridade
  /** Data desejada da contratação (dd/mm/aaaa). */
  dataDesejada: string
  /** Departamentos/setores demandantes (nomes de useOrganizacao().setores). */
  departamentos: string[]
  justificativa: string
  itens: PcaItemLocal[]
  criadoEm: string
  atualizadoEm: string
}

/** Item pronto? (catálogo + quantidade + valor unitário + vínculo coerente). */
export const itemPcaCompleto = (it: PcaItemLocal): boolean =>
  Boolean(
    it.descricao.trim() &&
      it.codigoItemCatalogo.trim() &&
      it.unidadeFornecimento.trim() &&
      it.quantidadeEstimada > 0 &&
      it.valorUnitarioEstimado > 0 &&
      (!it.temVinculo || it.vinculoNumeroItem > 0),
  )

/** DFD pronta? (objeto + grau + data + ≥1 departamento + ≥1 item, todos completos). */
export const dfdCompleta = (d: PcaDfd): boolean =>
  Boolean(
    d.objeto.trim() &&
      d.grauPrioridade &&
      d.dataDesejada.trim() &&
      d.departamentos.length > 0 &&
      d.itens.length > 0 &&
      d.itens.every(itemPcaCompleto),
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
  dfds: PcaDfd[]
  criadoEm: string
  atualizadoEm: string
  /** Preenchidos só depois de uma transmissão real bem-sucedida ao PNCP. */
  numeroControlePNCP?: string
  ambienteTransmissao?: 'homologacao' | 'producao'
  dataTransmissao?: string
}

/** Todos os itens do PCA, achatando as DFDs. */
export const itensDoPca = (p: PcaLocal): PcaItemLocal[] => p.dfds.flatMap((d) => d.itens)

/** Valor estimado de uma DFD (soma dos itens). */
export const valorDfd = (d: PcaDfd): number =>
  d.itens.reduce((s, i) => s + i.valorTotalEstimado, 0)

/** Valor estimado do PCA (soma das DFDs). */
export const valorPca = (p: PcaLocal): number => p.dfds.reduce((s, d) => s + valorDfd(d), 0)

/**
 * Contribuição de um item para um departamento: usa o rateio por departamento
 * quando o item tem `quantidades`; senão divide o valor do item igualmente
 * entre os departamentos da DFD. A soma sobre todos os departamentos bate com
 * o valor do item.
 */
const contribuicaoItemDepartamento = (
  it: PcaItemLocal,
  departamento: string,
  dfd: PcaDfd,
): number => {
  if (it.quantidades && Object.keys(it.quantidades).length > 0) {
    return Number(((it.quantidades[departamento] ?? 0) * it.valorUnitarioEstimado).toFixed(2))
  }
  const n = dfd.departamentos.length || 1
  return Number((it.valorTotalEstimado / n).toFixed(2))
}

/** Soma por departamento — rateio exato quando o item o tem, senão divisão igual. */
export const valorPorDepartamento = (p: PcaLocal): { departamento: string; valor: number }[] => {
  const mapa = new Map<string, number>()
  for (const d of p.dfds) {
    for (const dep of d.departamentos) {
      const v = d.itens.reduce((s, it) => s + contribuicaoItemDepartamento(it, dep, d), 0)
      mapa.set(dep, (mapa.get(dep) ?? 0) + v)
    }
  }
  return [...mapa.entries()]
    .map(([departamento, valor]) => ({ departamento, valor }))
    .sort((a, b) => b.valor - a.valor)
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

type NovaDfd = {
  objeto: string
  grauPrioridade: GrauPrioridade
  dataDesejada: string
  departamentos: string[]
  justificativa?: string
}

type NovoItemPca = Omit<PcaItemLocal, 'id' | 'valorTotalEstimado'>

type State = {
  pcas: PcaLocal[]
  criar: (p: NovoPca) => string
  atualizar: (id: string, patch: Partial<Omit<PcaLocal, 'id' | 'dfds'>>) => void
  remover: (id: string) => void
  definirStatus: (id: string, status: StatusPca) => void
  registrarTransmissao: (
    id: string,
    info: { numeroControlePNCP: string; ambiente: 'homologacao' | 'producao' },
  ) => void
  adicionarDfd: (pcaId: string, dfd: NovaDfd) => string
  atualizarDfd: (
    pcaId: string,
    dfdId: string,
    patch: Partial<Omit<PcaDfd, 'id' | 'itens' | 'numero' | 'criadoEm'>>,
  ) => void
  removerDfd: (pcaId: string, dfdId: string) => void
  adicionarItem: (pcaId: string, dfdId: string, item: NovoItemPca) => void
  atualizarItem: (
    pcaId: string,
    dfdId: string,
    itemId: string,
    patch: Partial<Omit<PcaItemLocal, 'id'>>,
  ) => void
  removerItem: (pcaId: string, dfdId: string, itemId: string) => void
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

const comValorTotal = (item: NovoItemPca): Omit<PcaItemLocal, 'id'> => ({
  ...item,
  valorTotalEstimado: Number(
    (item.quantidadeEstimada * item.valorUnitarioEstimado).toFixed(2),
  ),
})

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
              dfds: [],
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
      registrarTransmissao: (id, info) =>
        set((s) => ({
          pcas: s.pcas.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'TRANSMITIDO',
                  numeroControlePNCP: info.numeroControlePNCP,
                  ambienteTransmissao: info.ambiente,
                  dataTransmissao: agora(),
                  atualizadoEm: agora(),
                }
              : p,
          ),
        })),
      adicionarDfd: (pcaId, dfd) => {
        const dfdId = `dfd${uid()}`
        set((s) => ({
          pcas: s.pcas.map((p) => {
            if (p.id !== pcaId) return p
            const numero = Math.max(0, ...p.dfds.map((d) => d.numero)) + 1
            const carimbo = agora()
            return {
              ...p,
              atualizadoEm: carimbo,
              dfds: [
                ...p.dfds,
                {
                  id: dfdId,
                  numero,
                  objeto: dfd.objeto.trim(),
                  grauPrioridade: dfd.grauPrioridade,
                  dataDesejada: dfd.dataDesejada.trim(),
                  departamentos: dfd.departamentos,
                  justificativa: dfd.justificativa?.trim() ?? '',
                  itens: [],
                  criadoEm: carimbo,
                  atualizadoEm: carimbo,
                },
              ],
            }
          }),
        }))
        return dfdId
      },
      atualizarDfd: (pcaId, dfdId, patch) =>
        set((s) => ({
          pcas: s.pcas.map((p) =>
            p.id !== pcaId
              ? p
              : {
                  ...p,
                  atualizadoEm: agora(),
                  dfds: p.dfds.map((d) =>
                    d.id === dfdId ? { ...d, ...patch, atualizadoEm: agora() } : d,
                  ),
                },
          ),
        })),
      removerDfd: (pcaId, dfdId) =>
        set((s) => ({
          pcas: s.pcas.map((p) =>
            p.id !== pcaId
              ? p
              : { ...p, atualizadoEm: agora(), dfds: p.dfds.filter((d) => d.id !== dfdId) },
          ),
        })),
      adicionarItem: (pcaId, dfdId, item) =>
        set((s) => ({
          pcas: s.pcas.map((p) => {
            if (p.id !== pcaId) return p
            return {
              ...p,
              atualizadoEm: agora(),
              dfds: p.dfds.map((d) =>
                d.id !== dfdId
                  ? d
                  : {
                      ...d,
                      atualizadoEm: agora(),
                      itens: [...d.itens, { ...comValorTotal(item), id: `item${uid()}` }],
                    },
              ),
            }
          }),
        })),
      atualizarItem: (pcaId, dfdId, itemId, patch) =>
        set((s) => ({
          pcas: s.pcas.map((p) => {
            if (p.id !== pcaId) return p
            return {
              ...p,
              atualizadoEm: agora(),
              dfds: p.dfds.map((d) => {
                if (d.id !== dfdId) return d
                return {
                  ...d,
                  atualizadoEm: agora(),
                  itens: d.itens.map((it) => {
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
            }
          }),
        })),
      removerItem: (pcaId, dfdId, itemId) =>
        set((s) => ({
          pcas: s.pcas.map((p) =>
            p.id !== pcaId
              ? p
              : {
                  ...p,
                  atualizadoEm: agora(),
                  dfds: p.dfds.map((d) =>
                    d.id !== dfdId
                      ? d
                      : { ...d, atualizadoEm: agora(), itens: d.itens.filter((it) => it.id !== itemId) },
                  ),
                },
          ),
        })),
    }),
    {
      name: 'sollai-pca',
      version: 4,
      migrate: (persisted, version) => {
        type ItemAntigo = Partial<PcaItemLocal> & {
          justificativa?: string
          grauPrioridade?: GrauPrioridade
          dataDesejada?: string
        }
        type PcaAntigo = Partial<PcaLocal> & {
          unidade?: string
          itens?: ItemAntigo[]
          dfds?: PcaDfd[]
        }
        const state = persisted as { pcas?: PcaAntigo[] }
        const carimbo = agora()

        const normalizarItem = (it: ItemAntigo, i: number): PcaItemLocal => ({
          id: it.id ?? `item${uid()}`,
          numeroItem: it.numeroItem ?? i + 1,
          materialOuServico: it.materialOuServico ?? 'MATERIAL',
          categoriaItemId: it.categoriaItemId ?? 1,
          categoriaItemNome: it.categoriaItemNome ?? 'Material',
          criterioJulgamentoId: it.criterioJulgamentoId ?? 1,
          criterioJulgamentoNome: it.criterioJulgamentoNome ?? 'Menor preço',
          aplicabilidadeMargemPreferencia: it.aplicabilidadeMargemPreferencia ?? false,
          exigenciaConteudoNacional: it.exigenciaConteudoNacional ?? false,
          classificacao: it.classificacao ?? 'Material',
          descricao: it.descricao ?? '',
          informacaoComplementar: it.informacaoComplementar,
          unidadeFornecimento: it.unidadeFornecimento ?? '',
          quantidadeEstimada: it.quantidadeEstimada ?? 0,
          valorUnitarioEstimado: it.valorUnitarioEstimado ?? 0,
          valorTotalEstimado:
            it.valorTotalEstimado ??
            Number(((it.quantidadeEstimada ?? 0) * (it.valorUnitarioEstimado ?? 0)).toFixed(2)),
          codigoItemCatalogo: it.codigoItemCatalogo ?? '',
          temVinculo: it.temVinculo ?? false,
          vinculoNumeroItem: it.vinculoNumeroItem ?? 0,
          origem: it.origem ?? 'MANUAL',
        })

        return {
          pcas: (state.pcas ?? []).map((p) => {
            const base = {
              ...(p as PcaLocal),
              unidadeId: p.unidadeId ?? '',
              unidadeNome: p.unidadeNome ?? p.unidade ?? '',
            }
            // v4+ já tem dfds
            if (version >= 4 && Array.isArray(p.dfds)) {
              return { ...base, dfds: p.dfds }
            }
            // v3 e anteriores: envelopa os itens numa DFD única
            const itens = (p.itens ?? []).map(normalizarItem)
            const primeiro = (p.itens ?? [])[0]
            const dfd: PcaDfd = {
              id: `dfd${uid()}`,
              numero: 1,
              objeto: 'Demanda inicial',
              grauPrioridade: primeiro?.grauPrioridade ?? 'Média',
              dataDesejada: primeiro?.dataDesejada ?? '',
              departamentos: [],
              justificativa: primeiro?.justificativa ?? '',
              itens,
              criadoEm: carimbo,
              atualizadoEm: carimbo,
            }
            return { ...base, dfds: itens.length > 0 ? [dfd] : [] }
          }),
        }
      },
    },
  ),
)
