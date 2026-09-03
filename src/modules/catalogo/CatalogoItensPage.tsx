import { Plus, PackageSearch } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'

const columns: Column<never>[] = [
  { key: 'codigo', header: 'Código' },
  { key: 'referencia', header: 'Referência' },
  { key: 'nome', header: 'Nome item' },
  { key: 'tipo', header: 'Tipo de item' },
  { key: 'origem', header: 'Origem do item' },
  { key: 'acoes', header: 'Ações', align: 'right' },
]

export function CatalogoItensPage() {
  useModuleLinks([{ key: 'base', label: 'Catálogo', to: '/CatalogoItens', icon: 'database' }])

  return (
    <div>
      <PageHeader title="Catálogo de Itens" subtitle="Configure os itens cadastrados para seus processos!" />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button>
          <Plus size={16} /> Novo Item
        </Button>
        <Button variant="success">
          <Plus size={16} /> Importar CatMat/CatSer
        </Button>
        <input placeholder="Buscar" className="gt-input min-w-40 flex-1" />
        <button className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#8b5cf6_0%,#7c3aed_100%)] px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} /> Importar Excel
        </button>
      </div>

      <DataTable<never>
        columns={columns}
        rows={[]}
        rowKey={() => ''}
        empty={
          <EmptyState
            icon={PackageSearch}
            title="Nenhum item encontrado"
            subtitle="Crie ou importe seu primeiro item voltado aos processos inteligentes!"
          />
        }
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: 0</span>
          </>
        }
      />
    </div>
  )
}
