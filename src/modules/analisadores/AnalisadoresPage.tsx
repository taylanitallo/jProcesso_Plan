import { FileSearch } from 'lucide-react'
import { ChatShell } from '../chat/ChatShell'
import { Wizard } from '../chat/Wizard'
import { RESEARCH_STEPS } from '../chat/chatConstants'

export function AnalisadoresPage() {
  return (
    <ChatShell
      counterLabel="Total Analisadores"
      counterValue={0}
      history={[]}
      itemIcon={FileSearch}
      showTabs={false}
    >
      <Wizard steps={RESEARCH_STEPS} finishLabel="Analisar" />
    </ChatShell>
  )
}
