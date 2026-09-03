import { useState } from 'react'
import { AiBubble } from './ChatShell'

interface Props {
  prompt: React.ReactNode
  options: string[]
}

/** Step 1 of the Artefato / Research / Analisadores wizards: a radio list + "Próximo". */
export function WizardChoice({ prompt, options }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <AiBubble>
        <p className="mb-2">{prompt}</p>
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-start gap-2.5 text-[13px] text-[var(--color-ink)]"
            >
              <input
                type="radio"
                name="wizard"
                checked={selected === opt}
                onChange={() => setSelected(opt)}
                className="mt-0.5 accent-[var(--color-primary)]"
              />
              {opt}
            </label>
          ))}
        </div>
      </AiBubble>

      <div className="mt-4 flex justify-end pr-2">
        <button
          disabled={!selected}
          className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-6 py-2 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary-soft)] disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  )
}
