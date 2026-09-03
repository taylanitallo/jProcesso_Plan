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

/** 27 artefatos típicos do fluxo da Lei 14.133/2021. */
export const ARTEFATO_TIPOS = [
  'Documento de Formalização da Demanda (DFD)',
  'Estudo Técnico Preliminar (ETP)',
  'Mapa de Riscos',
  'Termo de Referência (TR)',
  'Projeto Básico',
  'Projeto Executivo',
  'Pesquisa de Preços',
  'Mapa Comparativo de Preços',
  'Justificativa de Preço',
  'Anteprojeto',
  'Matriz de Riscos Contratual',
  'Edital de Licitação',
  'Minuta de Contrato',
  'Minuta de Ata de Registro de Preços',
  'Parecer Jurídico',
  'Parecer Técnico',
  'Despacho de Autorização',
  'Autorização da Autoridade Competente',
  'Portaria de Designação de Fiscal',
  'Nota Técnica',
  'Relatório de Fiscalização',
  'Termo de Recebimento Provisório',
  'Termo de Recebimento Definitivo',
  'Ordem de Serviço / Fornecimento',
  'Ata de Reunião',
  'Checklist de Instrução Processual',
  'Relatório Final da Contratação',
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

export interface ConsultaAnswer {
  questionId: string
  data: string
  formato: string
  legislacao: string
  referencias: string[]
  doutrina: string[]
  body: string
}

export const CONSULTA_ANSWERS: ConsultaAnswer[] = [
  {
    questionId: 'c1',
    data: '01/09/2026 às 01:33',
    formato: 'Parecer técnico',
    legislacao: '14.133',
    referencias: [
      'INSTRUÇÃO NORMATIVA SEGES MGI Nº 12, DE 31 DE MARÇO DE 2023 — dispõe sobre licitação pelo critério de julgamento por melhor técnica ou conteúdo artístico.',
      'Lei nº 14.133/2021 — Nova Lei de Licitações e Contratos Administrativos, especialmente os dispositivos sobre critérios de seleção, concurso e premiação.',
      'Lei nº 13.204, de 14 de dezembro de 2015 — dispõe sobre parcerias com organizações da sociedade civil, incluindo premiação em projetos.',
      'Acórdãos do Tribunal de Contas da União (ex.: 1370/2024 Plenário, 5131/2024 1ª Câmara, 1334/2024 Plenário).',
      'Decreto nº 12.955, de 29 de abril de 2026 — redução de alíquotas para produções artísticas e culturais nacionais.',
      'Plano Diretor de Logística Sustentável — importância do uso do poder de compra do Estado para fomento à cultura.',
    ],
    doutrina: [
      'Licitações e Contratos Administrativos na Lei 14.133/21.pdf',
      'Governança das Contratações.pdf',
      'Caderno de Pesquisa de Preços - MGI.pdf',
      'Instrumento de Padronização - AGU.pdf',
      'Instrumento de Padronização de TI - AGU.pdf',
      'Perguntas Frequentes em Contratações - AGU.pdf',
      'Referencial básico gestão riscos.pdf',
    ],
    body: `Desenvolvimento:

A. Pressupostos fáticos
O caso em análise refere-se à intenção de premiar, com valor em dinheiro, o melhor maestro participante das comemorações de 7 de setembro, no âmbito de um projeto cultural ou comemorativo. A dúvida central reside em saber se a previsão da premiação em dinheiro no próprio projeto é suficiente para legitimar o pagamento, ou se seria imprescindível a existência de ato normativo específico, como decreto ou lei, que autorize tal premiação.

B. Subsídios normativos (priorizando normas locais)
Não localizada norma local (lei ou decreto municipal) que discipline especificamente a concessão de prêmios em dinheiro em projetos culturais. No plano federal, a IN SEGES MGI nº 12/2023 e a Lei nº 14.133/2021 (arts. 6º e 30) admitem o concurso como modalidade para escolha de trabalho técnico, científico ou artístico, mediante prêmio, exigindo previsão em edital e observância dos princípios da Administração.

C. Interpretação sistemática
A análise sistemática indica que a premiação pode ser viabilizada por meio de procedimento administrativo regular, com previsão expressa no edital ou no regulamento do certame, desde que haja dotação orçamentária e observância dos princípios da legalidade, impessoalidade, moralidade, publicidade e eficiência.

D. Argumentos favoráveis
A ausência de exigência expressa de lei ou decreto específico para cada premiação sugere que o procedimento administrativo, com previsão em edital, é suficiente. A Lei nº 13.204/2015 e o Decreto nº 12.955/2026 reforçam a tese de que a previsão em regulamento/edital é bastante.

E. Argumentos contrários
Em respeito ao princípio da legalidade estrita e à criação de despesas, pode-se sustentar que a premiação em dinheiro deveria estar prevista em lei formal, especialmente por envolver recursos públicos e criação de obrigação pecuniária.

F. Riscos e recomendações mitigadoras
A adoção da solução baseada apenas na previsão em projeto ou edital, sem respaldo em lei ou decreto específico, pode ensejar questionamentos dos órgãos de controle interno e externo. Recomenda-se: (i) previsão orçamentária específica; (ii) previsão em edital/regulamento; (iii) motivação robusta; e (iv) consulta prévia à Procuradoria Jurídica.

Conclusão:
Conclui-se que a premiação em dinheiro pode ser legitimada por procedimento administrativo regular, com previsão no projeto/edital, dotação orçamentária e motivação adequada. A edição de norma local específica não é imprescindível, mas é recomendável como medida de cautela para mitigar riscos de questionamento.

Nota: Essa é uma resposta gerada por uma inteligência artificial e deve ser utilizada como orientação e auxílio para elaborar seu parecer final.`,
  },
]

export function courseSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function findCourse(slug: string) {
  for (const rail of ACADEMY_RAILS) {
    const c = rail.courses.find((x) => courseSlug(x.title) === slug)
    if (c) return { ...c, rail: rail.title }
  }
  return null
}

export const TRILHA_MODULOS = [
  { titulo: 'Introdução e objetivos da trilha', aulas: 3, duracao: '18 min' },
  { titulo: 'Fundamentos legais', aulas: 5, duracao: '42 min' },
  { titulo: 'Aplicação prática e estudos de caso', aulas: 6, duracao: '1 h 05 min' },
  { titulo: 'Erros comuns e como evitá-los', aulas: 4, duracao: '31 min' },
  { titulo: 'Encerramento e avaliação', aulas: 2, duracao: '12 min' },
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
