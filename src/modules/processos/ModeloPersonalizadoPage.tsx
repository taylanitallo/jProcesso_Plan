import { Copy, FilePenLine, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { MODELOS_PERSONALIZADOS } from '../../mocks'

type Row = (typeof MODELOS_PERSONALIZADOS)[number]

const cols: Column<Row>[] = [
  { key: 'nome', header: 'Modelo' },
  { key: 'tipo', header: 'Tipo de artefato' },
  { key: 'base', header: 'Legislação' },
  { key: 'atualizado', header: 'Atualizado em' },
  {
    key: 'acoes',
    header: 'Ações',
    align: 'right',
    render: () => (
      <div className="flex justify-end gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white">
          <FilePenLine size={13} /> Editar
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]">
          <Copy size={14} />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]">
          <Trash2 size={14} />
        </button>
      </div>
    ),
  },
]

export function ModeloPersonalizadoPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)

  return (
    <div>
      <PageHeader
        title="Modelos Personalizados"
        subtitle="Crie modelos próprios de artefatos para a geração automática"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button>
          <Plus size={16} /> Novo Modelo
        </Button>
        <input placeholder="Buscar modelo" className="gt-input min-w-40 flex-1" />
      </div>

      <DataTable<Row>
        columns={cols}
        rows={MODELOS_PERSONALIZADOS}
        rowKey={(r) => r.id}
        footer={<span>Registros encontrados: {MODELOS_PERSONALIZADOS.length}</span>}
      />
    </div>
  )
}
