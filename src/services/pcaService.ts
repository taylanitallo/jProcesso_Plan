import type { MaterialOuServico, PcaCabecalho, PcaItem } from './types'

/**
 * Plano de Contratação Anual (PGC/PCA) — implementação MOCK.
 * Leitura real: dadosabertos.compras.gov.br /modulo-pgc/1_consultarPgcDetalhe
 *   ?orgao=<cnpj>&anoPcaProjetoCompra=<ano>&codigoUasg=<uasg>
 * Escrita real: PNCP POST /v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens
 * Manter as assinaturas ao trocar o corpo por `fetch`.
 */

const CATALOGO: [string, MaterialOuServico, string, string][] = [
  ['ADAPTADOR COM FLANGE 1 - 32MM.', 'MATERIAL', 'ACESSÓRIOS E FERRAGENS PARA MANGUEIRAS, CANOS E TUBOS', 'UNIDADE'],
  ['ADAPTADOR COM FLANGE 25MM (3/4)', 'MATERIAL', 'EQUIPAMENTOS DE APOIO', 'UNIDADE'],
  ['ADAPTADOR ELÉTRICO TÊ', 'MATERIAL', 'CONECTORES ELÉTRICOS', 'UNIDADE'],
  ['CIMENTO PORTLAND CP-II 50KG', 'MATERIAL', 'MATERIAIS DE CONSTRUÇÃO', 'SACO'],
  ['AREIA MÉDIA LAVADA', 'MATERIAL', 'AGREGADOS PARA CONSTRUÇÃO', 'M3'],
  ['TINTA LÁTEX ACRÍLICA 18L', 'MATERIAL', 'TINTAS E VERNIZES', 'LATA'],
  ['CAMINHÃO LEVE TIPO 3/4', 'MATERIAL', 'VEÍCULOS SOBRE RODAS', 'UNIDADE'],
  ['NOTEBOOK CORE I5 16GB SSD 512GB', 'MATERIAL', 'EQUIPAMENTOS DE INFORMÁTICA', 'UNIDADE'],
  ['APRESENTAÇÃO MUSICAL - REY VAQUEIRO', 'SERVICO', 'SERVIÇOS DE ARTISTAS', 'SERVIÇO'],
  ['SERVIÇO DE MANUTENÇÃO DE AR-CONDICIONADO', 'SERVICO', 'MANUTENÇÃO PREDIAL', 'SERVIÇO'],
  ['LOCAÇÃO DE PALCO E SONORIZAÇÃO', 'SERVICO', 'LOCAÇÃO DE EQUIPAMENTOS PARA EVENTOS', 'DIÁRIA'],
  ['CONSULTORIA TÉCNICA EM ENGENHARIA', 'SERVICO', 'CONSULTORIA EM ENGENHARIA', 'HORA'],
  ['SERVIÇO CONTINUADO DE LIMPEZA PREDIAL', 'SERVICO', 'LIMPEZA E CONSERVAÇÃO', 'POSTO'],
  ['COMBUSTÍVEL - ÓLEO DIESEL S10', 'MATERIAL', 'COMBUSTÍVEIS E LUBRIFICANTES', 'LITRO'],
  ['PNEU 275/80 R22.5', 'MATERIAL', 'PNEUS E CÂMARAS DE AR', 'UNIDADE'],
]

const espera = () => new Promise((r) => setTimeout(r, 150))

function gerarItens(sequencial: number): PcaItem[] {
  return Array.from({ length: 24 }, (_, i) => {
    const [descricao, mos, classificacao, unid] = CATALOGO[(sequencial + i) % CATALOGO.length]
    const quantidadeEstimada = 1 + ((sequencial * 7 + i * 3) % 40)
    const valorUnitarioEstimado = Number(
      (2 + ((sequencial * 13 + i * 29) % 900) + ((i * 7) % 100) / 100).toFixed(2),
    )
    return {
      numeroItem: 9427 + sequencial * 100 + i,
      materialOuServico: mos,
      categoria: mos === 'MATERIAL' ? 'Material' : 'Serviço',
      classificacao,
      descricao,
      unidadeFornecimento: unid,
      quantidadeEstimada,
      valorUnitarioEstimado,
      valorTotalEstimado: Number((quantidadeEstimada * valorUnitarioEstimado).toFixed(2)),
      codigoItemCatalogo: `BR${100000 + sequencial * 500 + i}`,
    }
  })
}

export const pcaService = {
  /** Lista os PCAs (sequenciais) de um órgão no ano. */
  async consultarPca(cnpjOrgao: string, anoPca: number): Promise<PcaCabecalho[]> {
    await espera()
    return Array.from({ length: 13 }, (_, k) => {
      const sequencial = k + 1
      const itens = gerarItens(sequencial)
      return {
        cnpjOrgao,
        nomeOrgao: 'MUNICÍPIO DE IRAUÇUBA',
        anoPca,
        sequencial,
        numeroControlePNCP: `${cnpjOrgao.replace(/\D/g, '')}-0-${String(sequencial).padStart(6, '0')}/${anoPca}`,
        codigoUnidade: '2501',
        nomeUnidade: 'SECRETARIA DO DESENVOLVIMENTO RURAL, MEIO AMBIENTE E RECURSOS HÍDRICOS',
        localizacao: 'Irauçuba - CE',
        dataPublicacao: '12/08/2025',
        totalItens: itens.length,
        valorTotalEstimado: Number(itens.reduce((s, it) => s + it.valorTotalEstimado, 0).toFixed(2)),
      }
    })
  },

  /** Itens de um PCA específico. */
  async consultarItensPca(
    _cnpjOrgao: string,
    _anoPca: number,
    sequencial: number,
  ): Promise<PcaItem[]> {
    await espera()
    return gerarItens(sequencial)
  },
}
