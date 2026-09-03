import { useState } from 'react'
import { Scale, SendHorizontal } from 'lucide-react'
import { ChatShell, AiBubble } from './ChatShell'
import { CONSULTA_HISTORY } from '../../mocks'

export function ConsultaPage() {
  const [value, setValue] = useState('')

  return (
    <ChatShell
      counterLabel="Total Consultas"
      counterValue={1}
      history={CONSULTA_HISTORY}
      itemIcon={Scale}
    >
      <div className="flex-1 overflow-y-auto p-6">
        <AiBubble>Como posso ajudá-lo hoje?</AiBubble>
      </div>

      <div className="border-t border-[var(--color-line)] bg-white/60 p-4">
        <div className="rounded-[16px] border border-[var(--color-line)] bg-white p-3 shadow-[var(--shadow-card)]">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder="Digite sua pergunta aqui..."
            className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none"
          />
          <div className="flex justify-end">
            <button
              disabled={!value.trim()}
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizontal size={16} />
              Enviar Pergunta
            </button>
          </div>
        </div>
      </div>
    </ChatShell>
  )
}
