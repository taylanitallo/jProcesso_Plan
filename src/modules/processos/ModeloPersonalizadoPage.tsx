import { useState } from 'react'
import { Download, FilePenLine, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ModeloEditorModal } from './ModeloEditorModal'
import { NovoModeloModal } from './NovoModeloModal'
import { useModelos, type Modelo } from '../../store/modelos'

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

export function ModeloPersonalizadoPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)

  const modelos = useModelos((s) => s.modelos)
  const remover = useModelos((s) => s.remover)

  const [editando, setEditando] = useState<Modelo | null>(null)
  const [novoAberto, setNovoAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [confirmarId, setConfirmarId] = useState<string | null>(null)

  const filtrados = modelos.filter((m) => m.nome.toLowerCase().includes(busca.toLowerCase()))
  const itemConfirmar = modelos.find((m) => m.id === confirmarId) ?? null

  const baixar = async (m: Modelo) => {
    // arquivo real que está no sistema: o .docx enviado, ou o modelo-base SollAI
    const origem = m.arquivoUrl || '/modelos/termo-referencia.docx'
    const ext = origem.split('?')[0].split('.').pop() || 'docx'
    const nomeArquivo = m.arquivo || `${m.nome.replace(/[\\/]/g, '-')}.${ext}`
    try {
      const resp = await fetch(origem)
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeArquivo
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      /* dev-server fora do ar */
    }
  }

  const cols: Column<Modelo>[] = [
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
    { key: 'inclusao', header: 'Data de inclusão', render: (r) => <Autor sigla={r.inclusaoPor} data={r.inclusao} /> },
    {
      key: 'ultimaEdicao',
      header: 'Última edição',
      render: (r) => <Autor sigla={r.ultimaEdicaoPor} data={r.ultimaEdicao} />,
    },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => baixar(r)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)]"
          >
            <Download size={13} /> Download
          </button>
          <button
            onClick={() => setEditando(r)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <FilePenLine size={13} /> Editar
          </button>
          <button
            onClick={() => setConfirmarId(r.id)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[#f0c2c8] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)]"
          >
            <Trash2 size={13} /> Excluir
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Modelos Personalizados"
        subtitle="Crie, gerencie e atualize modelos alinhados aos requisitos do processo."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button onClick={() => setNovoAberto(true)}>
          <Plus size={16} /> Novo modelo
        </Button>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome"
          className="gt-input min-w-40 flex-1"
        />
      </div>

      <DataTable<Modelo>
        columns={cols}
        rows={filtrados}
        rowKey={(r) => r.id}
        empty={
          <EmptyState title="Nenhum modelo encontrado" subtitle="Crie um novo modelo personalizado." />
        }
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {filtrados.length}</span>
          </>
        }
      />

      {novoAberto && <NovoModeloModal onClose={() => setNovoAberto(false)} />}
      <ModeloEditorModal modelo={editando} onClose={() => setEditando(null)} />

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
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Excluir modelo?</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O modelo <strong>{itemConfirmar.nome}</strong> será removido. Esta ação não pode ser
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
