import { useState } from 'react'
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
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { PROCESSOS } from '../../mocks'

type Row = (typeof PROCESSOS)[number]

export function ProcessosInteligentesPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const navigate = useNavigate()
  const [modal, setModal] = useState<
    'none' | 'agenda' | 'revisoes' | 'aprovacoes' | 'assinaturas' | 'novo'
  >('none')

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
      render: () => (
        <div className="flex justify-end gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white">
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
        <button
          onClick={() => setModal('novo')}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Novo <ChevronDown size={14} />
        </button>
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
