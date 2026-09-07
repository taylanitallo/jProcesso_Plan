import type { MaterialOuServico, PcaCabecalho, PcaItem } from './types'

/**
 * Plano de Contratação Anual (PCA/PGC).
 *
 * Primário: API do PNCP (via proxy `/pncp-api` do Vite — ver vite.config.ts).
 *   - Órgão:   GET /api/pncp/v1/orgaos/{cnpj}
 *   - Itens:   GET /api/pncp/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens?pagina&tamanhoPagina
 *              (não existe endpoint de cabeçalho por GET — o cabeçalho é
 *               derivado dos próprios itens)
 * Fallback: mock determinístico (varia por CNPJ + ano) quando a rede/endpoint
 *   não responde — ex.: build de produção sem o proxy.
 */

const PNCP = '/pncp-api/api/pncp/v1'
const SEQ_MAX = 30
const PAGINA_TAM = 500

const soDigitos = (s: string) => s.replace(/\D/g, '')
const brNum = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const fmtData = (iso: unknown): string => {
  if (typeof iso !== 'string' || !iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : d.toLocaleDateString('pt-BR')
}

type Json = Record<string, unknown>

async function getJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok || res.status === 204) return null
    const txt = await res.text()
    return txt ? JSON.parse(txt) : null
  } catch {
    return null
  }
}

// ------------------------------------------------------------- PNCP: mapeamento

function mapItem(it: Json): PcaItem {
  const catNome = String(it.categoriaItemPcaNome ?? it.nomeClassificacao ?? '')
  const mos: MaterialOuServico = /serv/i.test(catNome) ? 'SERVICO' : 'MATERIAL'
  const qtd = brNum(it.quantidade ?? it.quantidadeEstimada)
  const unit = brNum(it.valorUnitario ?? it.valorUnitarioEstimado)
  return {
    numeroItem: brNum(it.numeroItem),
    materialOuServico: mos,
    categoria: mos === 'MATERIAL' ? 'Material' : 'Serviço',
    classificacao: String(it.classificacaoSuperiorNome ?? it.grupoContratacaoNome ?? ''),
    descricao: String(it.descricao ?? ''),
    informacaoComplementar:
      typeof it.informacaoComplementar === 'string' && it.informacaoComplementar
        ? it.informacaoComplementar
        : undefined,
    unidadeFornecimento: String(it.unidadeFornecimento ?? ''),
    quantidadeEstimada: qtd,
    valorUnitarioEstimado: unit,
    valorTotalEstimado: brNum(it.valorTotal) || Number((qtd * unit).toFixed(2)),
    codigoItemCatalogo: it.codigoItem != null ? String(it.codigoItem) : '',
  }
}

type SeqMeta = { codigoUnidade: string; nomeUnidade: string; dataPublicacao: string }

/** Busca todos os itens de um sequencial (paginando) + metadados do 1º item. */
async function carregarSeq(
  cnpj: string,
  ano: number,
  seq: number,
): Promise<{ seq: number; itens: PcaItem[]; meta: SeqMeta | null }> {
  const itens: PcaItem[] = []
  let meta: SeqMeta | null = null
  for (let pagina = 1; pagina <= 25; pagina++) {
    const raw = await getJson(
      `${PNCP}/orgaos/${cnpj}/pca/${ano}/${seq}/itens?pagina=${pagina}&tamanhoPagina=${PAGINA_TAM}`,
    )
    const lista: Json[] = Array.isArray(raw) ? (raw as Json[]) : []
    if (lista.length === 0) break
    if (!meta) {
      meta = {
        codigoUnidade: String(lista[0].codigoUnidade ?? ''),
        nomeUnidade: String(lista[0].nomeUnidade ?? ''),
        dataPublicacao: fmtData(lista[0].dataPublicacaoPncp ?? lista[0].dataPublicacao),
      }
    }
    itens.push(...lista.map(mapItem))
    if (lista.length < PAGINA_TAM) break
  }
  return { seq, itens, meta }
}

type CachePca = { cabecalhos: PcaCabecalho[]; itensPorSeq: Map<number, PcaItem[]> }
const cache = new Map<string, CachePca>()
const semPncp = new Set<string>()

async function carregarPncp(
  cnpjFmt: string,
  cnpj: string,
  ano: number,
): Promise<CachePca | null> {
  const chave = `${cnpj}|${ano}`
  const hit = cache.get(chave)
  if (hit) return hit
  if (semPncp.has(chave)) return null

  const [orgao, unidadesRaw] = await Promise.all([
    getJson(`${PNCP}/orgaos/${cnpj}`) as Promise<Json | null>,
    getJson(`${PNCP}/orgaos/${cnpj}/unidades?pagina=1&tamanhoPagina=500`),
  ])
  const nomeOrgao = String(orgao?.razaoSocial ?? orgao?.nomeFantasia ?? '').trim()

  const unidades = Array.isArray(unidadesRaw) ? (unidadesRaw as Json[]) : []
  const nomePorCodigo = new Map<string, string>()
  let localizacao = ''
  for (const u of unidades) {
    const cod = String(u.codigoUnidade ?? '').replace(/^0+/, '')
    if (cod) nomePorCodigo.set(cod, String(u.nomeUnidade ?? '').trim())
    const m = u.municipio as Json | undefined
    if (!localizacao && m) {
      localizacao = [m.nome, (m.uf as Json | undefined)?.siglaUF].filter(Boolean).join(' - ')
    }
  }
  const unidadeNome = (cod: string, fallback: string) =>
    nomePorCodigo.get(String(cod).replace(/^0+/, '')) || fallback.trim()

  const partes = await Promise.all(
    Array.from({ length: SEQ_MAX }, (_, i) => carregarSeq(cnpj, ano, i + 1)),
  )

  const cabecalhos: PcaCabecalho[] = []
  const itensPorSeq = new Map<number, PcaItem[]>()
  for (const { seq, itens, meta } of partes) {
    if (itens.length === 0) continue
    itensPorSeq.set(seq, itens)
    cabecalhos.push({
      cnpjOrgao: cnpjFmt,
      nomeOrgao: nomeOrgao || 'Órgão',
      anoPca: ano,
      sequencial: seq,
      numeroControlePNCP: `${cnpj}-0-${String(seq).padStart(6, '0')}/${ano}`,
      codigoUnidade: meta?.codigoUnidade ?? '',
      nomeUnidade: unidadeNome(meta?.codigoUnidade ?? '', meta?.nomeUnidade ?? ''),
      localizacao,
      dataPublicacao: meta?.dataPublicacao ?? '',
      totalItens: itens.length,
      valorTotalEstimado: Number(
        itens.reduce((s, it) => s + it.valorTotalEstimado, 0).toFixed(2),
      ),
    })
  }
  if (cabecalhos.length === 0) {
    semPncp.add(chave)
    return null
  }

  cabecalhos.sort((a, b) => a.sequencial - b.sequencial)
  const resultado = { cabecalhos, itensPorSeq }
  cache.set(chave, resultado)
  return resultado
}

// --------------------------------------------------------------------- fallback

const ORGAOS: { nome: string; uf: string; municipio: string; uasg: string }[] = [
  { nome: 'MUNICÍPIO DE IRAUÇUBA', uf: 'CE', municipio: 'Irauçuba', uasg: '2501' },
  { nome: 'PREFEITURA MUNICIPAL DE SOBRAL', uf: 'CE', municipio: 'Sobral', uasg: '9834' },
  { nome: 'PREFEITURA MUNICIPAL DE JUAZEIRO DO NORTE', uf: 'CE', municipio: 'Juazeiro do Norte', uasg: '4471' },
  { nome: 'GOVERNO DO ESTADO DO CEARÁ', uf: 'CE', municipio: 'Fortaleza', uasg: '7010' },
  { nome: 'MUNICÍPIO DE MARACANAÚ', uf: 'CE', municipio: 'Maracanaú', uasg: '3388' },
  { nome: 'UNIVERSIDADE FEDERAL DO CEARÁ', uf: 'CE', municipio: 'Fortaleza', uasg: '153045' },
  { nome: 'MUNICÍPIO DE QUIXADÁ', uf: 'CE', municipio: 'Quixadá', uasg: '5522' },
  { nome: 'PREFEITURA MUNICIPAL DE CRATO', uf: 'CE', municipio: 'Crato', uasg: '6690' },
]

const UNIDADES = [
  'SECRETARIA DE ADMINISTRAÇÃO E FINANÇAS',
  'SECRETARIA MUNICIPAL DA SAÚDE',
  'SECRETARIA MUNICIPAL DE EDUCAÇÃO',
  'SECRETARIA DE INFRAESTRUTURA E OBRAS',
  'SECRETARIA DO DESENVOLVIMENTO RURAL, MEIO AMBIENTE E RECURSOS HÍDRICOS',
  'SECRETARIA DE ASSISTÊNCIA SOCIAL E CIDADANIA',
  'SECRETARIA DE CULTURA, ESPORTE E JUVENTUDE',
  'CONTROLADORIA E OUVIDORIA GERAL DO MUNICÍPIO',
  'GABINETE DO PREFEITO',
  'PROCURADORIA GERAL DO MUNICÍPIO',
]

const CATALOGO: [string, MaterialOuServico, string, string][] = [
  ['ADAPTADOR COM FLANGE 1 - 32MM.', 'MATERIAL', 'ACESSÓRIOS E FERRAGENS PARA MANGUEIRAS, CANOS E TUBOS', 'UNIDADE'],
  ['ADAPTADOR ELÉTRICO TÊ', 'MATERIAL', 'CONECTORES ELÉTRICOS', 'UNIDADE'],
  ['CIMENTO PORTLAND CP-II 50KG', 'MATERIAL', 'MATERIAIS DE CONSTRUÇÃO', 'SACO'],
  ['AREIA MÉDIA LAVADA', 'MATERIAL', 'AGREGADOS PARA CONSTRUÇÃO', 'M3'],
  ['TINTA LÁTEX ACRÍLICA 18L', 'MATERIAL', 'TINTAS E VERNIZES', 'LATA'],
  ['NOTEBOOK CORE I5 16GB SSD 512GB', 'MATERIAL', 'EQUIPAMENTOS DE INFORMÁTICA', 'UNIDADE'],
  ['SERVIÇO DE MANUTENÇÃO DE AR-CONDICIONADO', 'SERVICO', 'MANUTENÇÃO PREDIAL', 'SERVIÇO'],
  ['LOCAÇÃO DE PALCO E SONORIZAÇÃO', 'SERVICO', 'LOCAÇÃO DE EQUIPAMENTOS PARA EVENTOS', 'DIÁRIA'],
  ['SERVIÇO CONTINUADO DE LIMPEZA PREDIAL', 'SERVICO', 'LIMPEZA E CONSERVAÇÃO', 'POSTO'],
  ['COMBUSTÍVEL - ÓLEO DIESEL S10', 'MATERIAL', 'COMBUSTÍVEIS E LUBRIFICANTES', 'LITRO'],
  ['PNEU 275/80 R22.5', 'MATERIAL', 'PNEUS E CÂMARAS DE AR', 'UNIDADE'],
  ['MEDICAMENTO - DIPIRONA SÓDICA 500MG', 'MATERIAL', 'MEDICAMENTOS', 'COMPRIMIDO'],
  ['MERENDA ESCOLAR - ARROZ TIPO 1 5KG', 'MATERIAL', 'GÊNEROS ALIMENTÍCIOS', 'PACOTE'],
]

const espera = () => new Promise((r) => setTimeout(r, 150))
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

function mockGerarItens(seed: number): PcaItem[] {
  return Array.from({ length: 18 + (seed % 12) }, (_, i) => {
    const [descricao, mos, classificacao, unid] = CATALOGO[(seed + i) % CATALOGO.length]
    const quantidadeEstimada = 1 + ((seed * 7 + i * 3) % 60)
    const valorUnitarioEstimado = Number(
      (2 + ((seed * 13 + i * 29) % 1800) + ((i * 7) % 100) / 100).toFixed(2),
    )
    return {
      numeroItem: 10000 + (seed % 900) * 10 + i,
      materialOuServico: mos,
      categoria: mos === 'MATERIAL' ? 'Material' : 'Serviço',
      classificacao,
      descricao,
      unidadeFornecimento: unid,
      quantidadeEstimada,
      valorUnitarioEstimado,
      valorTotalEstimado: Number((quantidadeEstimada * valorUnitarioEstimado).toFixed(2)),
      codigoItemCatalogo: `BR${100000 + (seed % 5000) + i}`,
    }
  })
}

function mockCabecalhos(cnpjFmt: string, cnpj: string, ano: number): PcaCabecalho[] {
  const h = hash(cnpj + ano)
  const org = ORGAOS[h % ORGAOS.length]
  return Array.from({ length: 5 + (h % 9) }, (_, k) => {
    const sequencial = k + 1
    const seed = (h * 17 + sequencial * 101) >>> 0
    const itens = mockGerarItens(seed)
    const dia = 1 + (seed % 27)
    const mes = 1 + (seed % 12)
    return {
      cnpjOrgao: cnpjFmt,
      nomeOrgao: org.nome,
      anoPca: ano,
      sequencial,
      numeroControlePNCP: `${cnpj}-0-${String(sequencial).padStart(6, '0')}/${ano}`,
      codigoUnidade: String(Number(org.uasg) + sequencial),
      nomeUnidade: UNIDADES[(h + sequencial) % UNIDADES.length],
      localizacao: `${org.municipio} - ${org.uf}`,
      dataPublicacao: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano - 1}`,
      totalItens: itens.length,
      valorTotalEstimado: Number(itens.reduce((s, it) => s + it.valorTotalEstimado, 0).toFixed(2)),
    }
  })
}

// ----------------------------------------------------------------------- público

export const pcaService = {
  /** Lista os PCAs publicados por um órgão no ano (PNCP real, com fallback). */
  async consultarPca(cnpjOrgao: string, anoPca: number): Promise<PcaCabecalho[]> {
    const cnpj = soDigitos(cnpjOrgao)
    const real = await carregarPncp(cnpjOrgao, cnpj, anoPca)
    if (real) return real.cabecalhos
    await espera()
    return mockCabecalhos(cnpjOrgao, cnpj, anoPca)
  },

  /** Itens de um PCA específico (cache do PNCP; fallback ao mock). */
  async consultarItensPca(
    cnpjOrgao: string,
    anoPca: number,
    sequencial: number,
  ): Promise<PcaItem[]> {
    const cnpj = soDigitos(cnpjOrgao)
    const real = await carregarPncp(cnpjOrgao, cnpj, anoPca)
    if (real) {
      const emCache = real.itensPorSeq.get(sequencial)
      if (emCache) return emCache
      const { itens } = await carregarSeq(cnpj, anoPca, sequencial)
      if (itens.length > 0) return itens
    }
    await espera()
    return mockGerarItens((hash(cnpj + anoPca) * 17 + sequencial * 101) >>> 0)
  },
}
