import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { useProcessos } from '../../store/processos'
import { useNecessidades } from '../../store/necessidades'
import { useOrganizacao } from '../../store/organizacao'
import { useSolicitacoes } from '../../store/solicitacoes'
import { useAuth } from '../../store/auth'
import { ProcessoFields } from './ProcessoFields'
import { PROCESSO_FORM_VAZIO, toNovoProcesso, type ProcessoFormValue } from './processoForm'

/**
 * Wizard multi-etapa de criação de Processo Inteligente.
 * - modo "registros": a etapa 2 escolhe registros de necessidade.
 * - modo "solicitacao": a etapa 2 escolhe setores a quem solicitar preenchimento
 *   + observação; ao concluir, gera uma Solicitação de Preenchimento por setor.
 * A primeira aba é sempre "Processo" (campos do processo).
 */
export function ProcessoWizardModal({
  open,
  onClose,
  title,
  subtitle,
  tabs,
  modo,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  tabs: string[]
  modo: 'registros' | 'solicitacao'
}) {
  const criar = useProcessos((s) => s.criar)
  const registros = useNecessidades((s) => s.registros)
  const setores = useOrganizacao((s) => s.setores)
  const unidades = useOrganizacao((s) => s.unidades)
  const criarLote = useSolicitacoes((s) => s.criarLote)
  const user = useAuth((s) => s.user)
  const navigate = useNavigate()

  const isAdmin = user?.perfil === 'ADMIN_GERAL'
  const formInicial = (): ProcessoFormValue => {
    const minhaUnidade = unidades.find((u) => u.id === user?.unidadeId)
    return {
      ...PROCESSO_FORM_VAZIO,
      unidadeId: isAdmin ? '' : (minhaUnidade?.id ?? ''),
      unidadeNome: isAdmin ? '' : (minhaUnidade?.nome ?? ''),
    }
  }

  const [tab, setTab] = useState(0)
  const [form, setForm] = useState<ProcessoFormValue>(formInicial)
  const [registrosSel, setRegistrosSel] = useState<string[]>([])
  const [setoresSel, setSetoresSel] = useState<string[]>([])
  const [nota, setNota] = useState('')

  if (!open) return null

  const last = tab === tabs.length - 1
  const itensResumo = registros
    .filter((r) => registrosSel.includes(r.id))
    .reduce((s, r) => s + r.itens, 0)
  const formOk = Boolean(
    form.nome.trim() &&
      form.numero.trim() &&
      form.tipo &&
      form.legislacao &&
      (unidades.length === 0 || form.unidadeId),
  )
  const podeConcluir = formOk && (modo === 'solicitacao' ? setoresSel.length > 0 : true)

  const toggleRegistro = (id: string) =>
    setRegistrosSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleSetor = (s: string) =>
    setSetoresSel((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const resetar = () => {
    setTab(0)
    setForm(formInicial())
    setRegistrosSel([])
    setSetoresSel([])
    setNota('')
  }

  const fechar = () => {
    resetar()
    onClose()
  }

  const concluir = () => {
    if (!podeConcluir) return
    if (modo === 'solicitacao') {
      const numero = form.numero.trim()
      const nome = form.nome.trim()
      const id = criar({ ...toNovoProcesso(form), origem: 'SOLICITACAO' })
      criarLote(
        { processoId: id, processoNumero: numero, processoNome: nome, descricao: nota },
        setoresSel,
      )
      resetar()
      onClose()
      navigate(`/Processo/${id}`)
      return
    }
    const id = criar({
      ...toNovoProcesso(form),
      origem: 'REGISTROS',
      registroIds: registrosSel,
      itensResumo,
    })
    resetar()
    onClose()
    navigate(`/Processo/${id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar()
      }}
    >
      <div className="relative my-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6">
        <button
          onClick={fechar}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">{title}</h3>
            <p className="text-sm text-[var(--color-muted)]">{subtitle}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 border-b border-[var(--color-line)]">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition ${
                i === tab
                  ? 'border-[var(--color-primary)] text-[var(--color-primary-strong)]'
                  : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 ? (
          <ProcessoFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
        ) : modo === 'solicitacao' ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Setores a solicitar preenchimento
            </p>
            <ul className="flex flex-col gap-1">
              {setores.map(({ nome: s }) => (
                <li key={s}>
                  <label className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 hover:bg-[#f8fafd]">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">{s}</span>
                    <input
                      type="checkbox"
                      checked={setoresSel.includes(s)}
                      onChange={() => toggleSetor(s)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>
                </li>
              ))}
            </ul>

            <label className="mt-3 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Observação para os setores
              <textarea
                rows={3}
                maxLength={500}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Oriente os setores sobre o preenchimento…"
                className="gt-input resize-y font-normal normal-case"
              />
            </label>

            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Solicitações a gerar:{' '}
              <strong className="text-[var(--color-ink)]">{setoresSel.length}</strong>
            </p>
          </div>
        ) : registros.length === 0 ? (
          <EmptyState
            title="Nenhum registro de necessidade"
            subtitle="Cadastre registros em Registro de Necessidades para compor o processo."
          />
        ) : (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Selecione os registros de necessidade
            </p>
            <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {registros.map((r) => (
                <li key={r.id}>
                  <label className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 hover:bg-[#f8fafd]">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--color-ink)]">
                        {r.nome}
                      </span>
                      <span className="block text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
                        {r.setor} • {r.itens} {r.itens === 1 ? 'item' : 'itens'}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={registrosSel.includes(r.id)}
                      onChange={() => toggleRegistro(r.id)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Itens somados: <strong className="text-[var(--color-ink)]">{itensResumo}</strong>
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={fechar}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={() => (last ? concluir() : setTab((t) => t + 1))}
            disabled={last && !podeConcluir}
            className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {last ? 'Concluir' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
