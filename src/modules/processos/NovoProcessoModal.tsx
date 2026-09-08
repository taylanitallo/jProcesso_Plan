import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { useProcessos } from '../../store/processos'
import { PROCESSO_LEGISLACOES } from '../../mocks'
import { ProcessoFields } from './ProcessoFields'
import { PROCESSO_FORM_VAZIO, toNovoProcesso } from './processoForm'

const vazio = { ...PROCESSO_FORM_VAZIO, legislacao: PROCESSO_LEGISLACOES[0] }

/** "+ Novo" → "Processo com preenchimento manual". Campos conforme o modal real do SollAI. */
export function NovoProcessoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const criar = useProcessos((s) => s.criar)
  const navigate = useNavigate()
  const [form, setForm] = useState(vazio)

  if (!open) return null

  const podeSalvar = Boolean(form.nome.trim() && form.numero.trim() && form.tipo && form.legislacao)

  const fechar = () => {
    setForm(vazio)
    onClose()
  }

  const salvar = () => {
    if (!podeSalvar) return
    const id = criar({ ...toNovoProcesso(form), origem: 'MANUAL' })
    setForm(vazio)
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
