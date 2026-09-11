export type Perfil = 'ADMIN_GERAL' | 'GESTOR_UNIDADE' | 'USUARIO'

export interface User {
  id: string
  name: string
  email: string
  role: string
  perfil: Perfil
  institution: string
  initials: string
  /** Unidade Orçamentária vinculada a esta sessão — '' = nenhuma (típico do Admin Geral, que enxerga todas). */
  unidadeId: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  time: string
  read: boolean
}

export interface HistoryItem {
  id: string
  title: string
  preview: string
  date: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}
