import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PROCESSOS, PROCESSO_ARTEFATOS } from '../mocks'

export type StatusProcesso = 'ATIVO' | 'FINALIZADO'
export type OrigemProcesso = 'MANUAL' | 'REGISTROS' | 'SOLICITACAO'

/** Snapshot editável de um artefato dentro de um processo — cópia de
 *  PROCESSO_ARTEFATOS no momento da criação + campos de designação. */
export type ProcessoArtefato = {
  nome: string
  completo: string
  enviado: boolean
  revisao: boolean
  responsavel: string // '' = não designado
  prazo: string // '' = sem prazo
}

export type ProcessoLocal = {
  id: string
  numero: string
  nome: string
  tipo: string
  legislacao: string
  fluxo: string
  loteUnico: 'Sim' | 'Não'
  descricao: string
  status: StatusProcesso
  origem: OrigemProcesso
  proprietario: string
  integrantes: string
  registroIds: string[]
  itensResumo: number
  artefatos: ProcessoArtefato[]
  inclusao: string
  criadoEm: string
  atualizadoEm: string
}

export type NovoProcesso = {
  numero: string
  nome: string
  tipo: string
  legislacao?: string
  fluxo?: string
  loteUnico?: 'Sim' | 'Não'
  descricao?: string
  origem?: OrigemProcesso
  registroIds?: string[]
  itensResumo?: number
}

type State = {
  processos: ProcessoLocal[]
  criar: (p: NovoProcesso) => string
  atualizar: (
    id: string,
    patch: Partial<Omit<ProcessoLocal, 'id' | 'artefatos' | 'criadoEm'>>,
  ) => void
  remover: (id: string) => void
  finalizar: (id: string) => void
  definirStatus: (id: string, s: StatusProcesso) => void
  atualizarArtefato: (
    procId: string,
    artefatoCompleto: string,
    patch: Partial<Omit<ProcessoArtefato, 'completo'>>,
  ) => void
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const hoje = () => new Date().toLocaleDateString('pt-BR')
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

/** Snapshot de artefatos a partir do template global. `preservarEnviado` só na seed. */
const artefatosDe = (preservarEnviado = false): ProcessoArtefato[] =>
  PROCESSO_ARTEFATOS.map((a) => ({
    nome: a.nome,
    completo: a.completo,
    revisao: a.revisao,
    enviado: preservarEnviado ? a.enviado : false,
    responsavel: '',
    prazo: '',
  }))

const SEED: ProcessoLocal[] = PROCESSOS.map((p) => ({
  id: String(p.id),
  numero: p.numero,
  nome: p.nome,
  tipo: p.tipo,
  legislacao: '14.133',
  fluxo: '',
  loteUnico: 'Não' as const,
  descricao: '',
  status: 'ATIVO' as const,
  origem: 'MANUAL' as const,
  proprietario: p.proprietario,
  integrantes: p.integrantes,
  registroIds: [],
  itensResumo: 0,
  artefatos: artefatosDe(true),
  inclusao: p.inclusao,
  criadoEm: `${p.inclusao} 00:00`,
  atualizadoEm: `${p.inclusao} 00:00`,
}))

export const useProcessos = create<State>()(
  persist(
    (set) => ({
      processos: SEED,
      criar: (p) => {
        const id = `proc${uid()}`
        const carimbo = agora()
        set((s) => ({
          processos: [
            ...s.processos,
            {
              id,
              numero: p.numero.trim(),
              nome: p.nome.trim(),
              tipo: p.tipo,
              legislacao: p.legislacao ?? '14.133',
              fluxo: p.fluxo ?? '',
              loteUnico: p.loteUnico ?? 'Não',
              descricao: p.descricao?.trim() ?? '',
              status: 'ATIVO',
              origem: p.origem ?? 'MANUAL',
              proprietario: 'AL',
              integrantes: '',
              registroIds: p.registroIds ?? [],
              itensResumo: p.itensResumo ?? 0,
              artefatos: artefatosDe(false),
              inclusao: hoje(),
              criadoEm: carimbo,
              atualizadoEm: carimbo,
            },
          ],
        }))
        return id
      },
      atualizar: (id, patch) =>
        set((s) => ({
          processos: s.processos.map((p) =>
            p.id === id ? { ...p, ...patch, atualizadoEm: agora() } : p,
          ),
        })),
      remover: (id) => set((s) => ({ processos: s.processos.filter((p) => p.id !== id) })),
      finalizar: (id) =>
        set((s) => ({
          processos: s.processos.map((p) =>
            p.id === id ? { ...p, status: 'FINALIZADO' as const, atualizadoEm: agora() } : p,
          ),
        })),
      definirStatus: (id, status) =>
        set((s) => ({
          processos: s.processos.map((p) =>
            p.id === id ? { ...p, status, atualizadoEm: agora() } : p,
          ),
        })),
      atualizarArtefato: (procId, artefatoCompleto, patch) =>
        set((s) => ({
          processos: s.processos.map((p) =>
            p.id !== procId
              ? p
              : {
                  ...p,
                  atualizadoEm: agora(),
                  artefatos: p.artefatos.map((a) =>
                    a.completo === artefatoCompleto ? { ...a, ...patch } : a,
                  ),
                },
          ),
        })),
    }),
    {
      name: 'sollai-processos',
      version: 1,
      migrate: (persisted) => {
        const s = persisted as { processos?: Partial<ProcessoLocal>[] }
        return {
          processos: (s.processos ?? []).map((p) => ({
            fluxo: '',
            loteUnico: 'Não' as const,
            descricao: '',
            origem: 'MANUAL' as const,
            proprietario: 'AL',
            integrantes: '',
            registroIds: [],
            itensResumo: 0,
            artefatos: [],
            status: 'ATIVO' as const,
            ...p,
          })),
        }
      },
    },
  ),
)

const STATUS_LABEL: Record<StatusProcesso, string> = {
  ATIVO: 'Ativo',
  FINALIZADO: 'Finalizado',
}
export const statusProcessoLabel = (s: StatusProcesso) => STATUS_LABEL[s]
