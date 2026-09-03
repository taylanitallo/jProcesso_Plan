import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { AiBubble } from './ChatShell'
import type { Step } from './chatConstants'

export type { Step }

export function Wizard({ steps, finishLabel }: { steps: Step[]; finishLabel: string }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const step = steps[index]
  const last = index === steps.length - 1
  const answered =
    step.kind === 'upload' ||
    (step.kind === 'text' && step.optional) ||
    Boolean(answers[index] && answers[index].trim().length > 0)

  const set = (v: string) => setAnswers((a) => ({ ...a, [index]: v }))

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex-1 space-y-5">
        {steps.slice(0, index).map((_, i) => (
          <div key={i} className="flex justify-end">
            <div className="max-w-2xl rounded-[14px] bg-[#dbe7fb] px-4 py-2 text-[13px] text-[#1f3350]">
              {answers[i] || '(arquivo enviado)'}
            </div>
          </div>
        ))}

        <AiBubble>
          <p className="mb-2">{step.prompt}</p>

          {step.kind === 'choice' && (
            <div className="flex flex-col gap-2">
              {step.options.map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-start gap-2.5 text-[13px] text-[var(--color-ink)]"
                >
                  <input
                    type="radio"
                    name={`step-${index}`}
                    checked={answers[index] === opt}
                    onChange={() => set(opt)}
                    className="mt-0.5 accent-[var(--color-primary)]"
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {step.kind === 'text' && (
            <textarea
              rows={4}
              value={answers[index] ?? ''}
              onChange={(e) => set(e.target.value)}
              placeholder={step.placeholder}
              className="gt-input mt-1 w-full resize-y"
            />
          )}

          {step.kind === 'upload' && (
            <label className="mt-1 flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-control)] border-2 border-dashed border-[#c9d6ea] bg-white px-4 py-8 text-center">
              <UploadCloud size={24} className="text-[var(--color-muted)]" />
              <span className="text-xs font-semibold text-[var(--color-primary-strong)]">
                Selecionar Arquivo
              </span>
              <span className="text-[11px] text-[var(--color-muted)]">
                Limite de arquivos até 800 MB.
              </span>
              <input type="file" className="hidden" onChange={() => set('(arquivo enviado)')} />
            </label>
          )}
        </AiBubble>
      </div>

      <div className="mt-4 flex justify-end gap-2 pr-2">
        {index > 0 && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Voltar
          </button>
        )}
        <button
          disabled={!answered}
          onClick={() => !last && setIndex((i) => i + 1)}
          className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-6 py-2 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary-soft)] disabled:opacity-50"
        >
          {last ? finishLabel : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
