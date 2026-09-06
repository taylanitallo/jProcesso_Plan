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
  disabled,
  filterable,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  disabled?: boolean
  /** Lets the user type into the trigger itself to filter — for long lists (matches SollAI's real combo). */
  filterable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [filtro, setFiltro] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setFiltro('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const visiveis = filterable
    ? options.filter((o) => o.toLowerCase().includes(filtro.toLowerCase()))
    : options

  const escolher = (opt: string) => {
    onChange(opt)
    setOpen(false)
    setFiltro('')
  }

  return (
    <div ref={ref} className="relative min-w-0">
      {filterable ? (
        <div className="relative">
          <input
            disabled={disabled}
            value={open ? filtro : value}
            onFocus={() => {
              setOpen(true)
              setFiltro('')
            }}
            onChange={(e) => {
              setFiltro(e.target.value)
              setOpen(true)
            }}
            placeholder={placeholder}
            className="gt-input w-full pr-8 font-normal normal-case disabled:cursor-not-allowed disabled:bg-[#f1f4f9] disabled:text-[var(--color-muted)]"
          />
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 shrink-0 text-[var(--color-muted)]"
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="gt-input flex w-full items-center gap-2 text-left font-normal normal-case disabled:cursor-not-allowed disabled:bg-[#f1f4f9] disabled:text-[var(--color-muted)]"
        >
          <span className={`min-w-0 flex-1 truncate ${value ? '' : 'text-[var(--color-muted)]'}`}>
            {value || placeholder}
          </span>
          <ChevronDown size={15} className="shrink-0 text-[var(--color-muted)]" />
        </button>
      )}

      {open && (
        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white py-1 shadow-[var(--shadow-pop)]">
          {visiveis.length === 0 && (
            <li className="px-3 py-2 text-[13px] text-[var(--color-muted)]">Nenhuma opção encontrada.</li>
          )}
          {visiveis.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => escolher(opt)}
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
