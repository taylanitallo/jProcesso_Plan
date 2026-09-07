import { useState } from 'react'
import { CalendarRange, FilePenLine, Plus, Send, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { usePca, type PcaLocal } from '../../store/pca'
import { PCA_MODULE_LINKS } from './pcaLinks'
import { NovoPcaModal } from './NovoPcaModal'
import { PcaItensModal } from './PcaItensModal'
import { TransmitirPncpModal } from './TransmitirPncpModal'

const fmtBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function CriarPcaPage() {
  useModuleLinks(PCA_MODULE_LINKS)

  const pcas = usePca((s) => s.pcas)
  const remover = usePca((s) => s.remover)
  const definirStatus = usePca((s) => s.definirStatus)

  const [busca, setBusca] = useState('')
  const [novoOpen, setNovoOpen] = useState(false)
  const [itensAbertoId, setItensAbertoId] = useState<string | null>(null)
  const [confirmarId, setConfirmarId] = useState<string | null>(null)
  const [transmitirOpen, setTransmitirOpen] = useState(false)

  const filtrados = pcas.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.nomeOrgao.toLowerCase().includes(busca.toLowerCase()),
  )
  const itemConfirmar = pcas.find((p) => p.id === confirmarId) ?? null

  const columns: Column<PcaLocal>[] = [
    {
      key: 'nome',
      header: 'Nome',
      render: (r) => (
        <div className="max-w-[380px]">
          <p className="font-bold text-[var(--color-ink)]">{r.nome}</p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{r.nomeOrgao}</p>
        </div>
      ),
    },
    { key: 'unidadeNome', header: 'Unidade Orçamentária' },
    { key: 'anoPca', header: 'Ano', align: 'center' },
    { key: 'itens', header: 'Itens', align: 'center', render: (r) => r.itens.length },
    {
      key: 'valorTotal',
      header: 'Valor Total',
      align: 'right',
      render: (r) => fmtBRL(r.itens.reduce((s, i) => s + i.valorTotalEstimado, 0)),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => (
        <button
          onClick={() =>
            definirStatus(r.id, r.status === 'RASCUNHO' ? 'PRONTO_PARA_ENVIO' : 'RASCUNHO')
          }
          title="Alternar status"
        >
          <Badge tone={r.status === 'RASCUNHO' ? 'neutral' : 'info'}>
            {r.status === 'RASCUNHO' ? 'Rascunho' : 'Pronto para Envio'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setItensAbertoId(r.id)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <FilePenLine size={13} /> Itens
          </button>
          <button
            onClick={() => setConfirmarId(r.id)}
            aria-label="Excluir PCA"
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
        title="Criar PCA"
        subtitle="Cada Unidade Orçamentária monta o seu PCA. O administrador geral consolida e transmite todos ao PNCP."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button onClick={() => setNovoOpen(true)}>
          <Plus size={16} /> Novo PCA
        </Button>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por Nome / Órgão"
          className="gt-input min-w-40 flex-1"
        />
        <button
          onClick={() => setTransmitirOpen(true)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Send size={16} /> Transmitir ao PNCP
        </button>
      </div>

      <DataTable<PcaLocal>
        columns={columns}
        rows={filtrados}
        rowKey={(r) => r.id}
        empty={
          <button onClick={() => setNovoOpen(true)} className="w-full">
            <EmptyState
              icon={CalendarRange}
              title="Nenhum PCA encontrado"
              subtitle="Crie um novo Plano de Contratação Anual pra começar."
            />
          </button>
        }
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {filtrados.length}</span>
          </>
        }
      />

      {novoOpen && (
        <NovoPcaModal
          onCriado={(id) => {
            setNovoOpen(false)
            setItensAbertoId(id)
          }}
          onClose={() => setNovoOpen(false)}
        />
      )}
      {itensAbertoId && (
        <PcaItensModal pcaId={itensAbertoId} onClose={() => setItensAbertoId(null)} />
      )}
      {transmitirOpen && <TransmitirPncpModal onClose={() => setTransmitirOpen(false)} />}

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
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Excluir PCA?</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O PCA <strong>{itemConfirmar.nome}</strong> e seus itens serão removidos. Esta ação não
              pode ser desfeita.
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
