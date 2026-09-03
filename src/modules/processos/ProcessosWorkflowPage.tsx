import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { NovoFluxoModal } from './NovoFluxoModal'
import { WORKFLOWS } from '../../mocks'

type Row = (typeof WORKFLOWS)[number]

export function ProcessosWorkflowPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const cols: Column<Row>[] = [
    {
      key: 'nome',
      header: 'Nome do Fluxo',
      render: (r) => <span className="font-semibold text-[var(--color-primary-strong)]">{r.nome}</span>,
    },
    { key: 'tipo', header: 'Tipo de Processo', align: 'center' },
    { key: 'legislacao', header: 'Legislação', align: 'center' },
    {
      key: 'ativo',
      header: 'Status',
      align: 'center',
      render: (r) => (
        <Badge tone={r.ativo ? 'success' : 'neutral'}>{r.ativo ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    { key: 'inclusao', header: 'Data de inclusão', align: 'center' },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/Workflow/${r.id}`)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Search size={13} /> Detalhes
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[#f0c2c8] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)]">
            <Trash2 size={13} /> Inativar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Fluxos de Processos"
        subtitle="Configure fluxos automáticos para seus processos inteligentes"
      />

      <div className="mb-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> Novo Fluxo
        </Button>
      </div>

      <DataTable<Row>
        columns={cols}
        rows={WORKFLOWS}
        rowKey={(r) => r.id}
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {WORKFLOWS.length}</span>
          </>
        }
      />

      <NovoFluxoModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
