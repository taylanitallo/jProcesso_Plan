import type { ReactNode } from 'react'

type Tone = 'success' | 'info' | 'danger' | 'warning' | 'neutral'

const tones: Record<Tone, string> = {
  success: 'bg-[#e4f4ec] text-[#146c43]',
  info: 'bg-[#e2edfb] text-[#1d5bb0]',
  danger: 'bg-[#fbe4e7] text-[#a52834]',
  warning: 'bg-[#fbf0d9] text-[#9a6f10]',
  neutral: 'bg-[#eef1f7] text-[#586479]',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
