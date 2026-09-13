import { useState } from 'react'
import { FileSignature, Plus, Trash2, X } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useOrganizacao } from '../../store/organizacao'

const PER_PAGE = 7

export function TipoEnvolvidoAssinaturaPage() {
  const categorias = useOrganizacao((s) => s.categorias)
  const addCategoria = useOrganizacao((s) => s.addCategoria)
  const removeCategoria = useOrganizacao((s) => s.removeCategoria)

  const [page, setPage] = useState(1)
  const [novaOpen, setNovaOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [excluirNome, setExcluirNome] = useState<string | null>(null)

  const pages = Math.max(1, Math.ceil(categorias.length / PER_PAGE))
  const paginaAtual = Math.min(page, pages)
  const rows = categorias
    .slice((paginaAtual - 1) * PER_PAGE, paginaAtual * PER_PAGE)
    .map((n) => ({ nome: n }))

  const cols: Column<{ nome: string }>[] = [
    { key: 'nome', header: 'Categoria de Assinante' },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setExcluirNome(r.nome)}
            aria-label="Excluir categoria"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const salvar = () => {
    if (!nome.trim()) return
    addCategoria(nome.trim())
    setNome('')
    setNovaOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Categorias de Assinantes"
        subtitle="Gerencie as categorias que identificam a função de cada assinante envolvido ao artefato."
        icon={FileSignature}
        accent="pink"
      />

      <div className="mb-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button onClick={() => setNovaOpen(true)}>
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
                disabled={paginaAtual === 1}
              >
                «
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`grid h-8 min-w-8 place-items-center rounded-[10px] border px-2 text-xs font-semibold ${
                    paginaAtual === i + 1
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
                disabled={paginaAtual === pages}
              >
                »
              </button>
            </div>
            <span>Registros encontrados: {categorias.length}</span>
          </>
        }
      />

      {novaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNovaOpen(false)
          }}
        >
          <div className="relative my-10 w-full max-w-lg rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
            <button
              onClick={() => setNovaOpen(false)}
              aria-label="Fechar"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
            >
              <X size={16} />
            </button>
            <h3 className="font-display text-base font-bold text-[#183263]">Novo Tipo de Envolvido</h3>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Complete os campos abaixo para cadastrar uma nova Categoria.
            </p>
            <label className="mt-4 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Nome da Categoria
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && salvar()}
                placeholder="Digite o nome da categoria"
                className="gt-input font-normal normal-case"
              />
            </label>
            <button
              onClick={salvar}
              disabled={!nome.trim()}
              className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(excluirNome)}
        title="Excluir categoria?"
        message={
          <>
            A categoria <strong>{excluirNome}</strong> será removida. Esta ação não pode ser
            desfeita.
          </>
        }
        onCancel={() => setExcluirNome(null)}
        onConfirm={() => {
          if (excluirNome) removeCategoria(excluirNome)
          setExcluirNome(null)
        }}
      />
    </div>
  )
}
