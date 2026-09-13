import { useState } from 'react'
import { Building2, Plus, Trash2, X } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { useOrganizacao } from '../../store/organizacao'

const TABS = ['Unidades', 'Setores']

export function GerenciarUnidadeSetorPage() {
  const [tab, setTab] = useState(TABS[0])
  const isUnidade = tab === 'Unidades'

  const unidades = useOrganizacao((s) => s.unidades)
  const setores = useOrganizacao((s) => s.setores)
  const addUnidade = useOrganizacao((s) => s.addUnidade)
  const addSetor = useOrganizacao((s) => s.addSetor)
  const removeUnidade = useOrganizacao((s) => s.removeUnidade)
  const removeSetor = useOrganizacao((s) => s.removeSetor)

  const [novoOpen, setNovoOpen] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [excluirId, setExcluirId] = useState<string | null>(null)

  const lista = isUnidade ? unidades : setores
  const rotulo = isUnidade ? 'Unidade' : 'Setor'

  const salvar = () => {
    if (!nome.trim()) return
    if (isUnidade) addUnidade(codigo.trim(), nome.trim())
    else addSetor(codigo.trim(), nome.trim())
    setCodigo('')
    setNome('')
    setNovoOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Gerenciamento de Unidade e Setor"
        subtitle="Gerencie os Unidades e Setores da instituição"
        icon={Building2}
        accent="blue"
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

      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
              <Building2 size={20} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                {isUnidade ? 'Unidades' : 'Setores'}
              </p>
              <p className="font-display text-lg font-bold text-[#183263]">
                {isUnidade ? 'Unidades da instituição' : 'Setores da instituição'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNovoOpen(true)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={15} /> {isUnidade ? 'Nova Unidade' : 'Novo Setor'}
          </button>
        </div>

        {lista.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={isUnidade ? 'Nenhuma unidade cadastrada' : 'Nenhum setor cadastrado'}
            subtitle={
              isUnidade ? 'Registre as unidades da instituição.' : 'Registre os setores da instituição.'
            }
          />
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-line)]">
            {lista.map((it) => (
              <li key={it.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{it.nome}</p>
                  {it.codigo && (
                    <p className="text-xs text-[var(--color-muted)]">Código: {it.codigo}</p>
                  )}
                </div>
                <button
                  onClick={() => setExcluirId(it.id)}
                  aria-label={`Excluir ${rotulo.toLowerCase()}`}
                  className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {novoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNovoOpen(false)
          }}
        >
          <div className="relative my-10 w-full max-w-xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
            <button
              onClick={() => setNovoOpen(false)}
              aria-label="Fechar"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                <Building2 size={20} />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[#183263]">Nova {rotulo.toLowerCase()}</h3>
                <p className="text-xs text-[var(--color-muted)]">
                  Preencha os campos para cadastrar a {rotulo.toLowerCase()}.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Código
                <input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder={`Digite o código do ${rotulo.toLowerCase()}`}
                  className="gt-input font-normal normal-case"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Nome
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && salvar()}
                  placeholder={`Digite o nome do ${rotulo.toLowerCase()}`}
                  className="gt-input font-normal normal-case"
                />
              </label>
            </div>
            <button
              onClick={salvar}
              disabled={!nome.trim()}
              className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(excluirId)}
        title={`Excluir ${rotulo.toLowerCase()}?`}
        message={
          <>
            <strong>{lista.find((i) => i.id === excluirId)?.nome}</strong> será removido(a). Esta
            ação não pode ser desfeita.
          </>
        }
        onCancel={() => setExcluirId(null)}
        onConfirm={() => {
          if (excluirId) (isUnidade ? removeUnidade : removeSetor)(excluirId)
          setExcluirId(null)
        }}
      />
    </div>
  )
}
