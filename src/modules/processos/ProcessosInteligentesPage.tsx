import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileSignature,
  Filter,
  MoreVertical,
  PenLine,
  Plus,
  Search,
  Trash2,
  X,
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
import { PROCESSO_LEGISLACOES, PROCESSO_TIPOS } from '../../mocks'
import { useRevisoes, revisoesPendentes } from '../../store/revisoes'
import { useProcessos, statusProcessoLabel, type ProcessoLocal } from '../../store/processos'
import { useWorkflows } from '../../store/workflows'
import { exigenciasDoProcesso } from './exigencias'
import type { PendingItem } from './PendingModal'

const STATUS_OPCOES = ['Ativo', 'Finalizado']

type Row = ProcessoLocal

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
  const [filtroOpen, setFiltroOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('Todos')
  const [legislacaoFiltro, setLegislacaoFiltro] = useState('Todas')
  const [ativoFiltro, setAtivoFiltro] = useState('Todos')
  const [excluirId, setExcluirId] = useState<string | null>(null)

  const processos = useProcessos((s) => s.processos)
  const remover = useProcessos((s) => s.remover)
  const revisoes = useRevisoes((s) => s.revisoes)
  const pendentes = revisoesPendentes(revisoes)
  const workflows = useWorkflows((s) => s.workflows)

  const { aprovacoesPendentes, assinaturasPendentes } = (() => {
    const aprov: PendingItem[] = []
    const assin: PendingItem[] = []
    for (const p of processos) {
      const exig = exigenciasDoProcesso(p, workflows)
      if (exig.size === 0) continue
      for (const a of p.artefatos) {
        if (!a.enviado) continue
        const e = exig.get(a.completo)
        if (!e) continue
        if (e.aprovacao && !a.aprovadoEm)
          aprov.push({
            id: `${p.id}::${a.completo}`,
            titulo: a.nome,
            processo: p.nome,
            status: 'Pendente',
            quando: a.prazo || undefined,
          })
        if (e.assinatura && !a.assinadoEm)
          assin.push({
            id: `${p.id}::${a.completo}`,
            titulo: a.nome,
            processo: p.nome,
            status: 'Pendente',
            quando: a.prazo || undefined,
          })
      }
    }
    return { aprovacoesPendentes: aprov, assinaturasPendentes: assin }
  })()

  const abrirProcessoDoItem = (id: string) => {
    setModal('none')
    navigate(`/Processo/${id.split('::')[0]}`)
  }

  const excluirAlvo = processos.find((p) => p.id === excluirId) ?? null

  const filtrosAtivos =
    busca !== '' || tipoFiltro !== 'Todos' || legislacaoFiltro !== 'Todas' || ativoFiltro !== 'Todos'

  const limparFiltros = () => {
    setBusca('')
    setTipoFiltro('Todos')
    setLegislacaoFiltro('Todas')
    setAtivoFiltro('Todos')
  }

  const linhas = processos.filter(
    (p) =>
      (busca === '' || p.nome.toLowerCase().includes(busca.toLowerCase())) &&
      (tipoFiltro === 'Todos' || p.tipo === tipoFiltro) &&
      (legislacaoFiltro === 'Todas' || p.legislacao === legislacaoFiltro) &&
      (ativoFiltro === 'Todos' || statusProcessoLabel(p.status) === ativoFiltro),
  )

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
      render: (r) => (
        <Badge tone={r.status === 'FINALIZADO' ? 'success' : 'info'}>
          {statusProcessoLabel(r.status)}
        </Badge>
      ),
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
          <RowMenu
            onDetalhes={() => navigate(`/Processo/${r.id}`)}
            onExcluir={() => setExcluirId(r.id)}
          />
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
            {processos.length} <span className="text-[var(--color-success)]">/ Ilimitado</span>
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
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por Nome"
          className="gt-input min-w-40 flex-1"
        />
        <button
          onClick={() => setFiltroOpen((o) => !o)}
          className={`grid h-10 w-10 place-items-center rounded-[var(--radius-control)] border transition ${
            filtroOpen || filtrosAtivos
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
              : 'border-[var(--color-line)] text-[var(--color-muted)]'
          }`}
        >
          <Filter size={15} />
        </button>
      </div>

      {filtroOpen && (
        <div className="mb-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--color-muted)]">
              Tipo de Processo
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="gt-input font-normal normal-case"
              >
                <option>Todos</option>
                {PROCESSO_TIPOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--color-muted)]">
              Legislação
              <select
                value={legislacaoFiltro}
                onChange={(e) => setLegislacaoFiltro(e.target.value)}
                className="gt-input font-normal normal-case"
              >
                <option>Todas</option>
                {PROCESSO_LEGISLACOES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--color-muted)]">
              Ativo
              <select
                value={ativoFiltro}
                onChange={(e) => setAtivoFiltro(e.target.value)}
                className="gt-input font-normal normal-case"
              >
                <option>Todos</option>
                {STATUS_OPCOES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={limparFiltros}
              disabled={!filtrosAtivos}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={13} /> Limpar
            </button>
          </div>
        </div>
      )}

      <DataTable<Row>
        columns={columns}
        rows={linhas}
        rowKey={(r) => r.id}
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {linhas.length}</span>
          </>
        }
      />

      {excluirAlvo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExcluirId(null)
          }}
        >
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
              <Trash2 size={24} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Excluir processo?</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O processo <strong>{excluirAlvo.nome}</strong> e seus artefatos serão removidos. Esta
              ação não pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => setExcluirId(null)}
                className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  remover(excluirAlvo.id)
                  setExcluirId(null)
                }}
                className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

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
        items={aprovacoesPendentes}
        onOpen={abrirProcessoDoItem}
      />
      <PendingModal
        open={modal === 'assinaturas'}
        onClose={() => setModal('none')}
        title="Assinaturas pendentes"
        icon={<FileSignature size={20} />}
        items={assinaturasPendentes}
        onOpen={abrirProcessoDoItem}
      />
      <NovoProcessoModal open={modal === 'novo'} onClose={() => setModal('none')} />
      <ProcessoWizardModal
        open={modal === 'registros'}
        onClose={() => setModal('none')}
        modo="registros"
        title="Criar Processo a partir de Registros"
        subtitle="Defina os dados do processo e selecione de quais registros de necessidade você vai utilizar."
        tabs={['Processo', 'Itens', 'Quantidades']}
      />
      <ProcessoWizardModal
        open={modal === 'solicitacao'}
        onClose={() => setModal('none')}
        modo="solicitacao"
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

function RowMenu({ onDetalhes, onExcluir }: { onDetalhes: () => void; onExcluir: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Mais ações"
        className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white py-1 text-left shadow-[var(--shadow-pop)]">
          <button
            onClick={() => {
              setOpen(false)
              onDetalhes()
            }}
            className="block w-full px-3 py-2 text-left text-sm text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)]"
          >
            Detalhes
          </button>
          <button
            onClick={() => {
              setOpen(false)
              onExcluir()
            }}
            className="block w-full px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[#fbe4e7]"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
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
