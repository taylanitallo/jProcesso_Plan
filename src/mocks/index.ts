import type { HistoryItem } from '../types'

/** Real question history captured from the SollAI Consulta panel. */
export const CONSULTA_HISTORY: HistoryItem[] = [
  {
    id: 'c1',
    title:
      'ESTOU COM UM PROJETO QUE É PARA PREMIAR O MELHOR MAESTRO DE 7 DE SETEMBRO, TEM NO PROJETO PREMIAÇÃO EM DINHEIRO. QUERO SABER SE BASTA SER NO PROJETO OU TEM QUE TER DECRETO OU LEI ?',
    preview: '',
    date: '01/09/2026',
  },
  {
    id: 'c2',
    title:
      'estou com problema de fiscal de contrato, o servidor está atestando nota fiscal, porém não tinha portaria de designação, como deve ser feito ?',
    preview: '',
    date: '28/08/2026',
  },
  {
    id: 'c3',
    title: 'quais documentos precisam na medição de limpeza pública, me dê checklist',
    preview: '',
    date: '27/08/2026',
  },
  {
    id: 'c4',
    title:
      'tenho um contrato de aquisição de troféus e medalhas ... como devo proceder para que não dê fracionamento de despesas ?',
    preview: '',
    date: '26/08/2026',
  },
  {
    id: 'c5',
    title:
      'OI, ESTOU COM PROCESSO PARA AQUISIÇÃO DE ITENS ESPECÍFICOS PARA EQUIPAR UMA SALA DE MULTIMÍDIAS DA SECRETARIA DE EDUCAÇÃO ...',
    preview: '',
    date: '20/08/2026',
  },
  {
    id: 'c6',
    title:
      'QUERO QUE VC ME DIGA QUAIS DOUTRINAS VC UTILIZA, EXEMPLO "EU (IA) PROCURO AS INFORMAÇÕES NA LEI 14133/2021, IN 65/2011"',
    preview: '',
    date: '18/08/2026',
  },
  {
    id: 'c7',
    title: 'quais os tipos de relatórios devo enviar ao TCE-CE de acordo com a normativa 01/2025',
    preview: '',
    date: '15/08/2026',
  },
]

export const ARTEFATO_HISTORY: HistoryItem[] = [
  { id: 'a2', title: '2 - Checklist de Gestão e Fiscalização de Contratos', preview: '', date: '02/09/2026' },
  { id: 'a1', title: '1 - Termo de Referência - Serviços', preview: '', date: '29/08/2026' },
]

export const RESEARCH_HISTORY: HistoryItem[] = [
  { id: 'r1', title: '1 - Resumo de documentos', preview: '', date: '30/08/2026' },
]

export const ARTEFATO_LEGISLACOES = [
  '14.133 - DE 1º DE ABRIL DE 2021 - Lei de Licitações e Contratos Administrativos.',
  '13.303 - DE 30 DE JUNHO DE 2016 - Dispõe sobre o estatuto jurídico da empresa pública, da sociedade de economia mista e de suas subsidiárias.',
  'Sistema S',
]

export const RESEARCH_FUNCOES = [
  'Análise Comparativa e Crítica',
  'Analisador de Impugnações de Edital',
  'Analisador de Pedidos de Esclarecimento',
  'Analisador de Recursos',
  'Analisador de Despacho Jurídico',
  'Analisador de Certidões em Processos Licitatórios',
  'Analisador de Contrarrazões',
]

/** 23 signer categories (page 1 captured; remainder are representative). */
export const CATEGORIAS_ASSINANTES = [
  'Agente de Contratação',
  'Agente de Planejamento da Contratação',
  'Assessor Jurídico',
  'Autoridade Superior',
  'Comissão de Ética ou Integridade',
  'Corregedoria',
  'Equipe de Apoio',
  'Fiscal de Contrato',
  'Fiscal Técnico',
  'Fiscal Administrativo',
  'Gestor de Contrato',
  'Ordenador de Despesa',
  'Pregoeiro',
  'Procurador Jurídico',
  'Requisitante da Contratação',
  'Responsável pela Cotação',
  'Responsável Técnico',
  'Secretário Municipal',
  'Setor de Compras',
  'Setor de Contabilidade',
  'Setor de Licitações',
  'Controle Interno',
  'Autoridade Assessorada',
]

export const PROCESSOS = [
  {
    id: 1,
    numero: '1',
    tipo: 'Pregão - Bens e Serviços',
    nome: 'PERMANENTE',
    proprietario: 'AL',
    integrantes: '',
    inclusao: '16/12/2025',
    status: 'Ativo',
  },
]

export const NORMATIVAS = [
  { id: 'n1', nome: 'DECRETO_120_2023_0000001.pdf', status: 'PROCESSADO' },
  { id: 'n2', nome: 'INSTRUÇÃO NORMATIVA TCE-CE Nº 01.2025.pdf', status: 'PROCESSADO' },
]

export const ACADEMY_RAILS: { title: string; courses: { title: string; desc: string }[] }[] = [
  {
    title: 'A fase preparatória',
    courses: [
      {
        title: 'A Fase preparatória',
        desc: 'Este tema busca promover a compreensão da fase preparatória das contratações públicas, abordando os procedimentos e decisões que antecedem a licitação ou a contratação direta.',
      },
      {
        title: 'Compreendendo os artefatos de planejamento (DFD, ETP e TR)',
        desc: 'Este tema busca promover a compreensão dos artefatos de planejamento previstos na Lei nº 14.133/2021 — o DFD, o ETP e o TR.',
      },
    ],
  },
  {
    title: 'Contratos',
    courses: [
      {
        title: 'Regime contratual na Lei 14133/2021',
        desc: 'Este tema explora os regimes de execução contratual previstos na Lei nº 14.133/2021, analisando suas hipóteses de aplicação.',
      },
    ],
  },
  {
    title: 'Lei 13.303/16 – Estatais',
    courses: [
      {
        title: 'Estatais em pauta',
        desc: 'Série de vídeos para apoiar gestores, assessores, áreas técnicas e jurídicas das empresas estatais.',
      },
    ],
  },
  {
    title: 'Lei de Licitações e contratos – 14.133/2021',
    courses: [
      {
        title: 'Aplicação dos benefícios para MEEPP LC 123/2006 e art. 4º da Lei 14.133/21',
        desc: 'Este tema aborda a aplicação dos benefícios previstos na LC nº 123/2006, cotejados com o art. 4º da NLL.',
      },
      {
        title: 'Capacitação e Formação de Pregoeiro, Agente de Contratação e Equipe de Apoio de acordo com a NLL',
        desc: 'O tema trata da capacitação e formação obrigatória do pregoeiro, agente de contratação e equipe de apoio.',
      },
      {
        title: 'Entendendo o Sistema de Dispensa Eletrônica IN 67/2021',
        desc: 'O tema explora o funcionamento do Sistema de Dispensa Eletrônica, regulamentado pela IN 67/2021.',
      },
      {
        title: 'Impugnação, pedido de esclarecimento e fase recursal na NLL',
        desc: 'Este tema aborda os mecanismos de controle e defesas presentes nas licitações: impugnação ao edital, pedidos de esclarecimento e fase recursal.',
      },
      {
        title: 'Mentoria Técnica: Entendendo os Fundamentos da Nova Lei',
        desc: 'Seleção de mentorias exclusivas do Sollicita PRO.',
      },
    ],
  },
  {
    title: 'Obras e serviços de engenharia',
    courses: [
      {
        title: 'Obras e serviços de engenharia',
        desc: 'Série de vídeos com o objetivo de capacitar gestores, fiscais, áreas técnicas, jurídicas e demais envolvidos.',
      },
    ],
  },
  {
    title: 'Patrimônio Público',
    courses: [
      {
        title: 'Patrimônio Público',
        desc: 'Este tema busca promover a compreensão da gestão do patrimônio público no âmbito das contratações.',
      },
    ],
  },
  {
    title: 'SollAI Explica',
    courses: [
      {
        title: 'Trilha Avançada: Inteligência Artificial nas Licitações e contratos',
        desc: 'Esta trilha avançada explora o uso da Inteligência Artificial nas licitações públicas.',
      },
    ],
  },
  {
    title: 'TCU, CGU e Controle Interno',
    courses: [
      {
        title: 'Controle Interno (em suas diversas acepções) nas Contratações Públicas',
        desc: 'O tema trata do papel e das diferentes acepções do Controle Interno nas contratações públicas.',
      },
    ],
  },
]

export const RELATORIO_CONSULTAS = [
  {
    legislacao: '14.133',
    formato: 'Parecer Técnico',
    pergunta:
      'ESTOU COM UM PROJETO QUE É PARA PREMIAR O MELHOR MAESTRO DE 7 DE SETEMBRO, TEM NO PROJETO PREMIAÇÃO EM DINHEIRO. QUERO SABER SE BASTA SER NO PROJETO OU TEM QUE TER DECRETO OU LEI ?',
    usuario: 'ALEF MATHEUS TEIXEIRA DE SOUSA',
    data: '01/09/2026 às 01:33',
  },
]
