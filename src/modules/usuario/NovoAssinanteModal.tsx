import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { useAssinantes, type Assinante } from '../../store/assinantes'

/** Cadastro / edição de assinante externo. Sem `assinante` = criar. */
export function NovoAssinanteModal({
  assinante,
  onClose,
}: {
  assinante?: Assinante
  onClose: () => void
}) {
  const criar = useAssinantes((s) => s.criar)
  const atualizar = useAssinantes((s) => s.atualizar)

  const [nome, setNome] = useState(assinante?.nome ?? '')
  const [email, setEmail] = useState(assinante?.email ?? '')
  const [documento, setDocumento] = useState(assinante?.documento ?? '')

  const editando = Boolean(assinante)
  const podeSalvar = Boolean(nome.trim() && email.trim().includes('@'))

  const salvar = () => {
    if (!podeSalvar) return
    if (assinante) {
      atualizar(assinante.id, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        documento: documento.trim(),
      })
    } else {
      criar({ nome, email, documento })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-lg rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-pink-soft)] text-[var(--color-pink)]">
            <UserPlus size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
              {editando ? 'Editar pessoa' : 'Nova pessoa para assinatura'}
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Assinante externo ao contrato usado nos fluxos de assinatura.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Nome completo
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: João da Silva"
              className="gt-input font-normal normal-case"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="assinante@dominio.com.br"
              className="gt-input font-normal normal-case"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            CPF
            <input
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="000.000.000-00"
              className="gt-input font-normal normal-case"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editando ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
