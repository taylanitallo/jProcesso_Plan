import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Boxes,
  ClipboardList,
  FileSearch,
  FolderKanban,
  Lock,
  MessagesSquare,
  Search,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CardDef {
  title: string
  description: string
  icon: LucideIcon
  to?: string
  drill?: 'chat' | 'processos'
  locked?: boolean
}

const ROOT: CardDef[] = [
  {
    title: 'SollAI Chat',
    description:
      'Consultas inteligentes, geração automática de documentos e analisadores especializados para ganhar tempo e decidir com segurança.',
    icon: MessagesSquare,
    drill: 'chat',
  },
  {
    title: 'Orientação Técnica',
    description: 'IA potencializada pela inteligência humana do nosso corpo técnico especializado.',
    icon: Users,
    locked: true,
  },
  {
    title: 'SollAI Academy',
    description: 'Trilhas personalizadas com IA para acelerar seu domínio nas compras públicas.',
    icon: BookOpen,
    to: '/SollAcademy',
  },
  {
    title: 'Processos Inteligentes',
    description:
      'Mais controle e eficiência na gestão dos seus processos de licitação, com IA, modelos próprios e fluxos de trabalho automatizados',
    icon: FolderKanban,
    drill: 'processos',
  },
]

const CHAT: CardDef[] = [{ title: 'Research', description: '', icon: Search, to: '/Research' }]

const PROCESSOS: CardDef[] = [
  {
    title: 'Catálogo de Itens',
    description: 'Gerencie seus itens ligados ao CatMat/CatSer.',
    icon: Boxes,
    to: '/CatalogoItens',
  },
  {
    title: 'Registro de Necessidades',
    description: 'Registre demandas do setor para contratação.',
    icon: ClipboardList,
    to: '/RegistroNecessidade',
  },
  {
    title: 'Analisadores de Processos',
    description: 'Analise processos de licitação com analisadores especializados em IA.',
    icon: FileSearch,
    to: '/AnalisadoresProcesso',
  },
  {
    title: 'Processos Inteligentes',
    description:
      'Mais controle e eficiência na gestão dos seus processos de licitação, com IA, modelos próprios e fluxos de trabalho automatizados',
    icon: FolderKanban,
    to: '/processosinteligentes',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'root' | 'chat' | 'processos'>('root')
  const cards = view === 'chat' ? CHAT : view === 'processos' ? PROCESSOS : ROOT

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center py-6">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#22b8a6_0%,#3b5bd0_60%,#7b3ff0_100%)] text-white">
        ✦
      </span>
      <h1 className="font-display text-3xl font-extrabold text-[#183263]">Bem vindo à SollAI!</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {view === 'root' ? 'O que deseja fazer hoje?' : (
          <button
            onClick={() => setView('root')}
            className="font-semibold text-[var(--color-primary)] hover:underline"
          >
            ← Voltar
          </button>
        )}
      </p>

      <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
        {cards.map(({ title, description, icon: Icon, to, drill, locked }) => (
          <button
            key={title}
            disabled={locked}
            onClick={() => (drill ? setView(drill) : to && navigate(to))}
            className={`group flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white px-6 py-8 text-center shadow-[var(--shadow-card)] transition ${
              locked
                ? 'cursor-not-allowed opacity-55'
                : 'hover:-translate-y-0.5 hover:border-[#c9d6ea] hover:shadow-[var(--shadow-pop)]'
            }`}
          >
            <span
              className={`grid h-12 w-12 place-items-center rounded-[12px] ${
                locked
                  ? 'bg-[#eef1f7] text-[var(--color-muted)]'
                  : 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
              }`}
            >
              <Icon size={24} />
            </span>
            <span className="flex items-center gap-2 font-display text-lg font-bold text-[#183263]">
              {title}
              {locked && <Lock size={13} className="text-[var(--color-muted)]" />}
            </span>
            {description && (
              <span className="text-sm text-[var(--color-muted)]">{description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
