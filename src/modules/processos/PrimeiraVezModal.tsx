import { useEffect, useState } from 'react'

/**
 * Modal automático exibido ao abrir um fluxo sem configuração — espelha
 * "Configurando Fluxo pela primeira vez" do SollAI. Cria uma config por
 * modelo (regras desativadas) e fecha sozinho ao concluir.
 */
export function PrimeiraVezModal({ total, onDone }: { total: number; onDone: () => void }) {
  const [feito, setFeito] = useState(0)

  useEffect(() => {
    if (feito >= total) {
      const t = setTimeout(onDone, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setFeito((n) => n + 1), 130)
    return () => clearTimeout(t)
  }, [feito, total, onDone])

  const pct = Math.round((feito / total) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-4 backdrop-blur-sm sm:p-10">
      <div className="my-8 w-full max-w-xl rounded-[16px] bg-white p-6 shadow-[var(--shadow-pop)]">
        <h3 className="font-display text-base font-bold text-[#183263]">
          Configurando Fluxo pela primeira vez
        </h3>
        <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          <p>
            Não encontramos configurações para este fluxo. Vamos criar uma configuração inicial para{' '}
            <strong className="text-[var(--color-ink)]">cada modelo de artefato</strong>.
          </p>
          <p>
            Criaremos uma configuração por modelo, com todas as regras{' '}
            <strong className="text-[var(--color-ink)]">desativadas por padrão</strong>.
          </p>
          <p>
            Você pode ajustar tudo de uma vez pelo{' '}
            <strong className="text-[var(--color-ink)]">Controle geral</strong>; as alterações serão
            aplicadas a todos os modelos.
          </p>
          <p>
            Se preferir, também dá para configurar{' '}
            <strong className="text-[var(--color-ink)]">modelo a modelo</strong>. Clique no cartão do
            artefato para abrir as opções.
          </p>
        </div>

        <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-muted)]">
            <span>Progresso:</span>
            <span className="text-[var(--color-ink)]">
              {feito} / {total}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dbe4f1]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Esta etapa é automática e rápida. Mantemos a tela bloqueada até concluir para garantir
          consistência.
        </p>
      </div>
    </div>
  )
}
