import { useState } from 'react'
import { Check, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../store/auth'
import { useUsuarios } from '../../store/usuarios'

const SETORES = ['Compras', 'Jurídico', 'Engenharia', 'Financeiro', 'TI']

const PERMISSOES_DISPONIVEIS = [
  { key: 'visualizacao' as const, label: 'Visualização' },
  { key: 'pergunta' as const, label: 'Pergunta' },
  { key: 'upload' as const, label: 'Upload' },
  { key: 'itens' as const, label: 'Itens' },
]

type Permissao = {
  tipo: 'Usuário' | 'Setor'
  nome: string
  visualizacao: boolean
  pergunta: boolean
  upload: boolean
  itens: boolean
}

/**
 * "Permissões" do menu Mais Opções — espelha "Permissões do Processo" do
 * SollAI real (app.sollai.com.br/Processo/979).
 */
export function PermissoesProcessoModal({
  nomeProcesso,
  onClose,
  onSave,
}: {
  nomeProcesso: string
  onClose: () => void
  onSave: () => void
}) {
  const usuarios = useUsuarios((s) => s.usuarios)
  const nomeAtual = useAuth((s) => s.user?.name)
  const nomesUsuarios = [nomeAtual, ...usuarios.map((u) => u.nome)].filter(
    (n, i, arr): n is string => Boolean(n) && arr.indexOf(n) === i,
  )

  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [tipo, setTipo] = useState<'Usuário' | 'Setor'>('Usuário')
  const [nomeSelecionado, setNomeSelecionado] = useState('')
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({})

  const resetForm = () => {
    setTipo('Usuário')
    setNomeSelecionado('')
    setMarcadas({})
  }

  const togglePermissao = (key: string) => setMarcadas((prev) => ({ ...prev, [key]: !prev[key] }))

  const salvarPermissao = () => {
    if (!nomeSelecionado) return
    setPermissoes((prev) => [
      ...prev,
      {
        tipo,
        nome: nomeSelecionado,
        visualizacao: Boolean(marcadas.visualizacao),
        pergunta: Boolean(marcadas.pergunta),
        upload: Boolean(marcadas.upload),
        itens: Boolean(marcadas.itens),
      },
    ])
    resetForm()
    setFormOpen(false)
    onSave()
  }

  const removerPermissao = (i: number) => setPermissoes((prev) => prev.filter((_, idx) => idx !== i))

  const cols: Column<Permissao>[] = [
    { key: 'usuario', header: 'Usuário', render: (r) => (r.tipo === 'Usuário' ? r.nome : '—') },
    { key: 'setor', header: 'Setor', render: (r) => (r.tipo === 'Setor' ? r.nome : '—') },
    {
      key: 'visualizacao',
      header: 'Visualização',
      align: 'center',
      render: (r) => (r.visualizacao ? <Check size={15} className="mx-auto text-[var(--color-success)]" /> : '—'),
    },
    {
      key: 'pergunta',
      header: 'Pergunta',
      align: 'center',
      render: (r) => (r.pergunta ? <Check size={15} className="mx-auto text-[var(--color-success)]" /> : '—'),
    },
    {
      key: 'upload',
      header: 'Upload',
      align: 'center',
      render: (r) => (r.upload ? <Check size={15} className="mx-auto text-[var(--color-success)]" /> : '—'),
    },
    {
      key: 'itens',
      header: 'Itens',
      align: 'center',
      render: (r) => (r.itens ? <Check size={15} className="mx-auto text-[var(--color-success)]" /> : '—'),
    },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => {
        const i = permissoes.indexOf(r)
        return (
          <button
            onClick={() => removerPermissao(i)}
            aria-label="Remover permissão"
            className="ml-auto grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
          >
            <Trash2 size={14} />
          </button>
        )
      },
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-[1320px] rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Permissões do Processo</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Defina quem pode visualizar, realizar perguntas e enviar artefatos.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-[var(--radius-pill)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
            Processo: {nomeProcesso}
          </span>
          <button
            onClick={() => {
              setFormOpen((o) => !o)
              if (formOpen) resetForm()
            }}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            <Plus size={14} /> {formOpen ? 'Fechar formulário' : 'Nova permissão'}
          </button>
        </div>

        {formOpen && (
          <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[#f8fafd] p-4">
            <h4 className="font-display text-sm font-bold text-[#183263]">Adicionar permissão</h4>
            <p className="text-xs text-[var(--color-muted)]">
              Escolha um usuário e selecione as permissões que ele poderá exercer neste processo.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Tipo
                <div className="flex gap-4 pt-1 font-normal normal-case text-[var(--color-ink)]">
                  {(['Usuário', 'Setor'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="radio"
                        checked={tipo === t}
                        onChange={() => {
                          setTipo(t)
                          setNomeSelecionado('')
                        }}
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                {tipo === 'Usuário' ? 'Usuário' : 'Setor'}
                <Combo
                  value={nomeSelecionado}
                  onChange={setNomeSelecionado}
                  options={tipo === 'Usuário' ? nomesUsuarios : SETORES}
                  placeholder="Selecione:"
                />
              </label>

              <div className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Permissões
                <div className="flex flex-wrap gap-2 pt-1">
                  {PERMISSOES_DISPONIVEIS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => togglePermissao(p.key)}
                      className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-semibold normal-case transition ${
                        marcadas[p.key]
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-[var(--color-line)] bg-white text-[var(--color-muted)]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={salvarPermissao}
              disabled={!nomeSelecionado}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f9d55_0%,#198754_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} /> Salvar Permissões
            </button>
          </div>
        )}

        <div className="mt-5">
          <h4 className="font-display text-sm font-bold text-[#183263]">Permissões configuradas</h4>
          <p className="mb-3 text-xs text-[var(--color-muted)]">
            Revise os usuários autorizados e ajuste quando necessário.
          </p>
          <DataTable<Permissao>
            columns={cols}
            rows={permissoes}
            rowKey={(r) => `${r.tipo}-${r.nome}`}
            empty={
              <button onClick={() => setFormOpen(true)} className="w-full">
                <EmptyState
                  title="Nenhuma permissão cadastrada"
                  subtitle='Utilize o botão "Nova permissão" para adicionar usuários ao processo.'
                />
              </button>
            }
          />
        </div>
      </div>
    </div>
  )
}
