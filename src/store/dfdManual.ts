import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PcaDfd, PcaLocal } from './pca'

/**
 * Dados estruturados do DFD manual dentro de um Processo Inteligente —
 * "Preencher Informações" do artefato DFD. Espelha o formulário real de
 * sistemas de DFD (ex.: Assesi/aContratação): campos de cabeçalho + objeto/
 * justificativa + tabela de itens, em vez de só perguntas dissertativas.
 *
 * Chave = `${processoId}::${artefatoCompleto}` — um registro por artefato DFD
 * de um processo (na prática só existe um DFD por processo, mas a chave
 * evita colisão se o nome do artefato mudar de template).
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
  /** dd/mm/aaaa — previsão de entrega/execução do item. */
  previsao: string
}

export type DfdManual = {
  /** dd/mm/aaaa */
  data: string
  descricaoSimplificada: string
  secretaria: string
  setor: string
  responsavel: string
  ordenador: string
  categoria: string
  tipoContratacao: TipoContratacaoDfd | ''
  grauPrioridade: 'Alta' | 'Média' | 'Baixa'
  demandaParaPca: boolean
  objeto: string
  justificativa: string
  itens: ItemDfdManual[]
  atualizadoEm: string
}

export const dfdManualVazio = (): DfdManual => ({
  data: new Date().toLocaleDateString('pt-BR'),
  descricaoSimplificada: '',
  secretaria: '',
  setor: '',
  responsavel: '',
  ordenador: '',
  categoria: '',
  tipoContratacao: '',
  grauPrioridade: 'Média',
  demandaParaPca: false,
  objeto: '',
  justificativa: '',
  itens: [],
  atualizadoEm: '',
})

export const valorTotalItens = (d: DfdManual): number =>
  d.itens.reduce((s, it) => s + it.quantidade * it.valorUnitario, 0)

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/**
 * Converte uma DFD de dentro de um PCA (Criar PCA) num DFD manual pra puxar
 * na criação de um Processo Inteligente — cabeçalho + itens vêm prontos, mas
 * continuam editáveis (descrição/unidade/quantidade/valor de cada item).
 */
export function dfdManualDoPca(
  pca: PcaLocal,
  dfd: PcaDfd,
  setoresDisponiveis: string[],
): DfdManual {
  const setor = dfd.departamentos.find((d) => setoresDisponiveis.includes(d)) ?? ''
  const categoria = dfd.itens[0]?.categoriaItemNome ?? ''
  return {
    data: new Date().toLocaleDateString('pt-BR'),
    descricaoSimplificada: dfd.objeto,
    secretaria: pca.unidadeNome,
    setor,
    responsavel: '',
    ordenador: '',
    categoria,
    tipoContratacao: '',
    grauPrioridade: dfd.grauPrioridade,
    demandaParaPca: true,
    objeto: dfd.objeto,
    justificativa: dfd.justificativa,
    itens: dfd.itens.map((it) => ({
      id: `it${uid()}`,
      codigoItemCatalogo: it.codigoItemCatalogo,
      descricao: it.descricao,
      unidadeFornecimento: it.unidadeFornecimento,
      quantidade: it.quantidadeEstimada,
      valorUnitario: it.valorUnitarioEstimado,
      previsao: dfd.dataDesejada,
    })),
    atualizadoEm: '',
  }
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
    { name: 'sollai-dfd-manual', version: 1 },
  ),
)
