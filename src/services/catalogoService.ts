import type { CatalogoItemRef, MaterialOuServico } from './types'

/**
 * Catálogo CATMAT/CATSER — implementação MOCK.
 * Trocar o corpo dos métodos por `fetch` em
 * https://dadosabertos.compras.gov.br/modulo-material/* e /modulo-servico/*
 * mantendo a mesma assinatura. Endpoints:
 *  - material: 1_consultarGrupoMaterial, 2_consultarClasseMaterial,
 *    3_consultarPdmMaterial, 4_consultarItemMaterial,
 *    6_consultarMaterialUnidadeFornecimento
 *  - serviço: 1..5 seção/divisão/grupo/classe/subclasse, 6_consultarItemServico,
 *    7_consultarUndMedidaServico
 */

const BASE: CatalogoItemRef[] = [
  {
    codigoItemCatalogo: 'BR0279233',
    descricaoItem: 'Papel A4 75g branco - resma 500 folhas',
    materialOuServico: 'MATERIAL',
    grupo: '75 - Instrumentos de escritório',
    classe: '7510 - Material de escritório',
    pdm: 'Papel',
    unidadeFornecimento: 'Resma (RES)',
    informacaoComplementar: 'Papel sulfite branco, alcalino, formato A4 (210x297mm), 75g/m².',
  },
  {
    codigoItemCatalogo: 'BR0341882',
    descricaoItem: 'Cadeira giratória ergonômica com braços',
    materialOuServico: 'MATERIAL',
    grupo: '71 - Móveis',
    classe: '7110 - Móveis de escritório',
    pdm: 'Cadeira',
    unidadeFornecimento: 'Unidade (Un)',
    informacaoComplementar: 'Encosto em tela, regulagem de altura a gás e apoio lombar.',
  },
  {
    codigoItemCatalogo: 'BR0450127',
    descricaoItem: 'Notebook 15.6" Core i5, 16GB RAM, SSD 512GB',
    materialOuServico: 'MATERIAL',
    grupo: '70 - Equipamentos de informática',
    classe: '7010 - Sistemas de computação',
    pdm: 'Notebook',
    unidadeFornecimento: 'Unidade (Un)',
    informacaoComplementar: 'Intel Core i5 12ª geração, 16GB RAM, SSD NVMe 512GB, tela Full HD.',
  },
  {
    codigoItemCatalogo: 'BR0388541',
    descricaoItem: 'Cabo de rede CAT6 U/UTP - metro',
    materialOuServico: 'MATERIAL',
    grupo: '60 - Fios, cabos e conectores',
    classe: '6145 - Fios e cabos elétricos',
    pdm: 'Cabo de rede',
    unidadeFornecimento: 'Metro (m)',
    informacaoComplementar: 'Par trançado CAT6, U/UTP, 4 pares, cobre 23AWG.',
  },
  {
    codigoItemCatalogo: 'BS0018842',
    descricaoItem: 'Serviço de manutenção preventiva de ar-condicionado split',
    materialOuServico: 'SERVICO',
    secao: 'F - Construção',
    divisao: '43 - Serviços especializados de construção',
    grupo: '439 - Outros serviços especializados',
    classe: '4390 - Serviços de manutenção predial',
    subclasse: '4390-1 - Manutenção de climatização',
    unidadeFornecimento: 'Serviço (SV)',
    informacaoComplementar: 'Limpeza, higienização e recarga de gás.',
  },
  {
    codigoItemCatalogo: 'BS0027713',
    descricaoItem: 'Consultoria técnica especializada em obras públicas',
    materialOuServico: 'SERVICO',
    secao: 'M - Atividades profissionais',
    divisao: '71 - Serviços de arquitetura e engenharia',
    grupo: '711 - Serviços de engenharia',
    classe: '7112 - Consultoria em engenharia',
    subclasse: '7112-1 - Consultoria técnica especializada',
    unidadeFornecimento: 'Hora (h)',
    informacaoComplementar: 'Elaboração e revisão de projetos, orçamentos e cronogramas.',
  },
  {
    codigoItemCatalogo: 'BS0009120',
    descricaoItem: 'Serviço continuado de limpeza e conservação predial',
    materialOuServico: 'SERVICO',
    secao: 'N - Atividades administrativas',
    divisao: '81 - Serviços para edifícios',
    grupo: '812 - Atividades de limpeza',
    classe: '8121 - Limpeza em prédios',
    subclasse: '8121-4 - Limpeza e conservação predial',
    unidadeFornecimento: 'Posto de Trabalho (PT)',
    informacaoComplementar: 'Mão de obra e insumos inclusos.',
  },
]

const espera = () => new Promise((r) => setTimeout(r, 120))
const distintos = (vals: (string | undefined)[]) => [...new Set(vals.filter(Boolean) as string[])]
const doTipo = (m: MaterialOuServico) => BASE.filter((b) => b.materialOuServico === m)

export interface FiltroCatalogo {
  materialOuServico: MaterialOuServico
  grupo?: string
  classe?: string
  pdm?: string
  subclasse?: string
  texto?: string
}

export const catalogoService = {
  async consultarGrupos(m: MaterialOuServico): Promise<string[]> {
    await espera()
    return distintos(doTipo(m).map((b) => b.grupo))
  },
  async consultarClasses(m: MaterialOuServico, grupo?: string): Promise<string[]> {
    await espera()
    return distintos(doTipo(m).filter((b) => !grupo || b.grupo === grupo).map((b) => b.classe))
  },
  async consultarPdms(grupo?: string, classe?: string): Promise<string[]> {
    await espera()
    return distintos(
      doTipo('MATERIAL')
        .filter((b) => (!grupo || b.grupo === grupo) && (!classe || b.classe === classe))
        .map((b) => b.pdm),
    )
  },
  async consultarSubclasses(classe?: string): Promise<string[]> {
    await espera()
    return distintos(doTipo('SERVICO').filter((b) => !classe || b.classe === classe).map((b) => b.subclasse))
  },
  async consultarItens(f: FiltroCatalogo): Promise<CatalogoItemRef[]> {
    await espera()
    const q = (f.texto ?? '').trim().toLowerCase()
    return doTipo(f.materialOuServico).filter((b) => {
      if (f.grupo && b.grupo !== f.grupo) return false
      if (f.classe && b.classe !== f.classe) return false
      if (f.pdm && b.pdm !== f.pdm) return false
      if (f.subclasse && b.subclasse !== f.subclasse) return false
      if (q && !b.descricaoItem.toLowerCase().includes(q) && !b.codigoItemCatalogo.toLowerCase().includes(q))
        return false
      return true
    })
  },
  /** Base inteira (CatMat + CatSer). */
  async consultarBaseInteira(): Promise<CatalogoItemRef[]> {
    await espera()
    return [...BASE]
  },
}
