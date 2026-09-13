import { useState } from 'react'
import { CalendarRange, FilePenLine, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { usePca, dfdCompleta, itensDoPca, valorPca, type PcaLocal } from '../../store/pca'
import { usePode } from '../../app/permissoes'
import { PCA_MODULE_LINKS } from './pcaLinks'
import { NovoPcaModal } from './NovoPcaModal'
import { PcaDfdsModal } from './PcaDfdsModal'
import { TransmitirPncpModal } from './TransmitirPncpModal'

const fmtBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function CriarPcaPage() {
  useModuleLinks(PCA_MODULE_LINKS)

  const pcas = usePca((s) => s.pcas)
  const remover = usePca((s) => s.remover)
  const definirStatus = usePca((s) => s.definirStatus)
  const podeTransmitir = usePode('transmitirPncp')

  const [busca, setBusca] = useState('')
  const [novoOpen, setNovoOpen] = useState(false)
  const [editarId, setEditarId] = useState<string | null>(null)
  const [itensAbertoId, setItensAbertoId] = useState<string | null>(null)
  const [confirmarId, setConfirmarId] = useState<string | null>(null)
  const [transmitirOpen, setTransmitirOpen] = useState(false)
  const [bloqueio, setBloqueio] = useState<{ nome: string; faltam: number } | null>(null)

  const tentarPronto = (p: PcaLocal) => {
    if (p.status === 'TRANSMITIDO') return
    if (p.status === 'PRONTO_PARA_ENVIO') {
      definirStatus(p.id, 'RASCUNHO')
      return
    }
    const faltam = p.dfds.filter((d) => !dfdCompleta(d)).length
    if (p.dfds.length === 0 || faltam > 0) {
      setBloqueio({ nome: p.nome, faltam: faltam || 1 })
      return
    }
    definirStatus(p.id, 'PRONTO_PARA_ENVIO')
  }

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
    { key: 'dfds', header: 'DFDs', align: 'center', render: (r) => r.dfds.length },
    { key: 'itens', header: 'Itens', align: 'center', render: (r) => itensDoPca(r).length },
    {
      key: 'valorTotal',
      header: 'Valor Total',
      align: 'right',
      render: (r) => fmtBRL(valorPca(r)),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => (
        <button
          onClick={() => tentarPronto(r)}
          disabled={r.status === 'TRANSMITIDO'}
          title={
            r.status === 'TRANSMITIDO'
              ? `Transmitido ao PNCP (${r.ambienteTransmissao}) em ${r.dataTransmissao}`
              : 'Alternar status'
          }
          className={r.status === 'TRANSMITIDO' ? 'cursor-default' : ''}
        >
          <Badge
            tone={r.status === 'RASCUNHO' ? 'neutral' : r.status === 'TRANSMITIDO' ? 'success' : 'info'}
          >
            {r.status === 'RASCUNHO'
              ? 'Rascunho'
              : r.status === 'TRANSMITIDO'
                ? 'Transmitido'
                : 'Pronto para Envio'}
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
            <FilePenLine size={13} /> DFDs
          </button>
          <button
            onClick={() => setEditarId(r.id)}
            aria-label="Editar PCA"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <Pencil size={14} />
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
        icon={CalendarRange}
        accent="amber"
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
        {podeTransmitir && (
          <button
            onClick={() => setTransmitirOpen(true)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Send size={16} /> Transmitir ao PNCP
          </button>
        )}
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
      {editarId && (
        <NovoPcaModal
          pcaId={editarId}
          onCriado={() => setEditarId(null)}
          onClose={() => setEditarId(null)}
        />
      )}
      {itensAbertoId && (
        <PcaDfdsModal pcaId={itensAbertoId} onClose={() => setItensAbertoId(null)} />
      )}
      {transmitirOpen && podeTransmitir && (
        <TransmitirPncpModal onClose={() => setTransmitirOpen(false)} />
      )}

      {bloqueio && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBloqueio(null)
          }}
        >
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0d79a] text-[#a3720c]">
              <FilePenLine size={22} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">
              PCA ainda não está completo
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O PCA <strong>{bloqueio.nome}</strong>{' '}
              {bloqueio.faltam === 1
                ? 'tem 1 DFD pendente'
                : `tem ${bloqueio.faltam} DFDs pendentes`}{' '}
              (objeto, grau de prioridade, data desejada, ao menos um departamento e itens
              completos). Abra "DFDs" e complete antes de marcar como Pronto para Envio.
            </p>
            <button
              onClick={() => setBloqueio(null)}
              className="mt-5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

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
