import { Search } from 'lucide-react'
import { ChatShell } from './ChatShell'
import { Wizard } from './Wizard'
import { RESEARCH_STEPS } from './chatConstants'
import { RESEARCH_HISTORY } from '../../mocks'

export function ResearchPage() {
  return (
    <ChatShell
      counterLabel="Total Researchs"
      counterValue={0}
      history={RESEARCH_HISTORY}
      itemIcon={Search}
    >
      <Wizard steps={RESEARCH_STEPS} finishLabel="Analisar" />
    </ChatShell>
  )
}
