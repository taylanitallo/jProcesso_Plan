import { Download, Plus, Upload, X } from 'lucide-react'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'

type ItemLote = {
  codigo: string
  sequencia: string
  nome: string
  unidade: string
  qtd: number
  unitario: number
  total: number
}

const cols: Column<ItemLote>[] = [
  { key: 'codigo', header: 'Código' },
  { key: 'sequencia', header: 'Sequência' },
  { key: 'nome', header: 'Nome' },
  { key: 'unidade', header: 'Unidade', align: 'center' },
  { key: 'qtd', header: 'Qtd.', align: 'center' },
  { key: 'unitario', header: 'Unitário (R$)', align: 'right' },
  { key: 'total', header: 'Total (R$)', align: 'right' },
  { key: 'acoes', header: 'Ações', align: 'right' },
]

export function CadastroItensModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-5xl rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 pr-8">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#d7f5ea] text-[var(--color-success)]">
              <Plus size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-extrabold text-[#183263] sm:text-xl">
                Cadastro de Itens
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                Cadastre, importe ou atualize os itens e lotes associados ao processo atual.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f1f4f9] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              <Download size={14} /> Exportar Excel
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white">
              <Plus size={14} /> Novo Item
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white">
              <Upload size={14} /> Importar Itens
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-display text-sm font-bold text-[#183263]">Itens cadastrados</h4>
            <p className="text-xs text-[var(--color-muted)]">
              Gerencie os itens existentes. Utilize os botões de ação para editá-los ou removê-los.
            </p>
          </div>
          <div className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-5 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Total do Lote
            </p>
            <p className="text-lg font-extrabold text-[#183263]">R$ 0,00</p>
          </div>
        </div>

        <DataTable<ItemLote>
          columns={cols}
          rows={[]}
          rowKey={(r) => r.codigo}
          empty={
            <EmptyState
              title="Nenhum item registrado"
              subtitle="Inclua um item manualmente ou importe uma planilha para começar."
            />
          }
        />
      </div>
    </div>
  )
}
