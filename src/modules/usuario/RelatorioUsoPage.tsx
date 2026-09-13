import { useState } from 'react'
import { BarChart3, ChevronLeft, ChevronRight, Filter, MoreVertical } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/common/Badge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { RELATORIO_CONSULTAS } from '../../mocks'
import { useProcessos, statusProcessoLabel } from '../../store/processos'
import { useAnalises } from '../../store/analises'

const TABS = ['Consultas', 'Artefatos', 'Researchs', 'Processos'] as const
type Tab = (typeof TABS)[number]

type Consulta = (typeof RELATORIO_CONSULTAS)[number]

const consultaCols: Column<Consulta>[] = [
  { key: 'legislacao', header: 'Legislação' },
  { key: 'formato', header: 'Formato' },
  {
    key: 'pergunta',
    header: 'Pergunta',
    render: (r) => <span className="line-clamp-3 max-w-md">{r.pergunta}</span>,
  },
  { key: 'usuario', header: 'Usuário' },
  { key: 'data', header: 'Data' },
]

type LinhaProcesso = {
  id: string
  numero: string
  nome: string
  tipo: string
  legislacao: string
  status: string
  inclusao: string
}

const processoCols: Column<LinhaProcesso>[] = [
  { key: 'numero', header: 'Número', align: 'center' },
  {
    key: 'nome',
    header: 'Nome',
    render: (r) => <span className="font-semibold text-[var(--color-primary-strong)]">{r.nome}</span>,
  },
  { key: 'tipo', header: 'Tipo' },
  { key: 'legislacao', header: 'Legislação', align: 'center' },
  { key: 'status', header: 'Status', align: 'center', render: (r) => <Badge tone="info">{r.status}</Badge> },
  { key: 'inclusao', header: 'Inclusão', align: 'center' },
]

type LinhaArtefato = {
  id: string
  processo: string
  artefato: string
  responsavel: string
  estado: string
}

const artefatoCols: Column<LinhaArtefato>[] = [
  {
    key: 'processo',
    header: 'Processo',
    render: (r) => (
      <span className="font-semibold text-[var(--color-primary-strong)]">{r.processo}</span>
    ),
  },
  { key: 'artefato', header: 'Artefato' },
  { key: 'responsavel', header: 'Responsável', align: 'center' },
  {
    key: 'estado',
    header: 'Situação',
    align: 'center',
    render: (r) => (
      <Badge tone={r.estado === 'Enviado' ? 'info' : 'success'}>{r.estado}</Badge>
    ),
  },
]

type LinhaResearch = {
  id: string
  titulo: string
  resumo: string
  criadoEm: string
}

const researchCols: Column<LinhaResearch>[] = [
  {
    key: 'titulo',
    header: 'Título',
    render: (r) => <span className="font-semibold text-[var(--color-primary-strong)]">{r.titulo}</span>,
  },
  { key: 'resumo', header: 'Resumo', render: (r) => <span className="line-clamp-3 max-w-md">{r.resumo}</span> },
  { key: 'criadoEm', header: 'Data', align: 'center' },
]

export function RelatorioUsoPage() {
  const [tab, setTab] = useState<Tab>('Consultas')
  const processos = useProcessos((s) => s.processos)
  const analises = useAnalises((s) => s.analises)

  const linhasProcesso: LinhaProcesso[] = processos.map((p) => ({
    id: p.id,
    numero: p.numero,
    nome: p.nome,
    tipo: p.tipo,
    legislacao: p.legislacao,
    status: statusProcessoLabel(p.status),
    inclusao: p.inclusao,
  }))

  const linhasArtefato: LinhaArtefato[] = processos.flatMap((p) =>
    p.artefatos
      .filter((a) => a.enviado)
      .map((a) => ({
        id: `${p.id}-${a.completo}`,
        processo: p.nome,
        artefato: a.nome,
        responsavel: a.responsavel || 'Não definido',
        estado: a.assinadoEm ? 'Assinado' : a.aprovadoEm ? 'Aprovado' : 'Enviado',
      })),
  )

  const linhasResearch: LinhaResearch[] = analises
    .filter((a) => a.kind === 'research')
    .map((a) => ({ id: a.id, titulo: a.titulo, resumo: a.resumo, criadoEm: a.criadoEm }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Relatório de Uso" icon={BarChart3} accent="amber" center />

      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-1 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[var(--radius-pill)] px-4 py-2 text-xs font-semibold transition ${
                tab === t
                  ? 'bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] text-white'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#183263]">
          <Filter size={15} /> Filtrar por Período
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
            Data Inicial
            <div className="flex items-center gap-1">
              <button className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--color-line)] text-[var(--color-muted)]">
                <ChevronLeft size={15} />
              </button>
              <input type="date" className="gt-input" defaultValue="2026-08-27" />
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
            Data Final
            <div className="flex items-center gap-1">
              <input type="date" className="gt-input" defaultValue="2026-09-03" />
              <button className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--color-line)] text-[var(--color-muted)]">
                <ChevronRight size={15} />
              </button>
            </div>
          </label>
          <button className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-5 py-2.5 text-sm font-semibold text-white">
            <Filter size={15} /> Filtrar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#183263]">{tab}</h3>
          <button className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]">
            <MoreVertical size={15} />
          </button>
        </div>

        {tab === 'Consultas' && (
          <DataTable<Consulta>
            columns={consultaCols}
            rows={RELATORIO_CONSULTAS}
            rowKey={(r) => r.pergunta.slice(0, 24)}
            empty={<EmptyState title="Nenhuma consulta no período" />}
            footer={<span>Registros encontrados: {RELATORIO_CONSULTAS.length}</span>}
          />
        )}

        {tab === 'Processos' && (
          <DataTable<LinhaProcesso>
            columns={processoCols}
            rows={linhasProcesso}
            rowKey={(r) => r.id}
            empty={<EmptyState title="Nenhum processo cadastrado" />}
            footer={<span>Registros encontrados: {linhasProcesso.length}</span>}
          />
        )}

        {tab === 'Artefatos' && (
          <DataTable<LinhaArtefato>
            columns={artefatoCols}
            rows={linhasArtefato}
            rowKey={(r) => r.id}
            empty={<EmptyState title="Nenhum artefato enviado" />}
            footer={<span>Registros encontrados: {linhasArtefato.length}</span>}
          />
        )}

        {tab === 'Researchs' && (
          <DataTable<LinhaResearch>
            columns={researchCols}
            rows={linhasResearch}
            rowKey={(r) => r.id}
            empty={<EmptyState title="Nenhum research no período" />}
            footer={<span>Registros encontrados: {linhasResearch.length}</span>}
          />
        )}
      </div>
    </div>
  )
}
