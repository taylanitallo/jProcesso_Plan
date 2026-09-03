import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, MoreVertical } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { RELATORIO_CONSULTAS } from '../../mocks'

const TABS = ['Consultas', 'Artefatos', 'Researchs', 'Processos']

type Consulta = (typeof RELATORIO_CONSULTAS)[number]

const cols: Column<Consulta>[] = [
  { key: 'legislacao', header: 'Legislação' },
  { key: 'formato', header: 'Formato' },
  { key: 'pergunta', header: 'Pergunta', render: (r) => <span className="line-clamp-3 max-w-md">{r.pergunta}</span> },
  { key: 'usuario', header: 'Usuário' },
  { key: 'data', header: 'Data' },
]

export function RelatorioUsoPage() {
  const [tab, setTab] = useState(TABS[0])
  const rows = tab === 'Consultas' ? RELATORIO_CONSULTAS : []

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Relatório de Uso" center />

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
        <DataTable<Consulta>
          columns={cols}
          rows={rows}
          rowKey={(r) => r.pergunta.slice(0, 20)}
          empty={<EmptyState title="Nenhum registro no período" />}
          footer={<span>Registros encontrados: {rows.length}</span>}
        />
      </div>
    </div>
  )
}
