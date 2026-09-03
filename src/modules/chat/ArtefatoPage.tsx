import { BookText } from 'lucide-react'
import { ChatShell } from './ChatShell'
import { Wizard } from './Wizard'
import { ARTEFATO_STEPS } from './chatConstants'
import { ARTEFATO_HISTORY } from '../../mocks'

export function ArtefatoPage() {
  return (
    <ChatShell
      counterLabel="Total Artefatos"
      counterValue={0}
      history={ARTEFATO_HISTORY}
      itemIcon={BookText}
    >
      <Wizard steps={ARTEFATO_STEPS} finishLabel="Gerar Artefato" resultKind="artefato" />
    </ChatShell>
  )
}
