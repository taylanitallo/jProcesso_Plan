import { useState } from 'react'
import { Search } from 'lucide-react'
import { ChatShell } from './ChatShell'
import { Wizard } from './Wizard'
import { AnaliseView } from './AnaliseView'
import { RESEARCH_STEPS } from './chatConstants'
import { useAnalises, type Analise } from '../../store/analises'

export function ResearchPage() {
  const todas = useAnalises((s) => s.analises)
  const criar = useAnalises((s) => s.criar)
  const researchs = todas.filter((a) => a.kind === 'research')
  const [sel, setSel] = useState<Analise | null>(null)
  const [wizKey, setWizKey] = useState(0)

  return (
    <ChatShell
      counterLabel="Total Researchs"
      counterValue={researchs.length}
      history={researchs.map((a) => ({
        id: a.id,
        title: a.titulo,
        preview: a.resumo,
        date: a.criadoEm,
      }))}
      itemIcon={Search}
      activeId={sel?.id ?? null}
      onSelect={(h) => setSel(researchs.find((a) => a.id === h.id) ?? null)}
      onNew={() => {
        setSel(null)
        setWizKey((k) => k + 1)
      }}
    >
      {sel ? (
        <AnaliseView analise={sel} onBack={() => setSel(null)} />
      ) : (
        <Wizard
          key={wizKey}
          steps={RESEARCH_STEPS}
          finishLabel="Analisar"
          resultKind="analise"
          onFinish={(picks) => criar({ kind: 'research', picks })}
        />
      )}
    </ChatShell>
  )
}
