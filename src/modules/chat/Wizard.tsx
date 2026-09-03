import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, FileText, Plus, UploadCloud } from 'lucide-react'
import { AiBubble } from './ChatShell'
import type { Step } from './chatConstants'

export type { Step }

export function Wizard({
  steps,
  finishLabel,
  resultKind,
}: {
  steps: Step[]
  finishLabel: string
  /** shape of the completion screen */
  resultKind: 'artefato' | 'analise'
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [done, setDone] = useState(false)

  const reset = () => {
    setIndex(0)
    setAnswers({})
    setDone(false)
  }

  const setSingle = (i: number, v: string) => setAnswers((a) => ({ ...a, [i]: [v] }))
  const toggleMulti = (i: number, v: string) =>
    setAnswers((a) => {
      const cur = a[i] ?? []
      return { ...a, [i]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }
    })

  const stepAnswered = (i: number) => {
    const s = steps[i]
    if (s.kind === 'upload') return true
    if (s.kind === 'text') return s.optional || (answers[i]?.[0]?.trim().length ?? 0) > 0
    return (answers[i]?.length ?? 0) > 0
  }

  const last = index === steps.length - 1
  const picks = Object.values(answers).flat().filter(Boolean)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="flex-1 space-y-5">
        {steps.slice(0, index + 1).map((s, i) => (
          <div key={i} className={i < index || done ? 'pointer-events-none opacity-55' : ''}>
            <StepBubble
              step={s}
              stepIndex={i}
              selected={answers[i] ?? []}
              onSingle={(v) => setSingle(i, v)}
              onMulti={(v) => toggleMulti(i, v)}
              onText={(v) => setAnswers((a) => ({ ...a, [i]: [v] }))}
              onUpload={() => setAnswers((a) => ({ ...a, [i]: ['(arquivo enviado)'] }))}
            />
          </div>
        ))}

        {done && (
          <AiBubble>
            <p className="flex items-center gap-2 font-bold text-[var(--color-success)]">
              <CheckCircle2 size={16} />
              {resultKind === 'artefato'
                ? 'Artefato gerado com sucesso.'
                : 'Análise concluída.'}
            </p>
            {picks.length > 0 && (
              <p className="mt-1 text-[13px] text-[var(--color-muted)]">
                Baseado em: {picks.slice(0, 4).join(', ')}
                {picks.length > 4 ? '…' : ''}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3 py-2">
              <FileText size={18} className="text-[var(--color-primary-strong)]" />
              <span className="text-[13px] font-semibold text-[var(--color-ink)]">
                {resultKind === 'artefato' ? 'documento-gerado.docx' : 'relatorio-de-analise.docx'}
              </span>
              <button className="ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-3 py-1.5 text-xs font-semibold text-white">
                <Download size={13} /> Baixar
              </button>
            </div>
          </AiBubble>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2 pr-2">
        {done ? (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary-soft)]"
          >
            <Plus size={15} /> Novo
          </button>
        ) : (
          <>
            {index > 0 && (
              <button
                onClick={() => setIndex((i) => i - 1)}
                className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                Voltar
              </button>
            )}
            <button
              disabled={!stepAnswered(index)}
              onClick={() => (last ? setDone(true) : setIndex((i) => i + 1))}
              className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-6 py-2 text-sm font-semibold text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary-soft)] disabled:opacity-50"
            >
              {last ? finishLabel : 'Próximo'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function StepBubble({
  step,
  stepIndex,
  selected,
  onSingle,
  onMulti,
  onText,
  onUpload,
}: {
  step: Step
  stepIndex: number
  selected: string[]
  onSingle: (v: string) => void
  onMulti: (v: string) => void
  onText: (v: string) => void
  onUpload: () => void
}) {
  return (
    <AiBubble>
      <p className="mb-2">{step.prompt}</p>

      {step.kind === 'choice' && (
        <div className="flex flex-col gap-2">
          {step.options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-start gap-2.5 text-[13px]">
              <input
                type="radio"
                name={`step-${stepIndex}`}
                checked={selected[0] === opt}
                onChange={() => onSingle(opt)}
                className="mt-0.5 accent-[var(--color-primary)]"
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {step.kind === 'group' && (
        <div className="flex flex-col gap-3">
          {step.groups.map((g) => (
            <div key={g.grupo}>
              <p className="mb-1 text-[13px] font-bold text-[#183263]">• {g.grupo}</p>
              <div className="flex flex-col gap-1.5 pl-2">
                {g.itens.map((it) => (
                  <label key={it} className="flex cursor-pointer items-start gap-2.5 text-[13px]">
                    <input
                      type="checkbox"
                      checked={selected.includes(it)}
                      onChange={() => onMulti(it)}
                      className="mt-0.5 accent-[var(--color-primary)]"
                    />
                    {it}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {step.kind === 'text' && (
        <textarea
          rows={4}
          value={selected[0] ?? ''}
          onChange={(e) => onText(e.target.value)}
          placeholder={step.placeholder}
          className="gt-input mt-1 w-full resize-y"
        />
      )}

      {step.kind === 'upload' && (
        <>
          {step.warning && (
            <div className="mb-3 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] p-4 text-[13px] text-[#8a6d1a]">
              <p className="flex items-center gap-2 font-bold">
                <AlertTriangle size={15} /> {step.warning.title}
              </p>
              <p className="mt-1">Para melhor funcionamento da análise na SollAI, não envie documentos:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {step.warning.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {step.warning.note && <p className="mt-1 font-semibold">{step.warning.note}</p>}
            </div>
          )}
          <p className="mb-2 text-[13px]">
            Selecione um arquivo em{' '}
            <span className="rounded bg-[#eef1f7] px-1.5 py-0.5 font-semibold">word</span> ou{' '}
            <span className="rounded bg-[#eef1f7] px-1.5 py-0.5 font-semibold">pdf</span>.
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f6fd0_0%,#1f8f6a_100%)] px-4 py-2.5 text-sm font-semibold text-white">
            <UploadCloud size={16} /> Selecionar Arquivos
            <input type="file" className="hidden" onChange={onUpload} />
          </label>
          <p className="mt-2 text-xs text-[var(--color-muted)]">Limite de arquivos até 800 MB.</p>
          {selected[0] && (
            <p className="mt-1 text-xs font-semibold text-[var(--color-success)]">Arquivo pronto para envio.</p>
          )}
        </>
      )}
    </AiBubble>
  )
}
