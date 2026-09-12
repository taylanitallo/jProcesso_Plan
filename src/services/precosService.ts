import type { MaterialOuServico, PrecoPraticado } from './types'

/**
 * Pesquisa de preços (preços praticados) — Dados Abertos compras.gov.br, via
 * proxy `/compras-api` do Vite (mesmo proxy de `catalogoService.ts` — ver
 * vite.config.ts). Endpoints reais (confirmados no swagger da API):
 *   Material: /modulo-pesquisa-preco/1_consultarMaterial
 *     ?tipo=codigoItemCatalogo&codigo=<cod>&dataCompraInicio&dataCompraFim
 *   Serviço:  /modulo-pesquisa-preco/3_consultarServico
 *     ?codigoItemCatalogo=<cod>&dataCompraInicio&dataCompraFim
 * Fallback: amostra local determinística, só quando a chamada falha de
 * verdade (proxy fora do ar / rede) — uma resposta real com zero linhas
 * (sem histórico de compra pro item no período) NÃO cai pra amostra, porque
 * aí a resposta correta é "nenhum preço encontrado", não um preço inventado.
 */

const BASE_URL = '/compras-api'

export interface PeriodoConsulta {
  /** aaaa-mm-dd. */
  inicio: string
  fim: string
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

const limpa = (s: unknown) => String(s ?? '').trim()
const linhas = (raw: Json | null): Json[] => (Array.isArray(raw?.resultado) ? (raw!.resultado as Json[]) : [])

/** aaaa-mm-dd (ou com hora) → dd/mm/aaaa. */
const dataBr = (s: unknown) => {
  const m = String(s ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

function mapMaterial(l: Json): PrecoPraticado {
  return {
    idCompra: String(l.idCompra ?? ''),
    codigoItemCatalogo: String(l.codigoItemCatalogo ?? ''),
    descricaoDetalhadaItem: limpa(l.descricaoDetalhadaItem || l.descricaoItem || l.objetoCompra),
    quantidade: Number(l.quantidade ?? 0),
    precoUnitario: Number(l.precoUnitario ?? 0),
    nomeFornecedor: limpa(l.nomeFornecedor),
    niFornecedor: limpa(l.niFornecedor),
    dataCompra: dataBr(l.dataCompra),
    codigoUasg: limpa(l.codigoUasg),
  }
}

function mapServico(l: Json): PrecoPraticado {
  return {
    idCompra: String(l.idCompra ?? ''),
    codigoItemCatalogo: String(l.codigoItemCatalogo ?? ''),
    descricaoDetalhadaItem: limpa(l.descricaoDetalhadaItem || l.descricaoItem || l.objetoCompra),
    quantidade: Number(l.quantidade ?? 0),
    precoUnitario: Number(l.precoUnitario ?? 0),
    nomeFornecedor: limpa(l.nomeFornecedor),
    niFornecedor: limpa(l.niFornecedor),
    dataCompra: dataBr(l.dataCompra),
    codigoUasg: limpa(l.codigoUasg),
  }
}

// ---------------------------------------------------------------- amostra local

const FORNECEDORES = [
  ['COMERCIAL NORDESTE LTDA', '12.345.678/0001-90'],
  ['SUPRIMENTOS BRASIL EIRELI', '98.765.432/0001-10'],
  ['DISTRIBUIDORA CENTRO-SUL S.A.', '45.678.912/0001-33'],
  ['MEGA MATERIAIS E SERVIÇOS', '23.456.789/0001-55'],
]

/** Usada só quando o proxy `/compras-api` está fora do ar (rede/build sem dev-server). */
function amostra(codigoItemCatalogo: string): PrecoPraticado[] {
  const base = 10 + (codigoItemCatalogo.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 400)
  return Array.from({ length: 6 }, (_, i) => {
    const [nomeFornecedor, niFornecedor] = FORNECEDORES[i % FORNECEDORES.length]
    const precoUnitario = Number((base * (0.85 + (i % 5) * 0.07)).toFixed(2))
    return {
      idCompra: `${2025 - (i % 2)}NE${String(1000 + i * 37).padStart(6, '0')}`,
      codigoItemCatalogo,
      descricaoDetalhadaItem: `Item ${codigoItemCatalogo} — aquisição registrada em ata/empenho.`,
      quantidade: 10 + i * 5,
      precoUnitario,
      nomeFornecedor,
      niFornecedor,
      dataCompra: `${String(3 + i).padStart(2, '0')}/0${1 + (i % 6)}/2025`,
      codigoUasg: `9260${i}`,
    }
  })
}

// ----------------------------------------------------------------------- API

export const precosService = {
  /** true = a última consulta veio da API real; false = caiu na amostra local. */
  async pesquisarPrecos(
    codigoItemCatalogo: string,
    materialOuServico: MaterialOuServico,
    periodo?: PeriodoConsulta,
  ): Promise<{ itens: PrecoPraticado[]; real: boolean }> {
    const qs = new URLSearchParams({ pagina: '1', tamanhoPagina: '30' })
    if (periodo?.inicio) qs.set('dataCompraInicio', periodo.inicio)
    if (periodo?.fim) qs.set('dataCompraFim', periodo.fim)

    let raw: Json | null
    let mapear: (l: Json) => PrecoPraticado
    if (materialOuServico === 'MATERIAL') {
      qs.set('tipo', 'codigoItemCatalogo')
      qs.set('codigo', codigoItemCatalogo)
      raw = await getJson(`${BASE_URL}/modulo-pesquisa-preco/1_consultarMaterial?${qs}`)
      mapear = mapMaterial
    } else {
      qs.set('codigoItemCatalogo', codigoItemCatalogo)
      raw = await getJson(`${BASE_URL}/modulo-pesquisa-preco/3_consultarServico?${qs}`)
      mapear = mapServico
    }

    if (raw === null) {
      // chamada falhou de verdade (proxy/rede) — só aí usamos amostra.
      return { itens: amostra(codigoItemCatalogo), real: false }
    }
    return { itens: linhas(raw).map(mapear), real: true }
  },
}
