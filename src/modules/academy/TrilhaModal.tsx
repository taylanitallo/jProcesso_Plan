import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { TRILHA_FASE_PREPARATORIA } from '../../mocks'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  desc: string
  thumb: string
}

export function TrilhaModal({ open, onClose, title, desc, thumb }: Props) {
  const [openSession, setOpenSession] = useState<number>(-1)
  const trilha = TRILHA_FASE_PREPARATORIA
  const totalAulas = trilha.aulas.reduce((n, a) => n + a.aulas, 0)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.65)] p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div
          className="flex h-48 items-end p-6 font-display text-2xl font-extrabold text-white"
          style={{ background: thumb }}
        >
          {title}
        </div>

        <div className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Trilha selecionada
          </p>
          <h3 className="font-display text-xl font-extrabold text-[#183263]">{title}</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{desc}</p>

          <div className="mt-4 grid grid-cols-3 gap-4 border-y border-[var(--color-line)] py-3 text-xs">
            <Meta label="Autor" value="Negócios Públicos" />
            <Meta label="Duração total" value={trilha.duracaoTotal} />
            <Meta label="Sessões" value={String(trilha.sessoes)} />
          </div>

          <ul className="mt-3">
            {trilha.aulas.map((a, i) => (
              <li key={a.titulo} className="border-b border-[var(--color-line)] last:border-0">
                <button
                  onClick={() => setOpenSession((cur) => (cur === i ? -1 : i))}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm"
                >
                  <span className="font-medium text-[var(--color-ink)]">{a.titulo}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--color-muted)]">
                    {a.aulas} {a.aulas === 1 ? 'Aula' : 'Aulas'} · {a.minutos} Minutos
                    <ChevronDown
                      size={15}
                      className={`transition ${openSession === i ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft)]">
              Seguir Trilha
            </button>
            <button className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-5 py-2 text-sm font-semibold text-white">
              Ir para a Trilha
            </button>
          </div>

          <p className="mt-3 text-right text-[11px] text-[var(--color-muted)]">
            {trilha.sessoes} sessões · {totalAulas} aulas
          </p>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-0.5 font-bold text-[#183263]">{value}</p>
    </div>
  )
}
