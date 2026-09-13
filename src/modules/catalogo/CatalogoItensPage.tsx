import { useState } from 'react'
import { PackageSearch, Pencil, Plus, Trash2, X } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/common/Button'
import { Combo } from '../../components/common/Combo'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { useCatalogo, type CatalogoItem } from '../../store/catalogo'
import { TIPOS_ITEM, UNIDADES } from './itemOpcoes'
import { ImportarCatMatModal } from './ImportarCatMatModal'
import { ImportarExcelModal } from './ImportarExcelModal'

const vazio = { nome: '', especificacao: '', unidade: '', tipo: '', codigo: '' }

export function CatalogoItensPage() {
  useModuleLinks([
    { key: 'base', label: 'Catálogo', to: '/CatalogoItens', icon: 'database' },
    { key: 'precos', label: 'Pesquisa de Preços', to: '/PesquisaPrecos', icon: 'precos' },
  ])

  const itens = useCatalogo((s) => s.itens)
  const adicionar = useCatalogo((s) => s.adicionar)
  const atualizar = useCatalogo((s) => s.atualizar)
  const remover = useCatalogo((s) => s.remover)

  const [busca, setBusca] = useState('')
  const [novoAberto, setNovoAberto] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [catmatAberto, setCatmatAberto] = useState(false)
  const [excelAberto, setExcelAberto] = useState(false)
  const [confirmarId, setConfirmarId] = useState<string | null>(null)
  const [form, setForm] = useState(vazio)

  const itemConfirmar = itens.find((i) => i.id === confirmarId) ?? null

  const abrirEdicao = (i: CatalogoItem) => {
    setEditId(i.id)
    setForm({
      nome: i.nome,
      especificacao: i.especificacao,
      unidade: i.unidade,
      tipo: i.tipo,
      codigo: i.codigo,
    })
    setNovoAberto(true)
  }

  const filtrados = itens.filter(
    (i) =>
      i.nome.toLowerCase().includes(busca.toLowerCase()) ||
      i.codigo.toLowerCase().includes(busca.toLowerCase()),
  )

  const podeSalvar = form.nome.trim() && form.tipo && form.unidade

  const fecharForm = () => {
    setNovoAberto(false)
    setEditId(null)
    setForm(vazio)
  }

  const salvar = () => {
    if (!podeSalvar) return
    if (editId) {
      const patch: Partial<Omit<CatalogoItem, 'id'>> = {
        nome: form.nome.trim(),
        especificacao: form.especificacao.trim(),
        unidade: form.unidade,
        tipo: form.tipo,
      }
      if (form.codigo.trim()) patch.codigo = form.codigo.trim()
      atualizar(editId, patch)
    } else {
      adicionar({
        nome: form.nome,
        especificacao: form.especificacao,
        unidade: form.unidade,
        tipo: form.tipo,
        codigo: form.codigo,
      })
    }
    fecharForm()
  }

  const columns: Column<CatalogoItem>[] = [
    { key: 'codigo', header: 'Código' },
    {
      key: 'nome',
      header: 'Nome item',
      render: (r) => (
        <div className="max-w-[460px]">
          <p className="font-bold text-[var(--color-ink)]">{r.nome}</p>
          {r.especificacao && (
            <p className="mt-0.5 max-h-16 resize-y overflow-auto whitespace-pre-wrap text-xs text-[var(--color-muted)]">
              {r.especificacao}
            </p>
          )}
        </div>
      ),
    },
    { key: 'unidade', header: 'Unidade', align: 'center' },
    { key: 'tipo', header: 'Tipo de item', align: 'center' },
    { key: 'origem', header: 'Origem do item', align: 'center' },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => abrirEdicao(r)}
            aria-label="Editar item"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirmarId(r.id)}
            aria-label="Excluir item"
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
        title="Catálogo de Itens"
        subtitle="Configure os itens cadastrados para seus processos!"
        icon={PackageSearch}
        accent="blue"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <Button onClick={() => setNovoAberto(true)}>
          <Plus size={16} /> Novo Item
        </Button>
        <Button variant="success" onClick={() => setCatmatAberto(true)}>
          <Plus size={16} /> Importar CatMat/CatSer
        </Button>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar"
          className="gt-input min-w-40 flex-1"
        />
        <button
          onClick={() => setExcelAberto(true)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#8b5cf6_0%,#7c3aed_100%)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Importar Excel
        </button>
      </div>

      <DataTable<CatalogoItem>
        columns={columns}
        rows={filtrados}
        rowKey={(r) => r.id}
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
            <span>Registros encontrados: {filtrados.length}</span>
          </>
        }
      />

      {catmatAberto && <ImportarCatMatModal onClose={() => setCatmatAberto(false)} />}
      {excelAberto && <ImportarExcelModal onClose={() => setExcelAberto(false)} />}

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
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Excluir item?</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O item <strong>{itemConfirmar.nome}</strong> será removido do catálogo. Esta ação não
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

      {novoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharForm()
          }}
        >
          <div className="relative my-4 w-full max-w-2xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
            <button
              onClick={fecharForm}
              aria-label="Fechar"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                {editId ? <Pencil size={20} /> : <Plus size={22} />}
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[#183263]">
                  {editId ? 'Editar Item' : 'Novo Item'}
                </h3>
                <p className="text-xs text-[var(--color-muted)]">
                  {editId
                    ? 'Atualize os dados do item do catálogo.'
                    : 'Complete os campos para cadastrar um novo item no catálogo.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <Campo
                label="Nome do item"
                obrigatorio
                placeholder="Ex: NOTEBOOK AVANÇADO"
                value={form.nome}
                onChange={(v) => setForm((f) => ({ ...f, nome: v }))}
              />
              <TextArea
                label="Especificação"
                placeholder="Ex: Tela 15.6, 16GB RAM, SSD 512GB…"
                value={form.especificacao}
                onChange={(v) => setForm((f) => ({ ...f, especificacao: v }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Rotulo label="Unidade de medida" obrigatorio>
                  <Combo
                    value={form.unidade}
                    onChange={(v) => setForm((f) => ({ ...f, unidade: v }))}
                    options={UNIDADES}
                    placeholder="Selecione ou digite para filtrar"
                    filterable
                  />
                </Rotulo>
                <Rotulo label="Tipo do item" obrigatorio>
                  <Combo
                    value={form.tipo}
                    onChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
                    options={TIPOS_ITEM}
                    placeholder="Selecione"
                  />
                </Rotulo>
              </div>
              <Campo
                label="Código"
                placeholder="Deixe em branco para gerar automático (sequencial)"
                value={form.codigo}
                onChange={(v) => setForm((f) => ({ ...f, codigo: v }))}
              />
            </div>

            <button
              onClick={salvar}
              disabled={!podeSalvar}
              className="mt-5 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Salvar Item
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Rotulo({
  label,
  obrigatorio,
  children,
}: {
  label: string
  obrigatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      <span>
        {label} {obrigatorio && <span className="text-[var(--color-danger)]">*</span>}
      </span>
      {children}
    </div>
  )
}

function Campo({
  label,
  obrigatorio,
  value,
  onChange,
  placeholder,
}: {
  label: string
  obrigatorio?: boolean
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <Rotulo label={label} obrigatorio={obrigatorio}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="gt-input font-normal normal-case"
      />
    </Rotulo>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <Rotulo label={label}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="gt-input resize-y font-normal normal-case"
      />
    </Rotulo>
  )
}
