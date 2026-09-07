import type { PrecoPraticado } from './types'

/**
 * Pesquisa de preços (preços praticados) — implementação MOCK.
 * Real: dadosabertos.compras.gov.br /modulo-pesquisa-preco/1_consultarMaterial
 *   e /3_consultarServico, por codigoItemCatalogo + intervalo de datas.
 * Ainda não consumido na UI — base para o futuro módulo de Pesquisa de Preços.
 */

export interface PeriodoConsulta {
  /** dd/mm/aaaa ou aaaa-mm-dd. */
  inicio: string
  fim: string
}

const FORNECEDORES = [
  ['COMERCIAL NORDESTE LTDA', '12.345.678/0001-90'],
  ['SUPRIMENTOS BRASIL EIRELI', '98.765.432/0001-10'],
  ['DISTRIBUIDORA CENTRO-SUL S.A.', '45.678.912/0001-33'],
  ['MEGA MATERIAIS E SERVIÇOS', '23.456.789/0001-55'],
]

const espera = () => new Promise((r) => setTimeout(r, 150))

export const precosService = {
  async pesquisarPrecos(
    codigoItemCatalogo: string,
    _periodo: PeriodoConsulta,
  ): Promise<PrecoPraticado[]> {
    await espera()
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
  },
}
