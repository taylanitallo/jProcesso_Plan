import { Construction } from 'lucide-react'
import { Card } from './Card'

/** Temporary page shell for routes delivered in later phases. */
export function Placeholder({ title, phase }: { title: string; phase: number }) {
  return (
    <Card title={title}>
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Construction size={32} className="text-[var(--color-muted)]" />
        <p className="text-sm font-semibold text-[var(--color-ink)]">Em construção</p>
        <p className="text-xs text-[var(--color-muted)]">Este módulo chega na Fase {phase}.</p>
      </div>
    </Card>
  )
}
