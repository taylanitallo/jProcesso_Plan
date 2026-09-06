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
  /** Shows a search box atop the popup and filters options as the user types — for long lists. */
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

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((o) => !o)
          setFiltro('')
        }}
        className="gt-input flex w-full items-center gap-2 text-left font-normal normal-case disabled:cursor-not-allowed disabled:bg-[#f1f4f9] disabled:text-[var(--color-muted)]"
      >
        <span className={`min-w-0 flex-1 truncate ${value ? '' : 'text-[var(--color-muted)]'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={15} className="shrink-0 text-[var(--color-muted)]" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-pop)]">
          {filterable && (
            <input
              autoFocus
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Digite para filtrar..."
              className="w-full border-b border-[var(--color-line)] px-3 py-2 text-[13px] font-normal normal-case outline-none"
            />
          )}
          <ul className="max-h-60 overflow-y-auto py-1">
          {visiveis.length === 0 && (
            <li className="px-3 py-2 text-[13px] text-[var(--color-muted)]">Nenhuma opção encontrada.</li>
          )}
          {visiveis.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                  setFiltro('')
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
        </div>
      )}
    </div>
  )
}
