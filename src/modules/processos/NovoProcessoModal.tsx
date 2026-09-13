import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarRange, Plus, X } from 'lucide-react'
import { useProcessos } from '../../store/processos'
import { useOrganizacao } from '../../store/organizacao'
import { useAuth } from '../../store/auth'
import { usePca, valorDfd } from '../../store/pca'
import { useDfdManual, dfdManualDoPca } from '../../store/dfdManual'
import { PROCESSO_LEGISLACOES, PROCESSO_ARTEFATOS } from '../../mocks'
import { Combo } from '../../components/common/Combo'
import { ProcessoFields } from './ProcessoFields'
import { PROCESSO_FORM_VAZIO, toNovoProcesso } from './processoForm'

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const DFD_COMPLETO =
  PROCESSO_ARTEFATOS.find((a) => a.nome === 'DFD')?.completo ??
  'Documento de Formalização de Demanda (DFD)'

/** "+ Novo" → "Processo com preenchimento manual". Campos conforme o modal real do SollAI. */
export function NovoProcessoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const criar = useProcessos((s) => s.criar)
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const unidades = useOrganizacao((s) => s.unidades)
  const setores = useOrganizacao((s) => s.setores)
  const pcas = usePca((s) => s.pcas)
  const salvarDfdManual = useDfdManual((s) => s.salvar)
  const isAdmin = user?.perfil === 'ADMIN_GERAL'
  const minhaUnidade = unidades.find((u) => u.id === user?.unidadeId)
  const vazio = {
    ...PROCESSO_FORM_VAZIO,
    legislacao: PROCESSO_LEGISLACOES[0],
    unidadeId: isAdmin ? '' : (minhaUnidade?.id ?? ''),
    unidadeNome: isAdmin ? '' : (minhaUnidade?.nome ?? ''),
  }
  const [form, setForm] = useState(vazio)
  const [origemDfdLabel, setOrigemDfdLabel] = useState('')

  if (!open) return null

  const origensDfd = pcas.flatMap((pca) =>
    pca.dfds
      .filter((dfd) => dfd.itens.length > 0)
      .map((dfd) => ({
        pca,
        dfd,
        label: `${pca.nome} (${pca.anoPca}) — DFD #${dfd.numero}: ${dfd.objeto || 'sem objeto'}`,
      })),
  )
  const origemSelecionada = origensDfd.find((o) => o.label === origemDfdLabel) ?? null

  const podeSalvar = Boolean(
    form.nome.trim() &&
      form.numero.trim() &&
      form.tipo &&
      form.legislacao &&
      (unidades.length === 0 || form.unidadeId),
  )

  const fechar = () => {
    setForm(vazio)
    setOrigemDfdLabel('')
    onClose()
  }

  const salvar = () => {
    if (!podeSalvar) return
    const id = criar({ ...toNovoProcesso(form), origem: 'MANUAL' })
    if (origemSelecionada) {
      const dados = dfdManualDoPca(
        origemSelecionada.pca,
        origemSelecionada.dfd,
        setores.map((s) => s.nome),
      )
      salvarDfdManual(`${id}::${DFD_COMPLETO}`, dados)
    }
    setForm(vazio)
    setOrigemDfdLabel('')
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

        <div className="mb-5 flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
              Novo Processo
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Complete os campos para cadastrar um novo Processo Inteligente.
            </p>
          </div>
        </div>

        {origensDfd.length > 0 && (
          <div className="mb-5 rounded-[var(--radius-card)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] p-3">
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
              <span className="flex items-center gap-1.5">
                <CalendarRange size={13} /> Puxar DFD do PCA (opcional)
              </span>
              <Combo
                value={origemDfdLabel}
                onChange={setOrigemDfdLabel}
                options={origensDfd.map((o) => o.label)}
                placeholder="Nenhum — preencher DFD do zero depois"
                filterable
              />
            </label>
            {origemSelecionada && (
              <p className="mt-2 text-xs text-[var(--color-primary-strong)]">
                {origemSelecionada.dfd.itens.length} item(ns) · valor estimado{' '}
                {fmtBRL(valorDfd(origemSelecionada.dfd))} — vem tudo preenchido no DFD do processo;
                dá pra ajustar a especificação de cada item depois.
              </p>
            )}
          </div>
        )}

        <ProcessoFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={() => setForm(vazio)}
            className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
          >
            Limpar
          </button>
          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar Processo
          </button>
        </div>
      </div>
    </div>
  )
}
