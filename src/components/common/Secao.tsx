import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ACCENTS, type Accent } from './accents'

/**
 * Bloco de formulário com cabeçalho colorido (ícone + borda + título) —
 * usado pra dividir formulários grandes em grupos visualmente distintos em
 * vez de um bloco só de campos sem cor. Reaproveitado em vários módulos.
 */
export function Secao({
  icon: Icon,
  titulo,
  accent,
  children,
}: {
  icon: LucideIcon
  titulo: string
  accent: Accent
  children: ReactNode
}) {
  const a = ACCENTS[accent]
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4">
      <div className={`mb-3 flex items-center gap-2 border-l-4 ${a.border} pl-2.5`}>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[8px] ${a.bg} ${a.text}`}>
          <Icon size={15} />
        </span>
        <h4 className="font-display text-sm font-bold text-[#183263]">{titulo}</h4>
      </div>
      {children}
    </div>
  )
}
