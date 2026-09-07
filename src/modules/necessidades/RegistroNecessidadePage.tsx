import { useState } from 'react'
import { ClipboardX, FilePenLine, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { useNecessidades, type Registro } from '../../store/necessidades'
import { NovoRegistroModal } from './NovoRegistroModal'
import { ImportarPcaModal } from './ImportarPcaModal'
import { ImportarExcelRegistroModal } from './ImportarExcelRegistroModal'

const TABS = ['Meus Registros', 'Solicitações de Preenchimento'] as const

export function RegistroNecessidadePage() {
  useModuleLinks([
    { key: 'nec', label: 'Registro de Necessidades', to: '/RegistroNecessidade', icon: 'clipboard' },
    { key: 'base', label: 'Base', to: '/CatalogoItens', icon: 'database' },
  ])

  const registros = useNecessidades((s) => s.registros)
  const remover = useNecessidades((s) => s.remover)

  const [tab, setTab] = useState<(typeof TABS)[number]>('Meus Registros')
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<'none' | 'novo' | 'pca' | 'excel'>('none')
  const [confirmarId, setConfirmarId] = useState<string | null>(null)

  const filtrados = registros.filter(
    (r) =>
      r.nome.toLowerCase().includes(busca.toLowerCase()) ||
      r.descricao.toLowerCase().includes(busca.toLowerCase()),
  )
  const itemConfirmar = registros.find((r) => r.id === confirmarId) ?? null

  const columns: Column<Registro>[] = [
    {
      key: 'nome',
      header: 'Nome',
      render: (r) => (
        <div className="max-w-[460px]">
          <p className="font-bold text-[var(--color-ink)]">{r.nome}</p>
          {r.descricao && (
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{r.descricao}</p>
          )}
        </div>
      ),
    },
    { key: 'setor', header: 'Setor', align: 'center' },
    { key: 'itens', header: 'Itens utilizados', align: 'center' },
    {
      key: 'ativo',
      header: 'Ativo',
      align: 'center',
      render: (r) => <Badge tone={r.ativo ? 'success' : 'neutral'}>{r.ativo ? 'Sim' : 'Não'}</Badge>,
    },
    { key: 'inclusao', header: 'Inclusão', align: 'center' },
    { key: 'dataDesejada', header: 'Data desejada', align: 'center', render: (r) => r.dataDesejada || '—' },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            aria-label="Editar registro"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <FilePenLine size={14} />
          </button>
          <button
            onClick={() => setConfirmarId(r.id)}
            aria-label="Excluir registro"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

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

      {tab === 'Meus Registros' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
            <Button onClick={() => setModal('novo')}>
              <Plus size={16} /> Novo Registro
            </Button>
            <Button variant="success" onClick={() => setModal('pca')}>
              <Plus size={16} /> Importar PCA/PNCP
            </Button>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por Nome / Descrição"
              className="gt-input min-w-40 flex-1"
            />
            <button
              onClick={() => setModal('excel')}
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#8b5cf6_0%,#7c3aed_100%)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} /> Importar Excel
            </button>
          </div>

          <DataTable<Registro>
            columns={columns}
            rows={filtrados}
            rowKey={(r) => r.id}
            empty={
              <EmptyState
                icon={ClipboardX}
                title="Nenhum registro encontrado"
                subtitle="Tente ajustar o filtro."
              />
            }
            footer={
              <>
                <Pagination />
                <span>Registros encontrados: {filtrados.length}</span>
              </>
            }
          />
        </>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Setor:
            </span>
            <select className="gt-input w-48 font-normal normal-case">
              <option>Selecione um setor…</option>
            </select>
            <input
              placeholder="Buscar por Nome do Registro / ID Processo"
              className="gt-input min-w-40 flex-1"
            />
          </div>
          <EmptyState
            icon={ClipboardX}
            title="Nenhum processo pendente encontrado"
            subtitle="Tente ajustar o filtro."
          />
        </div>
      )}

      {modal === 'novo' && <NovoRegistroModal onClose={() => setModal('none')} />}
      {modal === 'pca' && <ImportarPcaModal onClose={() => setModal('none')} />}
      {modal === 'excel' && <ImportarExcelRegistroModal onClose={() => setModal('none')} />}

      {itemConfirmar && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmarId(null)
          }}
        >
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
              <Trash2 size={24} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Excluir registro?</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O registro <strong>{itemConfirmar.nome}</strong> será removido. Esta ação não pode ser
              desfeita.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => setConfirmarId(null)}
                className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  remover(itemConfirmar.id)
                  setConfirmarId(null)
                }}
                className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
