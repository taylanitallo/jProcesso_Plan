import { useState } from 'react'
import { Plus, ClipboardX } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'

const columns: Column<never>[] = [
  { key: 'nome', header: 'Nome' },
  { key: 'setor', header: 'Setor' },
  { key: 'itens', header: 'Itens utilizados' },
  { key: 'ativo', header: 'Ativo' },
  { key: 'inclusao', header: 'Inclusão' },
  { key: 'desejada', header: 'Data desejada' },
  { key: 'acoes', header: 'Ações', align: 'right' },
]

const TABS = ['Meus Registros', 'Solicitações de Preenchimento']

export function RegistroNecessidadePage() {
  useModuleLinks([
    { key: 'nec', label: 'Registro de Necessidades', to: '/RegistroNecessidade', icon: 'clipboard' },
    { key: 'base', label: 'Base', to: '/CatalogoItens', icon: 'database' },
  ])
  const [tab, setTab] = useState(TABS[0])

  return (
    <div>
      <PageHeader
        title="Registros de Necessidade"
        subtitle="Visualize registros e itens cadastrados"
        actions={
          <div className="flex rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-[var(--radius-pill)] px-4 py-1.5 text-xs font-semibold transition ${
                  tab === t
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button>
          <Plus size={16} /> Novo Registro
        </Button>
        <Button variant="success">
          <Plus size={16} /> Importar PCA/PNCP
        </Button>
        <input placeholder="Buscar por Nome / Descrição" className="gt-input min-w-40 flex-1" />
        <button className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#8b5cf6_0%,#7c3aed_100%)] px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} /> Importar Excel
        </button>
      </div>

      <DataTable<never>
        columns={columns}
        rows={[]}
        rowKey={() => ''}
        empty={
          <EmptyState icon={ClipboardX} title="Nenhum registro encontrado" subtitle="Tente ajustar o filtro." />
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
