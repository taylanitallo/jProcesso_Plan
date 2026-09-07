import type { ReactNode } from 'react'
import type { ModuleLink } from '../../store/ui'
import { ARTEFATO_GRUPOS, ARTEFATO_LEGISLACOES, RESEARCH_FUNCOES } from '../../mocks'

export type Step =
  | { kind: 'choice'; prompt: ReactNode; options: string[] }
  | { kind: 'group'; prompt: ReactNode; groups: { grupo: string; itens: string[] }[] }
  | { kind: 'text'; prompt: ReactNode; placeholder?: string; optional?: boolean }
  | {
      kind: 'upload'
      prompt: ReactNode
      optional?: boolean
      warning?: { title: string; bullets: string[]; note?: ReactNode }
    }

export const CHAT_MODULE_LINKS: ModuleLink[] = [
  { key: 'consulta', label: 'Consulta Inteligente', to: '/Consulta', icon: 'scale' },
  { key: 'artefato', label: 'Artefato', to: '/Artefato', icon: 'book' },
  { key: 'research', label: 'Research', to: '/Research', icon: 'search' },
]

export const ARTEFATO_STEPS: Step[] = [
  {
    kind: 'choice',
    prompt: 'Escolha a legislação: (Baseado em qual lei deseja a resposta).',
    options: ARTEFATO_LEGISLACOES,
  },
  {
    kind: 'group',
    prompt: 'Escolha seus Artefatos: Selecione artefatos específicos que deseja produzir.',
    groups: ARTEFATO_GRUPOS,
  },
  {
    kind: 'upload',
    optional: true,
    prompt:
      'Gostaria de me ajudar a produzir o esboço? Envie aqui as informações que você já possui sobre a contratação (Exemplo: descrição do objeto ou serviço que deseja licitar; um processo anterior já realizado; pesquisa de preços; etc).',
    warning: {
      title: 'Aviso sobre envio de documentos',
      bullets: [
        'Digitalizados (em formato de imagem/PDF escaneado)',
        'Bloqueados para cópia ou edição',
        'Com imagens muito grandes que possam comprometer o processamento',
      ],
      note: 'Dê preferência a arquivos em formato .docx, .pdf editável.',
    },
  },
]

export const RESEARCH_STEPS: Step[] = [
  {
    kind: 'choice',
    prompt: 'O que deseja fazer hoje? Selecione uma função na qual eu possa atuar para você.',
    options: RESEARCH_FUNCOES,
  },
  {
    kind: 'upload',
    prompt: 'Qual documento você deseja que eu trabalhe para você hoje?',
    warning: {
      title: 'Aviso sobre envio de documentos',
      bullets: [
        'Digitalizados (em formato de imagem/PDF escaneado)',
        'Bloqueados para cópia ou edição',
        'Com imagens muito grandes que possam comprometer o processamento',
      ],
      note: 'Dê preferência a arquivos em formato .docx, .pdf editável.',
    },
  },
]
