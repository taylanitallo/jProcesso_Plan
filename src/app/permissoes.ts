import type { Perfil } from '../types'
import { useAuth } from '../store/auth'

export type Capability =
  | 'transmitirPncp'
  | 'gerenciarUsuarios'
  | 'gerenciarUnidadeSetor'
  | 'gerenciarEnvolvidos'
  | 'relatorioUso'

const MATRIZ: Record<Perfil, Capability[]> = {
  ADMIN_GERAL: [
    'transmitirPncp',
    'gerenciarUsuarios',
    'gerenciarUnidadeSetor',
    'gerenciarEnvolvidos',
    'relatorioUso',
  ],
  GESTOR_UNIDADE: ['gerenciarUnidadeSetor', 'gerenciarEnvolvidos', 'relatorioUso'],
  USUARIO: [],
}

export const LABEL_CAPABILITY: Record<Capability, string> = {
  transmitirPncp: 'transmitir PCAs ao PNCP',
  gerenciarUsuarios: 'gerenciar usuários',
  gerenciarUnidadeSetor: 'gerenciar unidades e setores',
  gerenciarEnvolvidos: 'gerenciar envolvidos em assinaturas',
  relatorioUso: 'ver o relatório de uso',
}

/** `perfil` pode executar `cap`? Perfil ausente (deslogado) = não. */
export function pode(perfil: Perfil | undefined, cap: Capability): boolean {
  if (!perfil) return false
  return MATRIZ[perfil].includes(cap)
}

/** Hook: o usuário logado pode `cap`? */
export function usePode(cap: Capability): boolean {
  return useAuth((s) => pode(s.user?.perfil, cap))
}
