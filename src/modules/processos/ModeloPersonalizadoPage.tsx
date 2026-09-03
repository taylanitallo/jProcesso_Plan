import { Download, FilePenLine, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { MODELOS_PERSONALIZADOS } from '../../mocks'

type Row = (typeof MODELOS_PERSONALIZADOS)[number]

function Autor({ sigla, data }: { sigla: string; data: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e0a92a] text-xs font-bold text-white">
        {sigla}
      </span>
      <span className="text-xs text-[var(--color-muted)]">{data}</span>
    </div>
  )
}

const cols: Column<Row>[] = [
  {
    key: 'nome',
    header: 'Modelo',
    render: (r) => (
      <div>
        <p className="font-semibold text-[var(--color-ink)]">{r.nome}</p>
        <p className="text-xs text-[var(--color-muted)]">Identificador: {r.identificador}</p>
      </div>
    ),
  },
  {
    key: 'inclusao',
    header: 'Data de inclusão',
    render: (r) => <Autor sigla={r.inclusaoPor} data={r.inclusao} />,
  },
  {
    key: 'ultimaEdicao',
    header: 'Última edição',
    render: (r) => <Autor sigla={r.ultimaEdicaoPor} data={r.ultimaEdicao} />,
  },
  {
    key: 'acoes',
    header: 'Ações',
    align: 'right',
    render: () => (
      <div className="flex justify-end gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)]">
          <Download size={13} /> Download
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white">
          <FilePenLine size={13} /> Editar
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[#f0c2c8] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)]">
          <Trash2 size={13} /> Excluir
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
        subtitle="Crie, gerencie e atualize modelos alinhados aos requisitos do processo."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button>
          <Plus size={16} /> Novo modelo
        </Button>
        <input placeholder="Buscar por nome" className="gt-input min-w-40 flex-1" />
      </div>

      <DataTable<Row>
        columns={cols}
        rows={MODELOS_PERSONALIZADOS}
        rowKey={(r) => r.id}
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {MODELOS_PERSONALIZADOS.length}</span>
          </>
        }
      />
    </div>
  )
}
