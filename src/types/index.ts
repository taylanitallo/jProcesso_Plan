export interface User {
  id: string
  name: string
  email: string
  role: string
  institution: string
  initials: string
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
