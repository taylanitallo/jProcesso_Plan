import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Boxes,
  CalendarRange,
  ClipboardList,
  Coins,
  FileSearch,
  FileSignature,
  FolderKanban,
  Landmark,
  Lock,
  MessagesSquare,
  PenLine,
  Search,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useProcessos } from '../../store/processos'
import { useSolicitacoes } from '../../store/solicitacoes'
import { useRevisoes, revisoesPendentes } from '../../store/revisoes'
import { ACCENTS, type Accent } from '../../components/common/accents'

interface CardDef {
  title: string
  description: string
  icon: LucideIcon
  to?: string
  drill?: 'chat' | 'processos'
  locked?: boolean
  accent: Accent
}

const ROOT: CardDef[] = [
  {
    title: 'SollAI Chat',
    description:
      'Consultas inteligentes, geração automática de documentos e analisadores especializados para ganhar tempo e decidir com segurança.',
    icon: MessagesSquare,
    drill: 'chat',
    accent: 'violet',
  },
  {
    title: 'Orientação Técnica',
    description: 'IA potencializada pela inteligência humana do nosso corpo técnico especializado.',
    icon: Users,
    locked: true,
    accent: 'teal',
  },
  {
    title: 'SollAI Academy',
    description: 'Trilhas personalizadas com IA para acelerar seu domínio nas compras públicas.',
    icon: BookOpen,
    to: '/SollAcademy',
    accent: 'amber',
  },
  {
    title: 'Processos Inteligentes',
    description:
      'Mais controle e eficiência na gestão dos seus processos de licitação, com IA, modelos próprios e fluxos de trabalho automatizados',
    icon: FolderKanban,
    drill: 'processos',
    accent: 'blue',
  },
]

const CHAT: CardDef[] = [
  { title: 'Research', description: '', icon: Search, to: '/Research', accent: 'violet' },
]

const PROCESSOS: CardDef[] = [
  {
    title: 'Catálogo de Itens',
    description: 'Gerencie seus itens ligados ao CatMat/CatSer.',
    icon: Boxes,
    to: '/CatalogoItens',
    accent: 'blue',
  },
  {
    title: 'Pesquisa de Preços',
    description: 'Consulte preços praticados em compras públicas pra fundamentar sua estimativa.',
    icon: Coins,
    to: '/PesquisaPrecos',
    accent: 'green',
  },
  {
    title: 'Consulta PNCP',
    description: 'Busque contratações, atas de registro de preço e contratos reais publicados por qualquer órgão do Brasil.',
    icon: Landmark,
    to: '/ConsultaPncp',
    accent: 'indigo',
  },
  {
    title: 'Registro de Necessidades',
    description: 'Registre demandas do setor para contratação.',
    icon: ClipboardList,
    to: '/RegistroNecessidade',
    accent: 'teal',
  },
  {
    title: 'Criar PCA',
    description: 'Monte um Plano de Contratação Anual localmente antes de enviar ao PNCP.',
    icon: CalendarRange,
    to: '/CriarPca',
    accent: 'amber',
  },
  {
    title: 'Analisadores de Processos',
    description: 'Analise processos de licitação com analisadores especializados em IA.',
    icon: FileSearch,
    to: '/AnalisadoresProcesso',
    accent: 'pink',
  },
  {
    title: 'Processos Inteligentes',
    description:
      'Mais controle e eficiência na gestão dos seus processos de licitação, com IA, modelos próprios e fluxos de trabalho automatizados',
    icon: FolderKanban,
    to: '/processosinteligentes',
    accent: 'blue',
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

      {view === 'root' && <ResumoStrip />}

      <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
        {cards.map(({ title, description, icon: Icon, to, drill, locked, accent }) => (
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
                locked ? 'bg-[#eef1f7] text-[var(--color-muted)]' : `${ACCENTS[accent].bg} ${ACCENTS[accent].text}`
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

function ResumoStrip() {
  const navigate = useNavigate()
  const processos = useProcessos((s) => s.processos)
  const solicitacoes = useSolicitacoes((s) => s.solicitacoes)
  const revisoes = useRevisoes((s) => s.revisoes)

  const ativos = processos.filter((p) => p.status === 'ATIVO')
  const artefatosPendentes = ativos.reduce(
    (n, p) => n + p.artefatos.filter((a) => !a.enviado).length,
    0,
  )
  const solicitacoesPendentes = solicitacoes.filter((s) => s.status === 'PENDENTE').length
  const revisoesP = revisoesPendentes(revisoes).length

  const tiles: { label: string; valor: number; icon: LucideIcon; to: string; accent: Accent }[] = [
    { label: 'Processos ativos', valor: ativos.length, icon: FolderKanban, to: '/processosinteligentes', accent: 'blue' },
    { label: 'Artefatos pendentes', valor: artefatosPendentes, icon: FileSignature, to: '/StatusArtefatos', accent: 'amber' },
    { label: 'Solicitações pendentes', valor: solicitacoesPendentes, icon: ClipboardList, to: '/RegistroNecessidade', accent: 'teal' },
    { label: 'Revisões pendentes', valor: revisoesP, icon: PenLine, to: '/processosinteligentes', accent: 'pink' },
  ]

  return (
    <div className="mt-6 grid w-full gap-3 sm:grid-cols-4">
      {tiles.map(({ label, valor, icon: Icon, to, accent }) => (
        <button
          key={label}
          onClick={() => navigate(to)}
          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white px-4 py-3 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[#c9d6ea] hover:shadow-[var(--shadow-pop)]"
        >
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${ACCENTS[accent].bg} ${ACCENTS[accent].text}`}>
            <Icon size={17} />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl font-extrabold leading-none text-[#183263]">
              {valor}
            </span>
            <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
              {label}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
