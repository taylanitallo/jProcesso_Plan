import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileSignature,
  Filter,
  PenLine,
  Plus,
  Search,
} from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { AgendaModal } from './AgendaModal'
import { PendingModal } from './PendingModal'
import { NovoProcessoModal } from './NovoProcessoModal'
import { ProcessoWizardModal } from './ProcessoWizardModal'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { PROCESSOS } from '../../mocks'
import { useRevisoes, revisoesPendentes } from '../../store/revisoes'

type Row = (typeof PROCESSOS)[number]

const CRIAR_OPCOES = [
  {
    key: 'novo' as const,
    titulo: 'Processo com preenchimento manual',
    desc: 'Cadastre o processo informando todos os dados e parâmetros do início ao fim.',
  },
  {
    key: 'registros' as const,
    titulo: 'Processo a partir de Registro de Necessidade',
    desc: 'Selecione um registro existente e utilize seus itens para compor o processo.',
  },
  {
    key: 'solicitacao' as const,
    titulo: 'Processo com Registro de Necessidade integrado com outros setores',
    desc: 'Selecione itens do catálogo, gere o registro de necessidade e crie o processo em sequência.',
  },
]

export function ProcessosInteligentesPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const navigate = useNavigate()
  const [modal, setModal] = useState<
    | 'none'
    | 'agenda'
    | 'revisoes'
    | 'aprovacoes'
    | 'assinaturas'
    | 'novo'
    | 'registros'
    | 'solicitacao'
  >('none')
  const [criarOpen, setCriarOpen] = useState(false)
  const criarRef = useRef<HTMLDivElement>(null)

  const revisoes = useRevisoes((s) => s.revisoes)
  const pendentes = revisoesPendentes(revisoes)

  useEffect(() => {
    if (!criarOpen) return
    const onDoc = (e: MouseEvent) => {
      if (criarRef.current && !criarRef.current.contains(e.target as Node)) setCriarOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [criarOpen])

  const columns: Column<Row>[] = [
    { key: 'id', header: 'ID', render: (r) => <Pill>{r.id}</Pill> },
    { key: 'numero', header: 'Número', render: (r) => <Pill muted>{r.numero}</Pill> },
    { key: 'tipo', header: 'Tipo' },
    { key: 'nome', header: 'Nome' },
    {
      key: 'proprietario',
      header: 'Proprietário',
      render: (r) => (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e0a92a] text-xs font-bold text-white">
          {r.proprietario}
        </span>
      ),
    },
    { key: 'integrantes', header: 'Integrantes', render: (r) => r.integrantes || '—' },
    { key: 'inclusao', header: 'Data de inclusão' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone="neutral">{r.status}</Badge>,
    },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/Processo/${r.id}`)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Search size={13} /> Detalhes
          </button>
          <button className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]">
            ⋮
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Processos Inteligentes"
        subtitle="Gerencie e acompanhe seus processos de forma inteligente"
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <HubBtn color="#1f56ad" icon={<BarChart3 size={15} />} onClick={() => navigate('/DashboardProcesso')}>
          Dashboard
        </HubBtn>
        <HubBtn color="#3a4353" icon={<CalendarDays size={15} />} onClick={() => setModal('agenda')}>
          Agenda
        </HubBtn>
        <HubBtn color="#d39a16" icon={<PenLine size={15} />} onClick={() => setModal('revisoes')}>
          Revisões
        </HubBtn>
        <HubBtn color="#198754" icon={<ClipboardCheck size={15} />} onClick={() => setModal('aprovacoes')}>
          Aprovações
        </HubBtn>
        <HubBtn color="#7c3aed" icon={<FileSignature size={15} />} onClick={() => setModal('assinaturas')}>
          Assinaturas
        </HubBtn>
        <div className="ml-auto rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-5 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Total de Processos
          </p>
          <p className="text-lg font-extrabold text-[#183263]">
            0 <span className="text-[var(--color-success)]">/ Ilimitado</span>
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/StatusArtefatos')}
        className="mb-4 w-full rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary-soft)]"
      >
        Status individual de cada artefato
      </button>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <div ref={criarRef} className="relative">
          <button
            onClick={() => setCriarOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Novo <ChevronDown size={14} />
          </button>
          {criarOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 w-[22rem] max-w-[80vw] rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 shadow-[var(--shadow-pop)]">
              <p className="px-2 pt-1 font-display text-sm font-bold text-[#183263]">Criar processo</p>
              <p className="px-2 pb-2 text-xs text-[var(--color-muted)]">
                Escolha a forma de criação para iniciar.
              </p>
              {CRIAR_OPCOES.map((op) => (
                <button
                  key={op.key}
                  onClick={() => {
                    setCriarOpen(false)
                    setModal(op.key)
                  }}
                  className="w-full rounded-[var(--radius-control)] px-2 py-2 text-left transition hover:bg-[var(--color-primary-soft)]"
                >
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{op.titulo}</p>
                  <p className="text-xs text-[var(--color-muted)]">{op.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <input placeholder="Buscar por Nome" className="gt-input min-w-40 flex-1" />
        <button className="grid h-10 w-10 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]">
          <Filter size={15} />
        </button>
      </div>

      <DataTable<Row>
        columns={columns}
        rows={PROCESSOS}
        rowKey={(r) => String(r.id)}
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {PROCESSOS.length}</span>
          </>
        }
      />

      <AgendaModal open={modal === 'agenda'} onClose={() => setModal('none')} />
      <PendingModal
        open={modal === 'revisoes'}
        onClose={() => setModal('none')}
        title="Revisões pendentes"
        icon={<PenLine size={20} />}
        items={pendentes.map((v) => ({
          id: v.id,
          titulo: v.artefato,
          processo: v.processoNome,
          status: v.status,
          quando: v.enviadoEm,
        }))}
        onOpen={(id) => {
          setModal('none')
          navigate(`/RevisaoProcesso/${id}`)
        }}
      />
      <PendingModal
        open={modal === 'aprovacoes'}
        onClose={() => setModal('none')}
        title="Aprovações pendentes"
        icon={<ClipboardCheck size={20} />}
      />
      <PendingModal
        open={modal === 'assinaturas'}
        onClose={() => setModal('none')}
        title="Assinaturas pendentes"
        icon={<FileSignature size={20} />}
      />
      <NovoProcessoModal open={modal === 'novo'} onClose={() => setModal('none')} />
      <ProcessoWizardModal
        open={modal === 'registros'}
        onClose={() => setModal('none')}
        title="Criar Processo a partir de Registros"
        subtitle="Defina os dados do processo e selecione, por item, de quais registros/setores você vai utilizar."
        tabs={['Processo', 'Itens', 'Quantidades']}
      />
      <ProcessoWizardModal
        open={modal === 'solicitacao'}
        onClose={() => setModal('none')}
        title="Criar Processo + Solicitar Registro de Necessidade"
        subtitle="Informe os dados do processo."
        tabs={['Processo', 'Solicitação + Itens']}
      />
    </div>
  )
}

function HubBtn({
  color,
  icon,
  children,
  onClick,
}: {
  color: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color }}
      className="inline-flex items-center gap-2 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
    >
      {icon}
      {children}
    </button>
  )
}

function Pill({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`grid h-7 min-w-7 place-items-center rounded-[8px] border px-2 text-xs font-semibold ${
        muted
          ? 'border-[var(--color-line)] bg-[#f1f4f9] text-[var(--color-muted)]'
          : 'border-[#bcd0ee] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
      }`}
    >
      {children}
    </span>
  )
}
