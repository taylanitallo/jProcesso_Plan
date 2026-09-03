import { useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { DataTable, type Column } from '../../components/common/DataTable'
import { CATEGORIAS_ASSINANTES } from '../../mocks'

const PER_PAGE = 7

const cols: Column<{ nome: string }>[] = [
  { key: 'nome', header: 'Categoria de Assinante' },
  {
    key: 'acoes',
    header: 'Ações',
    align: 'right',
    render: () => (
      <div className="flex justify-end gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white">
          <Search size={13} /> Detalhes
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]">
          <Trash2 size={14} />
        </button>
      </div>
    ),
  },
]

export function TipoEnvolvidoAssinaturaPage() {
  const [page, setPage] = useState(1)
  const pages = Math.ceil(CATEGORIAS_ASSINANTES.length / PER_PAGE)
  const rows = CATEGORIAS_ASSINANTES.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((nome) => ({
    nome,
  }))

  return (
    <div>
      <PageHeader
        title="Categorias de Assinantes"
        subtitle="Gerencie as categorias que identificam a função de cada assinante envolvido ao artefato."
      />

      <div className="mb-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button>
          <Plus size={16} /> Nova Categoria
        </Button>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.nome}
        footer={
          <>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid h-8 min-w-8 place-items-center rounded-[10px] border border-[var(--color-line)] bg-white px-2 text-xs text-[var(--color-muted)] disabled:opacity-40"
                disabled={page === 1}
              >
                «
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`grid h-8 min-w-8 place-items-center rounded-[10px] border px-2 text-xs font-semibold ${
                    page === i + 1
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-line)] bg-white text-[var(--color-muted)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="grid h-8 min-w-8 place-items-center rounded-[10px] border border-[var(--color-line)] bg-white px-2 text-xs text-[var(--color-muted)] disabled:opacity-40"
                disabled={page === pages}
              >
                »
              </button>
            </div>
            <span>Registros encontrados: {CATEGORIAS_ASSINANTES.length}</span>
          </>
        }
      />
    </div>
  )
}
