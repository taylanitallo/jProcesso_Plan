import { Search } from 'lucide-react'
import { ChatShell } from './ChatShell'
import { WizardChoice } from './WizardChoice'
import { RESEARCH_HISTORY, RESEARCH_FUNCOES } from '../../mocks'

export function ResearchPage() {
  return (
    <ChatShell
      counterLabel="Total Researchs"
      counterValue={0}
      history={RESEARCH_HISTORY}
      itemIcon={Search}
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
