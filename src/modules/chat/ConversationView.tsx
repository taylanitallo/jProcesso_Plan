import { MoreVertical, Plus } from 'lucide-react'
import type { ConsultaAnswer } from '../../mocks'

/**
 * Rendered when a Consulta history item is opened: user bubble, AI answer bubble
 * with the teal accent, and the right-hand references / doutrina sidebar.
 */
export function ConversationView({
  question,
  answer,
  onNew,
}: {
  question: string
  answer: ConsultaAnswer
  onNew: () => void
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 gap-6 p-6">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="ml-auto max-w-3xl rounded-[14px] bg-[#dbe7fb] px-5 py-3 text-sm font-medium text-[#1f3350]">
            {question}
          </div>

          <div className="flex gap-3">
            <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#22b8a6_0%,#3b5bd0_60%,#7b3ff0_100%)] text-white">
              ✦
            </span>
            <div className="relative min-w-0 flex-1 rounded-[14px] border-l-4 border-[#22b8a6] bg-[#f4f6f8] px-5 py-4">
              <button className="absolute right-3 top-3 text-[var(--color-muted)]">
                <MoreVertical size={16} />
              </button>
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-ink)]">
                {answer.body}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden w-64 shrink-0 flex-col gap-4 text-xs lg:flex">
          <Meta label="Data da solicitação" value={answer.data} />
          <Meta label="Formato de resposta" value={answer.formato} />
          <div>
            <p className="mb-1 font-bold text-[#183263]">Referências utilizadas</p>
            <ol className="list-decimal space-y-1.5 pl-4 text-[var(--color-muted)]">
              {answer.referencias.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
          </div>
          <Meta label="Legislação" value={answer.legislacao} />
          <div>
            <p className="mb-1 font-bold text-[#183263]">Doutrina</p>
            <ul className="space-y-1 text-[var(--color-primary-strong)]">
              {answer.doutrina.map((d) => (
                <li key={d} className="truncate">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 border-t border-[var(--color-line)] bg-white/70 p-4 text-center backdrop-blur">
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary-soft)]"
        >
          <Plus size={15} /> Criar nova consulta
        </button>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[var(--color-muted)]">
      <span className="font-bold text-[#183263]">{label}:</span> {value}
    </p>
  )
}
