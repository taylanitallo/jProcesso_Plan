import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: ReactNode
  footer?: ReactNode
}

export function DataTable<T>({ columns, rows, rowKey, empty, footer }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[linear-gradient(180deg,#263a60_0%,#1e3154_100%)] text-left text-xs font-semibold uppercase tracking-wide text-white/90">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`whitespace-nowrap px-4 py-3 ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  className={`border-t border-[var(--color-line)] transition hover:bg-[var(--color-primary-soft)] ${
                    i % 2 ? 'bg-[#f8fafd]' : 'bg-white'
                  }`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 align-middle text-[var(--color-ink)] ${
                        c.align === 'right'
                          ? 'text-right'
                          : c.align === 'center'
                            ? 'text-center'
                            : ''
                      }`}
                    >
                      {c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="flex items-center justify-between border-t border-[var(--color-line)] bg-[#fbfcfe] px-4 py-3 text-xs text-[var(--color-muted)]">
          {footer}
        </div>
      )}
    </div>
  )
}

export function Pagination({ pages = 1, current = 1 }: { pages?: number; current?: number }) {
  return (
    <div className="flex items-center gap-1">
      <PagePill disabled>«</PagePill>
      {Array.from({ length: pages }, (_, i) => (
        <PagePill key={i} active={i + 1 === current}>
          {i + 1}
        </PagePill>
      ))}
      <PagePill disabled={pages <= 1}>»</PagePill>
    </div>
  )
}

function PagePill({
  children,
  active,
  disabled,
}: {
  children: ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      className={`grid h-8 min-w-8 place-items-center rounded-[10px] border px-2 text-xs font-semibold transition ${
        active
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
          : 'border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  )
}
