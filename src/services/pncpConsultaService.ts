import type { AtaPncp, ContratacaoPncp, ContratoPncp } from './types'

/**
 * Consulta pública nacional do PNCP — API "Consulta" (sem autenticação,
 * cobre todos os órgãos do Brasil). Base oficial: `https://pncp.gov.br/api/consulta`
 * (Manual PNCP API Consultas v1.0). Proxy `/pncp-api` — ver vite.config.ts.
 *
 * Sem fallback mock: é busca nacional ao vivo (não tem seed natural tipo
 * CNPJ+ano pra gerar amostra plausível); se a rede falhar, retorna lista
 * vazia com `real: false` — a UI mostra estado de indisponibilidade, nunca
 * dado nacional inventado.
 */

const CONSULTA = '/pncp-api/api/consulta/v1'
const TAMANHO_PAGINA = 50

const soDigitos = (s: string) => s.replace(/\D/g, '')
const dataApi = (iso: string) => iso.replace(/-/g, '')
const brNum = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const fmtData = (v: unknown): string => {
  const m = String(v ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}
const fmtDataHora = (v: unknown): string => {
  const m = String(v ?? '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : fmtData(v)
}

type Json = Record<string, unknown>

async function getJson(url: string): Promise<Json | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const txt = await res.text()
    return txt ? (JSON.parse(txt) as Json) : null
  } catch {
    return null
  }
}

const linhas = (raw: Json | null): Json[] => (Array.isArray(raw?.data) ? (raw.data as Json[]) : [])

function mapContratacao(c: Json): ContratacaoPncp {
  const org = (c.orgaoEntidade as Json) ?? {}
  const un = (c.unidadeOrgao as Json) ?? {}
  return {
    numeroControlePNCP: String(c.numeroControlePNCP ?? ''),
    numeroCompra: String(c.numeroCompra ?? ''),
    anoCompra: brNum(c.anoCompra),
    processo: String(c.processo ?? ''),
    modalidadeNome: String(c.modalidadeNome ?? ''),
    situacaoCompraNome: String(c.situacaoCompraNome ?? ''),
    objetoCompra: String(c.objetoCompra ?? ''),
    valorTotalEstimado: brNum(c.valorTotalEstimado),
    valorTotalHomologado: brNum(c.valorTotalHomologado),
    dataAberturaProposta: fmtDataHora(c.dataAberturaProposta),
    dataEncerramentoProposta: fmtDataHora(c.dataEncerramentoProposta),
    dataPublicacaoPncp: fmtData(c.dataPublicacaoPncp),
    srp: Boolean(c.srp),
    cnpjOrgao: String(org.cnpj ?? ''),
    nomeOrgao: String(org.razaoSocial ?? ''),
    nomeUnidade: String(un.nomeUnidade ?? ''),
    municipio: String(un.municipioNome ?? ''),
    uf: String(un.ufSigla ?? ''),
  }
}

function mapAta(a: Json): AtaPncp {
  return {
    numeroControlePNCPAta: String(a.numeroControlePNCPAta ?? ''),
    numeroControlePNCPCompra: String(a.numeroControlePNCPCompra ?? ''),
    numeroAtaRegistroPreco: String(a.numeroAtaRegistroPreco ?? ''),
    anoAta: brNum(a.anoAta),
    dataAssinatura: fmtData(a.dataAssinatura),
    vigenciaInicio: fmtData(a.vigenciaInicio),
    vigenciaFim: fmtData(a.vigenciaFim),
    cancelado: Boolean(a.cancelado),
    objetoContratacao: String(a.objetoContratacao ?? ''),
    cnpjOrgao: String(a.cnpjOrgao ?? ''),
    nomeOrgao: String(a.nomeOrgao ?? ''),
    nomeUnidadeOrgao: String(a.nomeUnidadeOrgao ?? ''),
  }
}

function mapContrato(c: Json): ContratoPncp {
  const org = (c.orgaoEntidade as Json) ?? {}
  const un = (c.unidadeOrgao as Json) ?? {}
  const tipo = (c.tipoContrato as Json) ?? {}
  return {
    numeroControlePNCP: String(c.numeroControlePNCP ?? ''),
    numeroContratoEmpenho: String(c.numeroContratoEmpenho ?? ''),
    anoContrato: brNum(c.anoContrato),
    tipoContratoNome: String(tipo.nome ?? ''),
    objetoContrato: String(c.objetoContrato ?? ''),
    cnpjOrgao: String(org.cnpj ?? ''),
    nomeOrgao: String(org.razaoSocial ?? ''),
    nomeUnidade: String(un.nomeUnidade ?? ''),
    niFornecedor: String(c.niFornecedor ?? ''),
    nomeFornecedor: String(c.nomeRazaoSocialFornecedor ?? ''),
    valorInicial: brNum(c.valorInicial),
    valorGlobal: brNum(c.valorGlobal),
    dataAssinatura: fmtData(c.dataAssinatura),
    dataVigenciaInicio: fmtData(c.dataVigenciaInicio),
    dataVigenciaFim: fmtData(c.dataVigenciaFim),
    dataPublicacaoPncp: fmtDataHora(c.dataPublicacaoPncp),
  }
}

export interface FiltroContratacoes {
  dataInicial: string
  dataFinal: string
  codigoModalidadeContratacao: number
  cnpj?: string
  uf?: string
}

export interface FiltroPeriodoOrgao {
  dataInicial: string
  dataFinal: string
  cnpj?: string
}

export const pncpConsultaService = {
  /** Contratações (licitações/contratações diretas) publicadas por período+modalidade. */
  async consultarContratacoes(
    f: FiltroContratacoes,
  ): Promise<{ itens: ContratacaoPncp[]; total: number; real: boolean }> {
    const params = new URLSearchParams({
      dataInicial: dataApi(f.dataInicial),
      dataFinal: dataApi(f.dataFinal),
      codigoModalidadeContratacao: String(f.codigoModalidadeContratacao),
      pagina: '1',
      tamanhoPagina: String(TAMANHO_PAGINA),
    })
    if (f.cnpj?.trim()) params.set('cnpj', soDigitos(f.cnpj))
    if (f.uf?.trim()) params.set('uf', f.uf.trim())
    const raw = await getJson(`${CONSULTA}/contratacoes/publicacao?${params}`)
    if (raw === null) return { itens: [], total: 0, real: false }
    return { itens: linhas(raw).map(mapContratacao), total: brNum(raw.totalRegistros), real: true }
  },

  /** Atas de Registro de Preço cujo período de vigência coincide com o informado. */
  async consultarAtas(
    f: FiltroPeriodoOrgao,
  ): Promise<{ itens: AtaPncp[]; total: number; real: boolean }> {
    const params = new URLSearchParams({
      dataInicial: dataApi(f.dataInicial),
      dataFinal: dataApi(f.dataFinal),
      pagina: '1',
      tamanhoPagina: String(TAMANHO_PAGINA),
    })
    if (f.cnpj?.trim()) params.set('cnpj', soDigitos(f.cnpj))
    const raw = await getJson(`${CONSULTA}/atas?${params}`)
    if (raw === null) return { itens: [], total: 0, real: false }
    return { itens: linhas(raw).map(mapAta), total: brNum(raw.totalRegistros), real: true }
  },

  /** Contratos/empenhos com força de contrato publicados por período. */
  async consultarContratos(
    f: FiltroPeriodoOrgao,
  ): Promise<{ itens: ContratoPncp[]; total: number; real: boolean }> {
    const params = new URLSearchParams({
      dataInicial: dataApi(f.dataInicial),
      dataFinal: dataApi(f.dataFinal),
      pagina: '1',
      tamanhoPagina: String(TAMANHO_PAGINA),
    })
    if (f.cnpj?.trim()) params.set('cnpjOrgao', soDigitos(f.cnpj))
    const raw = await getJson(`${CONSULTA}/contratos?${params}`)
    if (raw === null) return { itens: [], total: 0, real: false }
    return { itens: linhas(raw).map(mapContrato), total: brNum(raw.totalRegistros), real: true }
  },
}

/** Modalidade de Contratação (tabela de domínio do PNCP — Manual de Consultas 5.2). */
export const MODALIDADES_CONTRATACAO: { codigo: number; nome: string }[] = [
  { codigo: 1, nome: 'Leilão - Eletrônico' },
  { codigo: 2, nome: 'Diálogo Competitivo' },
  { codigo: 3, nome: 'Concurso' },
  { codigo: 4, nome: 'Concorrência - Eletrônica' },
  { codigo: 5, nome: 'Concorrência - Presencial' },
  { codigo: 6, nome: 'Pregão - Eletrônico' },
  { codigo: 7, nome: 'Pregão - Presencial' },
  { codigo: 8, nome: 'Dispensa de Licitação' },
  { codigo: 9, nome: 'Inexigibilidade' },
  { codigo: 10, nome: 'Manifestação de Interesse' },
  { codigo: 11, nome: 'Pré-qualificação' },
  { codigo: 12, nome: 'Credenciamento' },
  { codigo: 13, nome: 'Leilão - Presencial' },
]
