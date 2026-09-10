import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AnaliseKind = 'analise' | 'research' | 'artefato'

export type Analise = {
  id: string
  kind: AnaliseKind
  titulo: string
  resumo: string
  corpo: string
  picks: string[]
  criadoEm: string
}

export type NovaAnalise = { kind: AnaliseKind; picks: string[] }

type State = {
  analises: Analise[]
  criar: (n: NovaAnalise) => Analise
  remover: (id: string) => void
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

const ROTULO: Record<AnaliseKind, string> = {
  analise: 'Análise',
  research: 'Research',
  artefato: 'Artefato',
}

/** Monta um relatório determinístico a partir das escolhas do wizard (sem LLM). */
export function montarRelatorio(kind: AnaliseKind, picks: string[]): {
  titulo: string
  resumo: string
  corpo: string
} {
  const funcao = picks[0]?.trim() || ROTULO[kind]
  const entradas = picks.filter(Boolean)
  const titulo = `${ROTULO[kind]} — ${funcao}`
  const resumo =
    entradas.length > 1
      ? `Baseado em: ${entradas.slice(1, 5).join(', ')}${entradas.length > 5 ? '…' : ''}`
      : 'Sem documentos ou parâmetros adicionais.'

  const secoes =
    kind === 'artefato'
      ? [
          ['Objeto', `Esboço de "${funcao}" a partir dos parâmetros informados.`],
          ['Estrutura sugerida', 'Introdução, fundamentação legal, detalhamento técnico e anexos.'],
          ['Próximos passos', 'Revisar com a área técnica e submeter ao fluxo de aprovação.'],
        ]
      : [
          [
            'Conformidade legal',
            `Verificação de "${funcao}" frente à legislação selecionada e aos documentos enviados.`,
          ],
          [
            'Pontos de atenção',
            'Itens que exigem revisão manual antes de decisão — prazos, competência e motivação.',
          ],
          [
            'Recomendações',
            'Registrar a análise no processo e encaminhar para deliberação da autoridade competente.',
          ],
        ]

  const corpo = [
    `# ${titulo}`,
    ``,
    `Gerado em ${agora()}.`,
    ``,
    `## Entradas`,
    ...(entradas.length
      ? entradas.map((e, i) => `${i + 1}. ${e}`)
      : ['_Nenhuma entrada registrada._']),
    ``,
    ...secoes.flatMap(([t, p]) => [`## ${t}`, p, ``]),
    `> Documento gerado localmente pelo clone SollAI — sem processamento por IA.`,
  ].join('\n')

  return { titulo, resumo, corpo }
}

export const useAnalises = create<State>()(
  persist(
    (set) => ({
      analises: [],
      criar: (n) => {
        const { titulo, resumo, corpo } = montarRelatorio(n.kind, n.picks)
        const registro: Analise = {
          id: `ana${uid()}`,
          kind: n.kind,
          titulo,
          resumo,
          corpo,
          picks: n.picks.filter(Boolean),
          criadoEm: agora(),
        }
        set((s) => ({ analises: [registro, ...s.analises] }))
        return registro
      },
      remover: (id) => set((s) => ({ analises: s.analises.filter((a) => a.id !== id) })),
    }),
    { name: 'sollai-analises', version: 1 },
  ),
)
