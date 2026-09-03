import { BookText } from 'lucide-react'
import { ChatShell } from './ChatShell'
import { WizardChoice } from './WizardChoice'
import { ARTEFATO_HISTORY, ARTEFATO_LEGISLACOES } from '../../mocks'

export function ArtefatoPage() {
  return (
    <ChatShell
      counterLabel="Total Artefatos"
      counterValue={0}
      history={ARTEFATO_HISTORY}
      itemIcon={BookText}
    >
      <WizardChoice
        prompt={
          <>
            <strong>Escolha a legislação:</strong> (Baseado em qual lei deseja a resposta).
          </>
        }
        options={ARTEFATO_LEGISLACOES}
      />
    </ChatShell>
  )
}
