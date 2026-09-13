import { useState } from 'react'
import { MessageSquareReply, X } from 'lucide-react'
import { useSolicitacoes, type Solicitacao } from '../../store/solicitacoes'

/** Responder / ver resposta de uma Solicitação de Preenchimento. Sem RBAC — usuário único. */
export function ResponderSolicitacaoModal({
  solicitacao,
  onClose,
}: {
  solicitacao: Solicitacao | null
  onClose: () => void
}) {
  const responder = useSolicitacoes((s) => s.responder)
  const [texto, setTexto] = useState('')

  if (!solicitacao) return null

  const respondida = solicitacao.status === 'RESPONDIDA'

  const enviar = () => {
    if (!texto.trim()) return
    responder(solicitacao.id, texto)
    setTexto('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
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
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-teal-soft)] text-[var(--color-teal)]">
            <MessageSquareReply size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
              {respondida ? 'Resposta da solicitação' : 'Responder solicitação'}
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              {solicitacao.processoNumero} — {solicitacao.processoNome}
            </p>
          </div>
        </div>

        <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="font-semibold text-[var(--color-muted)]">Setor</dt>
          <dd className="text-[var(--color-ink)]">{solicitacao.setor}</dd>
          <dt className="font-semibold text-[var(--color-muted)]">Aberta em</dt>
          <dd className="text-[var(--color-ink)]">{solicitacao.criadoEm}</dd>
          {respondida && (
            <>
              <dt className="font-semibold text-[var(--color-muted)]">Respondida em</dt>
              <dd className="text-[var(--color-ink)]">{solicitacao.respondidoEm}</dd>
            </>
          )}
        </dl>

        {solicitacao.descricao && (
          <div className="mb-4 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] px-3 py-2.5 text-sm text-[var(--color-ink)]">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Orientação
            </p>
            {solicitacao.descricao}
          </div>
        )}

        {respondida ? (
          <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 text-sm text-[var(--color-ink)]">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Resposta
            </p>
            {solicitacao.resposta || '—'}
          </div>
        ) : (
          <>
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Resposta do setor
              <textarea
                rows={4}
                maxLength={1000}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Descreva o que foi levantado / preenchido…"
                className="gt-input resize-y font-normal normal-case"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                onClick={enviar}
                disabled={!texto.trim()}
                className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Responder
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
