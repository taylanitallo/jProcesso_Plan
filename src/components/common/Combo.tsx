import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * Custom select — unlike a native <select>, the option popup is constrained to
 * the field width and wraps long labels instead of overflowing the container.
 */
export function Combo({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="gt-input flex w-full items-center gap-2 text-left font-normal normal-case"
      >
        <span className={`min-w-0 flex-1 truncate ${value ? '' : 'text-[var(--color-muted)]'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={15} className="shrink-0 text-[var(--color-muted)]" />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white py-1 shadow-[var(--shadow-pop)]">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-[13px] leading-snug hover:bg-[var(--color-primary-soft)]"
              >
                <Check
                  size={14}
                  className={`mt-0.5 shrink-0 ${value === opt ? 'text-[var(--color-primary)]' : 'invisible'}`}
                />
                <span className="whitespace-normal break-words">{opt}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
