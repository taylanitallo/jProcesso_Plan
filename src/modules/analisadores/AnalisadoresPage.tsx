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
      searchPlaceholder="Pesquisar no histórico..."
    >
      <Wizard steps={RESEARCH_STEPS} finishLabel="Analisar" resultKind="analise" />
    </ChatShell>
  )
}
