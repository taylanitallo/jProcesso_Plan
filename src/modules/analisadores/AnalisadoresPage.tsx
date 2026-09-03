import { FileSearch } from 'lucide-react'
import { ChatShell } from '../chat/ChatShell'
import { WizardChoice } from '../chat/WizardChoice'
import { RESEARCH_FUNCOES } from '../../mocks'

export function AnalisadoresPage() {
  return (
    <ChatShell
      counterLabel="Total Analisadores"
      counterValue={0}
      history={[]}
      itemIcon={FileSearch}
      showTabs={false}
    >
      <WizardChoice
        prompt={
          <>
            <strong>O que deseja fazer hoje?</strong> Selecione uma função na qual eu possa atuar
            para você.
          </>
        }
        options={RESEARCH_FUNCOES}
      />
    </ChatShell>
  )
}
