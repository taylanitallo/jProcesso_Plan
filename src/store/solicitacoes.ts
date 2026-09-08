import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StatusSolicitacao = 'PENDENTE' | 'RESPONDIDA'

export type Solicitacao = {
  id: string
  processoId: string
  processoNumero: string
  processoNome: string
  setor: string
  descricao: string
  status: StatusSolicitacao
  resposta: string
  criadoEm: string
  respondidoEm: string
}

/** Base comum de um lote — tudo menos o que varia por setor. */
export type BaseSolicitacao = {
  processoId: string
  processoNumero: string
  processoNome: string
  descricao: string
}

type State = {
  solicitacoes: Solicitacao[]
  criarLote: (base: BaseSolicitacao, setores: string[]) => void
  responder: (id: string, resposta: string) => void
  remover: (id: string) => void
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

export const useSolicitacoes = create<State>()(
  persist(
    (set) => ({
      solicitacoes: [],
      criarLote: (base, setores) =>
        set((s) => {
          const carimbo = agora()
          const novas: Solicitacao[] = setores.map((setor) => ({
            id: `sol${uid()}`,
            processoId: base.processoId,
            processoNumero: base.processoNumero,
            processoNome: base.processoNome,
            setor,
            descricao: base.descricao.trim(),
            status: 'PENDENTE',
            resposta: '',
            criadoEm: carimbo,
            respondidoEm: '',
          }))
          return { solicitacoes: [...s.solicitacoes, ...novas] }
        }),
      responder: (id, resposta) =>
        set((s) => ({
          solicitacoes: s.solicitacoes.map((x) =>
            x.id === id
              ? { ...x, status: 'RESPONDIDA' as const, resposta: resposta.trim(), respondidoEm: agora() }
              : x,
          ),
        })),
      remover: (id) =>
        set((s) => ({ solicitacoes: s.solicitacoes.filter((x) => x.id !== id) })),
    }),
    { name: 'sollai-solicitacoes', version: 1 },
  ),
)

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  PENDENTE: 'Pendente',
  RESPONDIDA: 'Respondida',
}
export const statusSolicitacaoLabel = (s: StatusSolicitacao) => STATUS_LABEL[s]
