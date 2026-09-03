import { Plus, Search, Trash2, Workflow } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { WORKFLOWS } from '../../mocks'

type Row = (typeof WORKFLOWS)[number]

const cols: Column<Row>[] = [
  { key: 'nome', header: 'Fluxo' },
  { key: 'etapas', header: 'Etapas', align: 'center' },
  { key: 'artefatos', header: 'Artefatos do fluxo' },
  { key: 'atualizado', header: 'Atualizado em' },
  {
    key: 'ativo',
    header: 'Status',
    render: (r) => <Badge tone={r.ativo ? 'success' : 'neutral'}>{r.ativo ? 'Ativo' : 'Inativo'}</Badge>,
  },
  {
    key: 'acoes',
    header: 'Ações',
    align: 'right',
    render: () => (
      <div className="flex justify-end gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white">
          <Search size={13} /> Abrir
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]">
          <Trash2 size={14} />
        </button>
      </div>
    ),
  },
]

export function ProcessosWorkflowPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)

  return (
    <div>
      <PageHeader
        title="Fluxo de Trabalho"
        subtitle="Monte e reutilize sequências de artefatos e etapas para seus processos"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button>
          <Plus size={16} /> Novo Fluxo
        </Button>
        <input placeholder="Buscar fluxo" className="gt-input min-w-40 flex-1" />
      </div>

      <DataTable<Row>
        columns={cols}
        rows={WORKFLOWS}
        rowKey={(r) => r.id}
        empty={
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Workflow size={28} className="text-[var(--color-muted)]" />
            <p className="font-display text-base font-bold text-[#183263]">Nenhum fluxo cadastrado</p>
          </div>
        }
        footer={<span>Registros encontrados: {WORKFLOWS.length}</span>}
      />
    </div>
  )
}
