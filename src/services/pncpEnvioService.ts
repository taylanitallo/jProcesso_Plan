import { catalogoService } from './catalogoService'
import type { MaterialOuServico } from './types'

/**
 * Escrita real no PNCP — Manual de Integração v2.6 (swagger
 * `/api/pncp/v3/api-docs`, confirmado ao vivo nesta sessão):
 *
 *  1. `POST {BASE}/v1/usuarios/login` `{ login, senha }` → o JWT NÃO vem no
 *     corpo, vem no cabeçalho `Authorization: Bearer <token>` da resposta
 *     (seção 5.4 do manual). Token válido por 1h.
 *  2. `POST {BASE}/v1/orgaos/{cnpj}/pca` `Authorization: Bearer <token>`
 *     `{ codigoUnidade, anoPca, itensPlano: IncluirPlanoContratacaoItemDTO[] }`
 *     — cria o PCA inteiro (cabeçalho + até 1000 itens) numa chamada só.
 *
 * Autenticação é de **plataforma**, não de usuário final: exige credenciamento
 * junto ao Ministério da Gestão (produção) OU login de teste no ambiente de
 * Treinamento/Homologação (treina.pncp.gov.br — autocadastro de órgão/unidade,
 * sem credenciamento formal). Por isso o login/senha nunca são persistidos —
 * vivem só na sessão do formulário de transmissão.
 */

export type AmbientePncp = 'homologacao' | 'producao'

const BASE: Record<AmbientePncp, string> = {
  homologacao: '/pncp-homolog-api/api/pncp',
  producao: '/pncp-api/api/pncp',
}

const soDigitos = (s: string) => s.replace(/\D/g, '')

export interface CredencialPncp {
  ambiente: AmbientePncp
  login: string
  senha: string
}

export type ResultadoAuth = { ok: true; token: string } | { ok: false; erro: string }

/** Autentica a plataforma no PNCP; retorna o JWT (extraído do header, nunca do corpo). */
export async function autenticarPncp(cred: CredencialPncp): Promise<ResultadoAuth> {
  try {
    const res = await fetch(`${BASE[cred.ambiente]}/v1/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: '*/*' },
      body: JSON.stringify({ login: cred.login.trim(), senha: cred.senha }),
    })
    if (res.status === 401 || res.status === 400) {
      return { ok: false, erro: 'Login ou senha recusados pelo PNCP.' }
    }
    if (!res.ok) return { ok: false, erro: `Falha na autenticação (HTTP ${res.status}).` }
    const auth = res.headers.get('authorization') ?? res.headers.get('Authorization')
    const token = auth?.replace(/^Bearer\s+/i, '').trim()
    if (!token) {
      return { ok: false, erro: 'PNCP aceitou o login mas não devolveu token no cabeçalho.' }
    }
    return { ok: true, token }
  } catch {
    return { ok: false, erro: 'Não foi possível conectar ao PNCP (rede/proxy indisponível).' }
  }
}

/** Item local a transmitir — subconjunto do `PcaItemLocal` do store, sem acoplar ao store. */
export interface ItemParaEnvio {
  numeroItem: number
  materialOuServico: MaterialOuServico
  categoriaItemId: number
  codigoItemCatalogo: string
  descricao: string
  unidadeFornecimento: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  /** aaaa-mm-dd */
  dataDesejadaIso: string
  unidadeRequisitante?: string
}

export interface ItemPreparado {
  numeroItem: number
  descricao: string
  ok: boolean
  erro?: string
  dto?: Record<string, unknown>
}

/**
 * Busca a classificação superior (classe/grupo) real no CatMat/CatSer pelo
 * código do item e monta o DTO oficial `IncluirPlanoContratacaoItemDTO`.
 * Nunca inventa classificacaoSuperiorCodigo/Nome — sem confirmação real no
 * catálogo, o item fica marcado com erro e não é enviado.
 */
async function prepararItem(it: ItemParaEnvio): Promise<ItemPreparado> {
  const base = { numeroItem: it.numeroItem, descricao: it.descricao }
  if (!it.codigoItemCatalogo.trim()) {
    return { ...base, ok: false, erro: 'Sem código do catálogo (CatMat/CatSer) — obrigatório pro PNCP.' }
  }
  if (!it.dataDesejadaIso) {
    return { ...base, ok: false, erro: 'DFD sem data desejada.' }
  }
  const refs = await catalogoService.consultarPorCodigo(it.codigoItemCatalogo)
  const ref = refs.find((r) => r.materialOuServico === it.materialOuServico)
  if (!ref) {
    return {
      ...base,
      ok: false,
      erro: `Código ${it.codigoItemCatalogo} não confirmado no CatMat/CatSer oficial.`,
    }
  }
  const bruto = it.materialOuServico === 'MATERIAL' ? ref.classe : ref.grupo
  const m = bruto?.match(/^(\S+)\s*-\s*(.+)$/)
  if (!m) {
    return {
      ...base,
      ok: false,
      erro: `Item ${it.codigoItemCatalogo} sem classe/grupo do catálogo — não dá pra montar a classificação superior.`,
    }
  }
  return {
    ...base,
    ok: true,
    dto: {
      numeroItem: it.numeroItem,
      categoriaItemPca: it.categoriaItemId,
      catalogo: 1,
      classificacaoCatalogo: it.materialOuServico === 'MATERIAL' ? '1' : '2',
      classificacaoSuperiorCodigo: m[1],
      classificacaoSuperiorNome: m[2],
      codigoItem: it.codigoItemCatalogo,
      descricao: it.descricao,
      unidadeFornecimento: it.unidadeFornecimento,
      quantidade: it.quantidade,
      valorUnitario: it.valorUnitario,
      valorTotal: it.valorTotal,
      valorOrcamentoExercicio: it.valorTotal,
      dataDesejada: it.dataDesejadaIso,
      ...(it.unidadeRequisitante ? { unidadeRequisitante: it.unidadeRequisitante } : {}),
    },
  }
}

export interface PreparoPca {
  prontosParaEnvio: boolean
  itens: ItemPreparado[]
  payload: { codigoUnidade: string; anoPca: number; itensPlano: Record<string, unknown>[] } | null
}

/** Prepara (valida + monta) o payload de um PCA — não envia nada ainda. */
export async function prepararEnvioPca(p: {
  codigoUnidade: string
  anoPca: number
  itens: ItemParaEnvio[]
}): Promise<PreparoPca> {
  const itens = await Promise.all(p.itens.map(prepararItem))
  const prontosParaEnvio = itens.length > 0 && itens.every((i) => i.ok)
  return {
    prontosParaEnvio,
    itens,
    payload: prontosParaEnvio
      ? {
          codigoUnidade: p.codigoUnidade,
          anoPca: p.anoPca,
          itensPlano: itens.map((i) => i.dto as Record<string, unknown>),
        }
      : null,
}
}

export interface ErroDetalhe {
  campo?: string
  mensagem: string
}

export type ResultadoEnvio =
  | { ok: true; numeroControlePNCP: string }
  | { ok: false; erro: string; detalhes?: ErroDetalhe[] }

/** Transmite o PCA de fato — POST único com cabeçalho + itens. */
export async function enviarPca(
  cred: Pick<CredencialPncp, 'ambiente'>,
  token: string,
  cnpjOrgao: string,
  payload: { codigoUnidade: string; anoPca: number; itensPlano: Record<string, unknown>[] },
): Promise<ResultadoEnvio> {
  try {
    const res = await fetch(`${BASE[cred.ambiente]}/v1/orgaos/${soDigitos(cnpjOrgao)}/pca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (res.status === 401) return { ok: false, erro: 'Sessão do PNCP expirou — autentique de novo.' }
    if (!res.ok) {
      let detalhes: ErroDetalhe[] | undefined
      try {
        const j = (await res.json()) as { erros?: ErroDetalhe[] } | Record<string, string>
        detalhes = Array.isArray((j as { erros?: ErroDetalhe[] }).erros)
          ? (j as { erros: ErroDetalhe[] }).erros
          : undefined
      } catch {
        /* corpo não é JSON — sem detalhe extra */
      }
      return { ok: false, erro: `PNCP recusou o envio (HTTP ${res.status}).`, detalhes }
    }
    // O número de controle é dado pela composição {cnpj}-0-{sequencial}/{ano};
    // como o corpo de retorno não é padronizado no manual, usamos o cabeçalho
    // Location quando presente e caímos pra uma marca de "enviado" honesta.
    const location = res.headers.get('location') ?? ''
    const numeroControlePNCP = location || 'transmitido — nº de controle não retornado pelo PNCP'
    return { ok: true, numeroControlePNCP }
  } catch {
    return { ok: false, erro: 'Não foi possível conectar ao PNCP (rede/proxy indisponível).' }
  }
}
