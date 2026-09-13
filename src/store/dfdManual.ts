import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PcaDfd, PcaItemLocal, PcaLocal } from './pca'

/**
 * Dados estruturados do DFD manual dentro de um Processo Inteligente —
 * "Preencher Informações" do artefato DFD. Espelha o formulário real de
 * sistemas de DFD (ex.: Assesi/aContratação): campos de cabeçalho + objeto/
 * justificativa + tabela de itens, em vez de só perguntas dissertativas.
 *
 * Chave = `${processoId}::${artefatoCompleto}` — um registro por artefato DFD
 * de um processo (na prática só existe um DFD por processo, mas a chave
 * evita colisão se o nome do artefato mudar de template). Nesta sessão
 * chamamos essa DFD (dentro de um Processo) de **"DFD de execução"**, pra
 * diferenciar da DFD que mora dentro de um PCA (Criar PCA).
 */

export type TipoContratacaoDfd = 'Nova Contratação' | 'Prorrogação' | 'Renovação' | 'Substituição/Repactuação'
export const TIPOS_CONTRATACAO_DFD: TipoContratacaoDfd[] = [
  'Nova Contratação',
  'Prorrogação',
  'Renovação',
  'Substituição/Repactuação',
]

export type ItemDfdManual = {
  id: string
  codigoItemCatalogo: string
  descricao: string
  unidadeFornecimento: string
  quantidade: number
  valorUnitario: number
  /**
   * Rateio da quantidade entre os setores/departamentos demandantes da DFD
   * (`DfdManual.setores`), quando há mais de um. Soma sempre igual a
   * `quantidade`. Ausente = quantidade não rateada (um setor só, ou usuário
   * optou por não detalhar).
   */
  quantidades?: Record<string, number>
  /**
   * Id do `PcaItemLocal` de origem (quando o item veio de uma DFD do PCA).
   * Ausente = item digitado à mão, sem vínculo/limite de quantidade.
   */
  origemItemId?: string
}

export type DfdManual = {
  /** dd/mm/aaaa */
  data: string
  descricaoSimplificada: string
  secretaria: string
  /** Setores/departamentos demandantes — pode ser mais de um. */
  setores: string[]
  responsavel: string
  ordenador: string
  categoria: string
  tipoContratacao: TipoContratacaoDfd | ''
  grauPrioridade: 'Alta' | 'Média' | 'Baixa'
  objeto: string
  justificativa: string
  itens: ItemDfdManual[]
  atualizadoEm: string
  /** Presente quando essa DFD de execução foi puxada de uma DFD do PCA — trava a adição de novos itens. */
  origemPca?: { pcaId: string; dfdId: string }
}

export const dfdManualVazio = (): DfdManual => ({
  data: new Date().toLocaleDateString('pt-BR'),
  descricaoSimplificada: '',
  secretaria: '',
  setores: [],
  responsavel: '',
  ordenador: '',
  categoria: '',
  tipoContratacao: '',
  grauPrioridade: 'Média',
  objeto: '',
  justificativa: '',
  itens: [],
  atualizadoEm: '',
})

export const valorTotalItens = (d: DfdManual): number =>
  d.itens.reduce((s, it) => s + it.quantidade * it.valorUnitario, 0)

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/**
 * Converte uma DFD de dentro de um PCA (Criar PCA) numa DFD de execução pra
 * puxar na criação de um Processo Inteligente — cabeçalho + itens vêm
 * prontos. A partir daqui a lista de itens fica travada (não dá pra
 * acrescentar item novo — `origemPca` marca isso), mas cada item continua
 * editável (descrição/valor) e a quantidade pode ser reduzida, nunca
 * ultrapassar o que está na DFD do PCA — ver
 * `disponibilidadeItemPca`.
 */
export function dfdManualDoPca(
  pca: PcaLocal,
  dfd: PcaDfd,
  setoresDisponiveis: string[],
): DfdManual {
  const setores = dfd.departamentos.filter((d) => setoresDisponiveis.includes(d))
  const categoria = dfd.itens[0]?.categoriaItemNome ?? ''
  return {
    data: new Date().toLocaleDateString('pt-BR'),
    descricaoSimplificada: dfd.objeto,
    secretaria: pca.unidadeNome,
    setores,
    responsavel: '',
    ordenador: '',
    categoria,
    tipoContratacao: '',
    grauPrioridade: dfd.grauPrioridade,
    objeto: dfd.objeto,
    justificativa: dfd.justificativa,
    itens: dfd.itens.map((it) => ({
      id: `it${uid()}`,
      codigoItemCatalogo: it.codigoItemCatalogo,
      descricao: it.descricao,
      unidadeFornecimento: it.unidadeFornecimento,
      quantidade: it.quantidadeEstimada,
      valorUnitario: it.valorUnitarioEstimado,
      origemItemId: it.id,
    })),
    atualizadoEm: '',
    origemPca: { pcaId: pca.id, dfdId: dfd.id },
  }
}

/**
 * Quanto de um item de DFD do PCA ainda está disponível pra alocar numa DFD
 * de execução: soma o que já foi usado em TODAS as outras DFDs de execução
 * (qualquer processo) que apontam pro mesmo `origemItemId`, e subtrai do
 * total da DFD do PCA. Garante que a soma das execuções nunca ultrapassa o
 * item original, mesmo com vários processos puxando pedaços da mesma DFD.
 */
export function disponibilidadeItemPca(
  origemItemId: string,
  origem: PcaItemLocal,
  todasAsDfds: Record<string, DfdManual>,
  chaveAtual: string,
): { totalPca: number; usadoEmOutras: number; disponivel: number } {
  let usadoEmOutras = 0
  for (const [chave, dfd] of Object.entries(todasAsDfds)) {
    if (chave === chaveAtual) continue
    for (const it of dfd.itens) {
      if (it.origemItemId === origemItemId) usadoEmOutras += it.quantidade
    }
  }
  const totalPca = origem.quantidadeEstimada
  return { totalPca, usadoEmOutras, disponivel: Math.max(0, totalPca - usadoEmOutras) }
}

/** Busca o `PcaItemLocal` original (pra saber o total/limite) em qualquer PCA. */
export function encontrarItemOrigemPca(id: string, pcas: PcaLocal[]): PcaItemLocal | undefined {
  for (const p of pcas) {
    for (const d of p.dfds) {
      const it = d.itens.find((i) => i.id === id)
      if (it) return it
    }
  }
  return undefined
}

type State = {
  porChave: Record<string, DfdManual>
  salvar: (chave: string, dados: DfdManual) => void
}

export const useDfdManual = create<State>()(
  persist(
    (set) => ({
      porChave: {},
      salvar: (chave, dados) =>
        set((s) => ({
          porChave: {
            ...s.porChave,
            [chave]: { ...dados, atualizadoEm: new Date().toLocaleString('pt-BR') },
          },
        })),
    }),
    {
      name: 'sollai-dfd-manual',
      version: 3,
      migrate: (persisted) => {
        type ItemAntigo = ItemDfdManual & { previsao?: string }
        type DfdManualAntiga = Omit<DfdManual, 'setores' | 'itens'> & {
          setor?: string
          setores?: string[]
          demandaParaPca?: boolean
          itens: ItemAntigo[]
        }
        const s = persisted as { porChave?: Record<string, DfdManualAntiga> }
        const porChave: Record<string, DfdManual> = {}
        for (const [chave, d] of Object.entries(s.porChave ?? {})) {
          const { setor, demandaParaPca: _demandaParaPca, itens, ...resto } = d
          porChave[chave] = {
            ...resto,
            setores: d.setores ?? (setor ? [setor] : []),
            itens: itens.map(({ previsao: _previsao, ...it }) => it),
          }
        }
        return { porChave }
      },
    },
  ),
)
