import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WORKFLOWS, WORKFLOW_NODES, WORKFLOW_NODE_DEPS } from '../mocks'

export type ContagemPrazo = 'Dias corridos' | 'Dias úteis' | ''

export type NoConfig = {
  ativo: boolean
  deps: string[]
  prazoAtivo: boolean
  duracao: number
  contagem: ContagemPrazo
  revisao: boolean
  respRevisao: string
  aprovacao: boolean
  respAprovacao: string
  assinatura: boolean
  respAssinatura: string
}

export type WorkflowNo = {
  nome: string
  icone: string
  config: NoConfig
}

export type Workflow = {
  id: string
  nome: string
  tipo: string
  legislacao: string
  ativo: boolean
  inclusao: string
  nos: WorkflowNo[]
  criadoEm: string
  atualizadoEm: string
}

export type NovoWorkflow = { nome: string; tipo: string; legislacao: string }

/** Patch aplicado a todos os nós pelo Controle Geral. */
export type ControleGeralPatch = {
  prazoAtivo: boolean
  duracao: number
  contagem: ContagemPrazo
  revisao: boolean
  aprovacao: boolean
  assinatura: boolean
}

type State = {
  workflows: Workflow[]
  criar: (n: NovoWorkflow) => string
  renomear: (id: string, nome: string) => void
  definirAtivo: (id: string, ativo: boolean) => void
  reordenarNos: (id: string, nomes: string[]) => void
  adicionarNo: (id: string, nome: string, afterIndex: number, icone: string) => void
  configurarNo: (id: string, nome: string, patch: Partial<NoConfig>) => void
  aplicarControleGeral: (id: string, patch: ControleGeralPatch) => void
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const hoje = () => new Date().toLocaleDateString('pt-BR')
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

/** Config default de um nó — nós com dependências no mock já vêm com `deps` preenchido. */
export function defaultNoConfig(nome: string): NoConfig {
  return {
    ativo: true,
    deps: WORKFLOW_NODE_DEPS[nome] ? [...WORKFLOW_NODE_DEPS[nome]] : [],
    prazoAtivo: false,
    duracao: 0,
    contagem: '',
    revisao: false,
    respRevisao: '',
    aprovacao: false,
    respAprovacao: '',
    assinatura: false,
    respAssinatura: '',
  }
}

const nosSeed = (): WorkflowNo[] =>
  WORKFLOW_NODES.map((n) => ({ nome: n, icone: 'Documento', config: defaultNoConfig(n) }))

const SEED: Workflow[] = WORKFLOWS.map((w) => ({
  id: w.id,
  nome: w.nome,
  tipo: w.tipo,
  legislacao: w.legislacao,
  ativo: w.ativo,
  inclusao: w.inclusao,
  nos: nosSeed(),
  criadoEm: `${w.inclusao} 00:00`,
  atualizadoEm: `${w.inclusao} 00:00`,
}))

const bump = (w: Workflow): Workflow => ({ ...w, atualizadoEm: agora() })

export const useWorkflows = create<State>()(
  persist(
    (set) => ({
      workflows: SEED,
      criar: (n) => {
        const id = `wf${uid()}`
        const carimbo = agora()
        set((s) => ({
          workflows: [
            ...s.workflows,
            {
              id,
              nome: n.nome.trim(),
              tipo: n.tipo,
              legislacao: n.legislacao,
              ativo: true,
              inclusao: hoje(),
              nos: nosSeed(),
              criadoEm: carimbo,
              atualizadoEm: carimbo,
            },
          ],
        }))
        return id
      },
      renomear: (id, nome) =>
        set((s) => ({
          workflows: s.workflows.map((w) => (w.id === id ? bump({ ...w, nome: nome.trim() }) : w)),
        })),
      definirAtivo: (id, ativo) =>
        set((s) => ({
          workflows: s.workflows.map((w) => (w.id === id ? bump({ ...w, ativo }) : w)),
        })),
      reordenarNos: (id, nomes) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== id) return w
            const byName = new Map(w.nos.map((no) => [no.nome, no]))
            const nos = nomes.map((nm) => byName.get(nm)).filter((no): no is WorkflowNo => !!no)
            return bump({ ...w, nos })
          }),
        })),
      adicionarNo: (id, nome, afterIndex, icone) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== id) return w
            if (w.nos.some((no) => no.nome === nome)) return w
            const novo: WorkflowNo = { nome: nome.trim(), icone, config: defaultNoConfig(nome) }
            const nos = [...w.nos]
            nos.splice(afterIndex + 1, 0, novo)
            return bump({ ...w, nos })
          }),
        })),
      configurarNo: (id, nome, patch) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== id) return w
            return bump({
              ...w,
              nos: w.nos.map((no) =>
                no.nome === nome ? { ...no, config: { ...no.config, ...patch } } : no,
              ),
            })
          }),
        })),
      aplicarControleGeral: (id, patch) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== id) return w
            return bump({
              ...w,
              nos: w.nos.map((no) => ({
                ...no,
                config: {
                  ...no.config,
                  prazoAtivo: patch.prazoAtivo,
                  duracao: patch.duracao,
                  contagem: patch.contagem,
                  revisao: patch.revisao,
                  aprovacao: patch.aprovacao,
                  assinatura: patch.assinatura,
                },
              })),
            })
          }),
        })),
    }),
    {
      name: 'sollai-workflows',
      version: 1,
      migrate: (persisted) => {
        const s = persisted as { workflows?: Partial<Workflow>[] }
        const carimbo = agora()
        return {
          workflows: (s.workflows ?? []).map((w) => {
            const nos = (w.nos ?? []).map((no) => ({
              nome: no?.nome ?? '',
              icone: no?.icone ?? 'Documento',
              config: { ...defaultNoConfig(no?.nome ?? ''), ...(no?.config ?? {}) },
            }))
            return {
              id: w.id ?? `wf${uid()}`,
              nome: w.nome ?? '',
              tipo: w.tipo ?? '',
              legislacao: w.legislacao ?? '14.133',
              ativo: w.ativo ?? true,
              inclusao: w.inclusao ?? hoje(),
              nos,
              criadoEm: w.criadoEm ?? carimbo,
              atualizadoEm: w.atualizadoEm ?? carimbo,
            }
          }),
        }
      },
    },
  ),
)
