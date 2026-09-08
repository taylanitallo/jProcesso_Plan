import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { PROCESSO_LEGISLACOES, PROCESSO_TIPOS } from '../../mocks'
import { useWorkflows } from '../../store/workflows'

/** "+ Novo Fluxo" — conforme o modal real do SollAI. */
export function NovoFluxoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const criar = useWorkflows((s) => s.criar)
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [legislacao, setLegislacao] = useState('')
  const [tipo, setTipo] = useState('')

  if (!open) return null

  const podeSalvar = Boolean(nome.trim() && legislacao && tipo)

  const reset = () => {
    setNome('')
    setLegislacao('')
    setTipo('')
  }

  const fechar = () => {
    reset()
    onClose()
  }

  const salvar = () => {
    if (!podeSalvar) return
    const id = criar({ nome, legislacao, tipo })
    reset()
    onClose()
    navigate(`/Workflow/${id}`)
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
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">Novo Fluxo</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Complete os campos para criar um fluxo automatizado associado aos seus processos
              inteligentes.
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Dê um nome ao fluxo e defina a legislação e o tipo de processo vinculados. Uma mesma
          combinação pode possuir vários fluxos.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Nome do Fluxo
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Obras - 14.133"
              className="gt-input font-normal normal-case"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Legislação
              <Combo
                value={legislacao}
                onChange={setLegislacao}
                options={PROCESSO_LEGISLACOES}
                placeholder="Selecione uma Legislação"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Tipo de Processo
              <Combo
                value={tipo}
                onChange={setTipo}
                options={PROCESSO_TIPOS}
                placeholder="Selecione um Tipo"
              />
            </label>
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--color-muted)]">
          O nome diferencia fluxos que usam a mesma legislação e o mesmo tipo de processo.
        </p>

        <button
          onClick={salvar}
          disabled={!podeSalvar}
          className="mt-5 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Salvar Fluxo
        </button>
      </div>
    </div>
  )
}
