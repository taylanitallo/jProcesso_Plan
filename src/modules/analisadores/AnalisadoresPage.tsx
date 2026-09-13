import { useState } from 'react'
import { FileSearch } from 'lucide-react'
import { ChatShell } from '../chat/ChatShell'
import { Wizard } from '../chat/Wizard'
import { AnaliseView } from '../chat/AnaliseView'
import { RESEARCH_STEPS } from '../chat/chatConstants'
import { useAnalises, type Analise } from '../../store/analises'

export function AnalisadoresPage() {
  const todas = useAnalises((s) => s.analises)
  const criar = useAnalises((s) => s.criar)
  const analises = todas.filter((a) => a.kind === 'analise')
  const [sel, setSel] = useState<Analise | null>(null)
  const [wizKey, setWizKey] = useState(0)

  return (
    <ChatShell
      counterLabel="Total Analisadores"
      counterValue={analises.length}
      history={analises.map((a) => ({ id: a.id, title: a.titulo, preview: a.resumo, date: a.criadoEm }))}
      itemIcon={FileSearch}
      accent="pink"
      showTabs={false}
      searchPlaceholder="Pesquisar no histórico..."
      activeId={sel?.id ?? null}
      onSelect={(h) => setSel(analises.find((a) => a.id === h.id) ?? null)}
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
          onFinish={(picks) => criar({ kind: 'analise', picks })}
        />
      )}
    </ChatShell>
  )
}
