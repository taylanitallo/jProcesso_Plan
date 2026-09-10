import { useState } from 'react'
import { ClipboardX, FilePenLine, MessageSquareReply, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { useNecessidades, type Registro } from '../../store/necessidades'
import { useOrganizacao } from '../../store/organizacao'
import {
  useSolicitacoes,
  statusSolicitacaoLabel,
  type Solicitacao,
} from '../../store/solicitacoes'
import { NovoRegistroModal } from './NovoRegistroModal'
import { ImportarPcaModal } from './ImportarPcaModal'
import { ImportarExcelRegistroModal } from './ImportarExcelRegistroModal'
import { ResponderSolicitacaoModal } from './ResponderSolicitacaoModal'

const TABS = ['Meus Registros', 'Solicitações de Preenchimento'] as const

export function RegistroNecessidadePage() {
  useModuleLinks([
    { key: 'nec', label: 'Registro de Necessidades', to: '/RegistroNecessidade', icon: 'clipboard' },
    { key: 'base', label: 'Base', to: '/CatalogoItens', icon: 'database' },
  ])

  const registros = useNecessidades((s) => s.registros)
  const remover = useNecessidades((s) => s.remover)
  const solicitacoes = useSolicitacoes((s) => s.solicitacoes)
  const setores = useOrganizacao((s) => s.setores)

  const [tab, setTab] = useState<(typeof TABS)[number]>('Meus Registros')
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<'none' | 'novo' | 'pca' | 'excel'>('none')
  const [confirmarId, setConfirmarId] = useState<string | null>(null)
  const [solSetor, setSolSetor] = useState('')
  const [solBusca, setSolBusca] = useState('')
  const [responderId, setResponderId] = useState<string | null>(null)

  const filtrados = registros.filter(
    (r) =>
      r.nome.toLowerCase().includes(busca.toLowerCase()) ||
      r.descricao.toLowerCase().includes(busca.toLowerCase()),
  )
  const itemConfirmar = registros.find((r) => r.id === confirmarId) ?? null

  const solFiltradas = solicitacoes.filter((s) => {
    const q = solBusca.toLowerCase()
    return (
      (solSetor === '' || s.setor === solSetor) &&
      (q === '' ||
        s.processoNome.toLowerCase().includes(q) ||
        s.processoNumero.toLowerCase().includes(q))
    )
  })
  const responderAlvo = solicitacoes.find((s) => s.id === responderId) ?? null

  const solColumns: Column<Solicitacao>[] = [
    {
      key: 'processo',
      header: 'Processo',
      render: (s) => (
        <div>
          <p className="font-bold text-[var(--color-ink)]">{s.processoNome}</p>
          <p className="text-xs text-[var(--color-muted)]">Nº {s.processoNumero}</p>
        </div>
      ),
    },
    { key: 'setor', header: 'Setor', align: 'center' },
    {
      key: 'descricao',
      header: 'Orientação',
      render: (s) => (
        <span className="line-clamp-2 max-w-[360px] text-xs text-[var(--color-muted)]">
          {s.descricao || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (s) => (
        <Badge tone={s.status === 'RESPONDIDA' ? 'success' : 'warning'}>
          {statusSolicitacaoLabel(s.status)}
        </Badge>
      ),
    },
    { key: 'criadoEm', header: 'Aberta em', align: 'center' },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end">
          <button
            onClick={() => setResponderId(s.id)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <MessageSquareReply size={13} />
            {s.status === 'RESPONDIDA' ? 'Ver resposta' : 'Responder'}
          </button>
        </div>
      ),
    },
  ]

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
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Setor:
            </span>
            <select
              value={solSetor}
              onChange={(e) => setSolSetor(e.target.value)}
              className="gt-input w-48 font-normal normal-case"
            >
              <option value="">Todos os setores</option>
              {setores.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
            <input
              value={solBusca}
              onChange={(e) => setSolBusca(e.target.value)}
              placeholder="Buscar por Nome / Nº do Processo"
              className="gt-input min-w-40 flex-1"
            />
          </div>

          <DataTable<Solicitacao>
            columns={solColumns}
            rows={solFiltradas}
            rowKey={(s) => s.id}
            empty={
              <EmptyState
                icon={ClipboardX}
                title="Nenhuma solicitação encontrada"
                subtitle="Solicitações são geradas ao criar um processo com solicitação integrada."
              />
            }
            footer={
              <>
                <Pagination />
                <span>Registros encontrados: {solFiltradas.length}</span>
              </>
            }
          />
        </>
      )}

      {modal === 'novo' && <NovoRegistroModal onClose={() => setModal('none')} />}
      {modal === 'pca' && <ImportarPcaModal onClose={() => setModal('none')} />}
      {modal === 'excel' && <ImportarExcelRegistroModal onClose={() => setModal('none')} />}

      <ResponderSolicitacaoModal
        solicitacao={responderAlvo}
        onClose={() => setResponderId(null)}
      />

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
