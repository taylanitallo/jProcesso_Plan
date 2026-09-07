import type { CatalogoItemRef, MaterialOuServico, Pagina } from './types'

/**
 * Catálogo CATMAT/CATSER — Dados Abertos compras.gov.br, via proxy `/compras-api`
 * do Vite (ver vite.config.ts — evita CORS no browser; em produção usar um
 * backend/edge equivalente). Fallback: amostra local quando a rede/proxy falha.
 *
 * Hierarquia real:
 *  - Material: Grupo → Classe → PDM → Item
 *    1_consultarGrupoMaterial, 2_consultarClasseMaterial, 3_consultarPdmMaterial,
 *    4_consultarItemMaterial, 6_consultarMaterialUnidadeFornecimento
 *  - Serviço: Seção → Divisão → Grupo → Classe → Subclasse → Item (usamos os
 *    3 primeiros níveis na navegação; o endpoint de itens aceita qualquer
 *    combinação de códigos, então o recorte continua correto):
 *    1_consultarSecaoServico, 2_consultarDivisaoServico, 3_consultarGrupoServico,
 *    6_consultarItemServico
 */

const BASE_URL = '/compras-api'

export type NivelOpcao = { codigo: string; nome: string }

export type FiltroCatalogo =
  | { materialOuServico: 'MATERIAL'; codigoGrupo?: string; codigoClasse?: string; codigoPdm?: string }
  | { materialOuServico: 'SERVICO'; codigoSecao?: string; codigoDivisao?: string; codigoGrupo?: string }
  | { materialOuServico: MaterialOuServico; codigoItem?: string }

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

const limpa = (s: unknown) => String(s ?? '').trim()
const linhas = (raw: Json | null): Json[] => (Array.isArray(raw?.resultado) ? (raw!.resultado as Json[]) : [])
const totalDe = (raw: Json | null) => Number(raw?.totalRegistros ?? 0)

// ------------------------------------------------------------------ material

async function gruposMaterial(): Promise<NivelOpcao[]> {
  const raw = await getJson(`${BASE_URL}/modulo-material/1_consultarGrupoMaterial?pagina=1`)
  return linhas(raw)
    .filter((g) => g.statusGrupo !== false)
    .map((g) => ({ codigo: String(g.codigoGrupo), nome: limpa(g.nomeGrupo) }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

async function classesMaterial(codigoGrupo: string): Promise<NivelOpcao[]> {
  const raw = await getJson(
    `${BASE_URL}/modulo-material/2_consultarClasseMaterial?codigoGrupo=${codigoGrupo}&pagina=1`,
  )
  return linhas(raw)
    .map((c) => ({ codigo: String(c.codigoClasse), nome: limpa(c.nomeClasse) }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

async function pdmsMaterial(codigoGrupo: string, codigoClasse: string): Promise<NivelOpcao[]> {
  const qs = new URLSearchParams({ pagina: '1', tamanhoPagina: '200', codigoGrupo, codigoClasse })
  const raw = await getJson(`${BASE_URL}/modulo-material/3_consultarPdmMaterial?${qs}`)
  return linhas(raw)
    .map((p) => ({ codigo: String(p.codigoPdm), nome: limpa(p.nomePdm) }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

async function unidadesPorPdm(codigosPdm: string[]): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()
  await Promise.all(
    codigosPdm.map(async (cp) => {
      const raw = await getJson(
        `${BASE_URL}/modulo-material/6_consultarMaterialUnidadeFornecimento?codigoPdm=${cp}&pagina=1&tamanhoPagina=10`,
      )
      const primeira = linhas(raw)[0]
      if (primeira) {
        mapa.set(cp, limpa(primeira.nomeUnidadeFornecimento) || limpa(primeira.siglaUnidadeFornecimento))
      }
    }),
  )
  return mapa
}

async function itensMaterial(f: {
  codigoGrupo?: string
  codigoClasse?: string
  codigoPdm?: string
  codigoItem?: string
}): Promise<Pagina<CatalogoItemRef>> {
  const qs = new URLSearchParams({ pagina: '1', tamanhoPagina: '100' })
  if (f.codigoGrupo) qs.set('codigoGrupo', f.codigoGrupo)
  if (f.codigoClasse) qs.set('codigoClasse', f.codigoClasse)
  if (f.codigoPdm) qs.set('codigoPdm', f.codigoPdm)
  if (f.codigoItem) qs.set('codigoItem', f.codigoItem)
  const raw = await getJson(`${BASE_URL}/modulo-material/4_consultarItemMaterial?${qs}`)
  const brutos = linhas(raw)
  const pdms = [...new Set(brutos.map((l) => String(l.codigoPdm)).filter(Boolean))]
  const unidades = pdms.length <= 30 ? await unidadesPorPdm(pdms) : new Map<string, string>()
  const itens: CatalogoItemRef[] = brutos.map((l) => ({
    codigoItemCatalogo: String(l.codigoItem),
    descricaoItem: limpa(l.descricaoItem),
    materialOuServico: 'MATERIAL',
    grupo: `${l.codigoGrupo} - ${limpa(l.nomeGrupo)}`,
    classe: `${l.codigoClasse} - ${limpa(l.nomeClasse)}`,
    pdm: limpa(l.nomePdm),
    unidadeFornecimento: unidades.get(String(l.codigoPdm)) ?? '',
  }))
  return { itens, total: totalDe(raw) }
}

// ------------------------------------------------------------------- serviço

async function secoesServico(): Promise<NivelOpcao[]> {
  const raw = await getJson(`${BASE_URL}/modulo-servico/1_consultarSecaoServico?pagina=1`)
  return linhas(raw)
    .filter((s) => s.statusSecao !== false)
    .map((s) => ({ codigo: String(s.codigoSecao), nome: limpa(s.nomeSecao) }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

async function divisoesServico(codigoSecao: string): Promise<NivelOpcao[]> {
  const raw = await getJson(
    `${BASE_URL}/modulo-servico/2_consultarDivisaoServico?codigoSecao=${codigoSecao}&pagina=1`,
  )
  return linhas(raw)
    .map((d) => ({ codigo: String(d.codigoDivisao), nome: limpa(d.nomeDivisao) }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

async function gruposServico(codigoDivisao: string): Promise<NivelOpcao[]> {
  const raw = await getJson(
    `${BASE_URL}/modulo-servico/3_consultarGrupoServico?codigoDivisao=${codigoDivisao}&pagina=1`,
  )
  return linhas(raw)
    .map((g) => ({ codigo: String(g.codigoGrupo), nome: limpa(g.nomeGrupo) }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

async function itensServico(f: {
  codigoSecao?: string
  codigoDivisao?: string
  codigoGrupo?: string
  codigoItem?: string
}): Promise<Pagina<CatalogoItemRef>> {
  const qs = new URLSearchParams({ pagina: '1', tamanhoPagina: '100' })
  if (f.codigoSecao) qs.set('codigoSecao', f.codigoSecao)
  if (f.codigoDivisao) qs.set('codigoDivisao', f.codigoDivisao)
  if (f.codigoGrupo) qs.set('codigoGrupo', f.codigoGrupo)
  if (f.codigoItem) qs.set('codigoServico', f.codigoItem)
  const raw = await getJson(`${BASE_URL}/modulo-servico/6_consultarItemServico?${qs}`)
  const brutos = linhas(raw)
  const itens: CatalogoItemRef[] = brutos.map((l) => ({
    codigoItemCatalogo: String(l.codigoServico),
    descricaoItem: limpa(l.nomeServico),
    materialOuServico: 'SERVICO',
    secao: `${l.codigoSecao} - ${limpa(l.nomeSecao)}`,
    divisao: `${l.codigoDivisao} - ${limpa(l.nomeDivisao)}`,
    grupo: `${l.codigoGrupo} - ${limpa(l.nomeGrupo)}`,
    classe: l.nomeClasse ? `${l.codigoClasse} - ${limpa(l.nomeClasse)}` : undefined,
    unidadeFornecimento: 'SERVIÇO',
  }))
  return { itens, total: totalDe(raw) }
}

// ---------------------------------------------------------------- amostra local

/** Usada só quando o proxy `/compras-api` está fora do ar (ex.: build sem dev-server). */
const AMOSTRA: CatalogoItemRef[] = [
  {
    codigoItemCatalogo: '450127',
    descricaoItem: 'Notebook 15.6" Core i5, 16GB RAM, SSD 512GB',
    materialOuServico: 'MATERIAL',
    grupo: '70 - Informática',
    classe: '7010 - Computadores',
    pdm: 'Notebook',
    unidadeFornecimento: 'UNIDADE',
    informacaoComplementar: 'Intel Core i5, 16GB RAM, SSD NVMe 512GB, tela Full HD.',
  },
  {
    codigoItemCatalogo: '279233',
    descricaoItem: 'Papel A4 75g branco - resma 500 folhas',
    materialOuServico: 'MATERIAL',
    grupo: '75 - Utensílios de escritório',
    classe: '7530 - Papel e produtos de papel',
    pdm: 'Papel',
    unidadeFornecimento: 'RESMA',
    informacaoComplementar: 'Papel sulfite branco, alcalino, formato A4 (210x297mm), 75g/m².',
  },
  {
    codigoItemCatalogo: '9120',
    descricaoItem: 'Serviço continuado de limpeza e conservação predial',
    materialOuServico: 'SERVICO',
    secao: '9 - Serviços da comunidade e sociais',
    divisao: '81 - Serviços para edifícios',
    grupo: '812 - Atividades de limpeza',
    unidadeFornecimento: 'SERVIÇO',
    informacaoComplementar: 'Mão de obra e insumos inclusos.',
  },
]

// ----------------------------------------------------------------------- API

export const catalogoService = {
  async consultarNivel1(m: MaterialOuServico): Promise<NivelOpcao[]> {
    const r = m === 'MATERIAL' ? await gruposMaterial() : await secoesServico()
    return r.length > 0 ? r : []
  },
  async consultarNivel2(m: MaterialOuServico, codigo1: string): Promise<NivelOpcao[]> {
    if (!codigo1) return []
    return m === 'MATERIAL' ? classesMaterial(codigo1) : divisoesServico(codigo1)
  },
  async consultarNivel3(
    m: MaterialOuServico,
    codigo1: string,
    codigo2: string,
  ): Promise<NivelOpcao[]> {
    if (!codigo2) return []
    return m === 'MATERIAL' ? pdmsMaterial(codigo1, codigo2) : gruposServico(codigo2)
  },
  async consultarItens(f: FiltroCatalogo): Promise<Pagina<CatalogoItemRef>> {
    const r =
      f.materialOuServico === 'MATERIAL'
        ? await itensMaterial(f as { codigoGrupo?: string; codigoClasse?: string; codigoPdm?: string; codigoItem?: string })
        : await itensServico(f as { codigoSecao?: string; codigoDivisao?: string; codigoGrupo?: string; codigoItem?: string })
    if (r.itens.length > 0) return r
    // sem filtro nenhum aplicado e API fora do ar: cai pra amostra local
    const semFiltro = Object.values(f).every((v) => v === f.materialOuServico || v === undefined)
    if (semFiltro) {
      return { itens: AMOSTRA.filter((a) => a.materialOuServico === f.materialOuServico), total: 0 }
    }
    return r
  },
  /** Amostra curada — a base real tem centenas de milhares de itens; navegue por Grupo/Classe/PDM ou Código. */
  async consultarBaseInteira(): Promise<CatalogoItemRef[]> {
    return [...AMOSTRA]
  },
  /** Busca exata por código (codigoItem material ou codigoServico). */
  async consultarPorCodigo(codigo: string): Promise<CatalogoItemRef[]> {
    const q = codigo.trim()
    if (!q) return []
    const [mat, serv] = await Promise.all([
      itensMaterial({ codigoItem: q }),
      itensServico({ codigoItem: q }),
    ])
    return [...mat.itens, ...serv.itens]
  },
}
