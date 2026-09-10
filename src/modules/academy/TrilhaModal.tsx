import { useState } from 'react'
import { CheckCircle2, ChevronDown, Circle, X } from 'lucide-react'
import { TRILHA_FASE_PREPARATORIA } from '../../mocks'
import { useAcademy, pctConcluido } from '../../store/academy'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  desc: string
  thumb: string
}

const aulaId = (sessao: number, n: number) => `s${sessao}-a${n}`

export function TrilhaModal({ open, onClose, title, desc, thumb }: Props) {
  const [openSession, setOpenSession] = useState<number>(-1)
  const progresso = useAcademy((s) => s.progresso)
  const alternar = useAcademy((s) => s.alternar)

  const trilha = TRILHA_FASE_PREPARATORIA
  const totalAulas = trilha.aulas.reduce((n, a) => n + a.aulas, 0)
  const concluidas = progresso[title] ?? []
  const feitas = concluidas.length
  const pct = pctConcluido(feitas, totalAulas)

  const irParaTrilha = () => {
    const idx = trilha.aulas.findIndex((s, i) =>
      Array.from({ length: s.aulas }, (_, k) => aulaId(i, k + 1)).some(
        (id) => !concluidas.includes(id),
      ),
    )
    setOpenSession(idx === -1 ? 0 : idx)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.65)] p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-pop)]">
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

          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e6e9ef]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#22b8a6,#1f6fd0)] transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold text-[var(--color-primary-strong)]">
              {pct}% · {feitas}/{totalAulas} aulas
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-y border-[var(--color-line)] py-3 text-xs">
            <Meta label="Autor" value="Negócios Públicos" />
            <Meta label="Duração total" value={trilha.duracaoTotal} />
            <Meta label="Sessões" value={String(trilha.sessoes)} />
          </div>

          <ul className="mt-3">
            {trilha.aulas.map((a, i) => {
              const ids = Array.from({ length: a.aulas }, (_, k) => aulaId(i, k + 1))
              const feitasSessao = ids.filter((id) => concluidas.includes(id)).length
              return (
                <li key={a.titulo} className="border-b border-[var(--color-line)] last:border-0">
                  <button
                    onClick={() => setOpenSession((cur) => (cur === i ? -1 : i))}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                      {feitasSessao === a.aulas ? (
                        <CheckCircle2 size={15} className="shrink-0 text-[var(--color-success)]" />
                      ) : (
                        <Circle size={15} className="shrink-0 text-[var(--color-muted)]" />
                      )}
                      {a.titulo}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--color-muted)]">
                      {feitasSessao}/{a.aulas} · {a.minutos} min
                      <ChevronDown
                        size={15}
                        className={`transition ${openSession === i ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>

                  {openSession === i && (
                    <ul className="mb-3 flex flex-col gap-1.5 pl-6">
                      {ids.map((id, k) => {
                        const feito = concluidas.includes(id)
                        return (
                          <li key={id}>
                            <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-control)] px-2 py-1.5 text-[13px] hover:bg-[#f8fafd]">
                              <input
                                type="checkbox"
                                checked={feito}
                                onChange={() => alternar(title, id)}
                                className="h-4 w-4 accent-[var(--color-primary)]"
                              />
                              <span
                                className={
                                  feito ? 'text-[var(--color-muted)] line-through' : 'text-[var(--color-ink)]'
                                }
                              >
                                Aula {k + 1}
                              </span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={irParaTrilha}
              className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft)]"
            >
              {feitas === 0 ? 'Seguir Trilha' : 'Continuar de onde parei'}
            </button>
            <button
              onClick={irParaTrilha}
              className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-5 py-2 text-sm font-semibold text-white"
            >
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
