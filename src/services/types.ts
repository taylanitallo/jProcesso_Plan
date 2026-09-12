/**
 * Tipos canônicos das APIs públicas de compras do governo.
 * Fontes: PNCP (pncp.gov.br/api) e Compras.gov.br Dados Abertos
 * (dadosabertos.compras.gov.br). Ver docs/integracao-apis.md para o
 * mapeamento campo-a-campo com os modelos internos do sistema.
 */

export type MaterialOuServico = 'MATERIAL' | 'SERVICO'

/** Item do catálogo CATMAT (material) ou CATSER (serviço). */
export interface CatalogoItemRef {
  /** CATMAT/CATSER: codigoItem (material) ou codigoServico (serviço). */
  codigoItemCatalogo: string
  /** descricaoItem / nomeServico. */
  descricaoItem: string
  materialOuServico: MaterialOuServico
  // --- classificação (hierarquia) ---
  grupo?: string
  classe?: string
  /** só material — Padrão Descritivo de Material. */
  pdm?: string
  /** só serviço. */
  secao?: string
  divisao?: string
  subclasse?: string
  /** siglaUnidadeFornecimento / siglaUnidadeMedida. */
  unidadeFornecimento: string
  /** texto livre adicional. */
  informacaoComplementar?: string
}

/** Cabeçalho de um Plano de Contratação Anual (PGC/PCA). */
export interface PcaCabecalho {
  cnpjOrgao: string
  nomeOrgao: string
  anoPca: number
  sequencial: number
  /** numeroControlePNCP: <cnpj>-0-<sequencial>/<ano>. */
  numeroControlePNCP: string
  codigoUnidade: string
  nomeUnidade: string
  localizacao: string
  dataPublicacao: string
  totalItens: number
  valorTotalEstimado: number
}

/** Item de um Plano de Contratação Anual. */
export interface PcaItem {
  numeroItem: number
  materialOuServico: MaterialOuServico
  /** categoriaItemId → nome legível. */
  categoria: string
  classificacao: string
  descricao: string
  informacaoComplementar?: string
  unidadeFornecimento: string
  quantidadeEstimada: number
  valorUnitarioEstimado: number
  valorTotalEstimado: number
  codigoItemCatalogo?: string
}

/** Preço praticado (histórico de compras) — insumo da pesquisa de preços. */
export interface PrecoPraticado {
  idCompra: string
  codigoItemCatalogo: string
  descricaoDetalhadaItem: string
  quantidade: number
  precoUnitario: number
  nomeFornecedor: string
  niFornecedor: string
  dataCompra: string
  codigoUasg: string
}

/** Paginação padrão das APIs de dados abertos. */
export interface Pagina<T> {
  itens: T[]
  total: number
}

/** Contratação (licitação/contratação direta) publicada no PNCP — busca nacional. */
export interface ContratacaoPncp {
  numeroControlePNCP: string
  numeroCompra: string
  anoCompra: number
  processo: string
  modalidadeNome: string
  situacaoCompraNome: string
  objetoCompra: string
  valorTotalEstimado: number
  valorTotalHomologado: number
  dataAberturaProposta: string
  dataEncerramentoProposta: string
  dataPublicacaoPncp: string
  srp: boolean
  cnpjOrgao: string
  nomeOrgao: string
  nomeUnidade: string
  municipio: string
  uf: string
}

/** Ata de Registro de Preço publicada no PNCP — busca nacional. */
export interface AtaPncp {
  numeroControlePNCPAta: string
  numeroControlePNCPCompra: string
  numeroAtaRegistroPreco: string
  anoAta: number
  dataAssinatura: string
  vigenciaInicio: string
  vigenciaFim: string
  cancelado: boolean
  objetoContratacao: string
  cnpjOrgao: string
  nomeOrgao: string
  nomeUnidadeOrgao: string
}

/** Contrato ou empenho com força de contrato publicado no PNCP — busca nacional. */
export interface ContratoPncp {
  numeroControlePNCP: string
  numeroContratoEmpenho: string
  anoContrato: number
  tipoContratoNome: string
  objetoContrato: string
  cnpjOrgao: string
  nomeOrgao: string
  nomeUnidade: string
  niFornecedor: string
  nomeFornecedor: string
  valorInicial: number
  valorGlobal: number
  dataAssinatura: string
  dataVigenciaInicio: string
  dataVigenciaFim: string
  dataPublicacaoPncp: string
}
