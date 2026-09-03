import { useNavigate } from 'react-router-dom'
import { BookOpen, FileSearch, Lock, MessagesSquare, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../store/auth'

interface HomeCard {
  title: string
  description: string
  icon: LucideIcon
  to?: string
  locked?: boolean
}

const CARDS: HomeCard[] = [
  {
    title: 'SollAI Chat',
    description: 'Consulta, geração de artefatos, research e chat livre com a IA.',
    icon: MessagesSquare,
    to: '/chat/consulta',
  },
  {
    title: 'Processos Inteligentes',
    description: 'Dashboard, 27 artefatos, fluxos de trabalho e modelos personalizados.',
    icon: Workflow,
    to: '/processos',
  },
  {
    title: 'SollAI Academy',
    description: 'Trilhas de capacitação em compras e contratações públicas.',
    icon: BookOpen,
    to: '/academy',
  },
  {
    title: 'Analisadores de Processos',
    description: 'Análise automatizada de peças processuais por função.',
    icon: FileSearch,
    to: '/analisadores',
  },
  {
    title: 'Orientação Técnica',
    description: 'Disponível no seu plano em breve.',
    icon: Lock,
    locked: true,
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#183263]">
          Olá, {firstName}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Escolha um módulo para começar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ title, description, icon: Icon, to, locked }) => (
          <button
            key={title}
            disabled={locked}
            onClick={() => to && navigate(to)}
            className={`group flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-left shadow-[var(--shadow-card)] transition ${
              locked
                ? 'cursor-not-allowed opacity-60'
                : 'hover:-translate-y-0.5 hover:border-[#c9d6ea] hover:shadow-[var(--shadow-pop)]'
            }`}
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-[12px] ${
                locked
                  ? 'bg-[#eef1f7] text-[var(--color-muted)]'
                  : 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
              }`}
            >
              <Icon size={22} />
            </span>
            <div>
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#183263]">
                {title}
                {locked && <Lock size={13} className="text-[var(--color-muted)]" />}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
