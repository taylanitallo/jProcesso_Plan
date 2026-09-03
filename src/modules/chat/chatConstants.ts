import type { ReactNode } from 'react'
import type { ModuleLink } from '../../store/ui'
import { ARTEFATO_LEGISLACOES, ARTEFATO_TIPOS, RESEARCH_FUNCOES } from '../../mocks'

export type Step =
  | { kind: 'choice'; prompt: ReactNode; options: string[] }
  | { kind: 'text'; prompt: ReactNode; placeholder?: string; optional?: boolean }
  | { kind: 'upload'; prompt: ReactNode }

export const CHAT_MODULE_LINKS: ModuleLink[] = [
  { key: 'consulta', label: 'Consulta Inteligente', to: '/Consulta', icon: 'scale' },
  { key: 'artefato', label: 'Artefato', to: '/Artefato', icon: 'book' },
  { key: 'research', label: 'Research', to: '/Research', icon: 'search' },
  { key: 'base', label: 'Base de conhecimento', to: '/Normativa', icon: 'database' },
]

export const ARTEFATO_STEPS: Step[] = [
  {
    kind: 'choice',
    prompt: 'Escolha a legislação: (Baseado em qual lei deseja a resposta).',
    options: ARTEFATO_LEGISLACOES,
  },
  { kind: 'choice', prompt: 'Qual artefato você deseja gerar?', options: ARTEFATO_TIPOS },
  {
    kind: 'text',
    prompt:
      'Descreva o contexto do processo — objeto, valores, unidade requisitante e demais informações relevantes.',
    placeholder: 'Cole aqui os dados do processo...',
  },
]

export const RESEARCH_STEPS: Step[] = [
  {
    kind: 'choice',
    prompt: 'O que deseja fazer hoje? Selecione uma função na qual eu possa atuar para você.',
    options: RESEARCH_FUNCOES,
  },
  { kind: 'upload', prompt: 'Envie o documento que deseja analisar.' },
  {
    kind: 'text',
    optional: true,
    prompt: 'Contexto adicional (opcional) — informe pontos de atenção para a análise.',
    placeholder: 'Ex.: verificar prazos, fundamentação e vícios formais...',
  },
]
