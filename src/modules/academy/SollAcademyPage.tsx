import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { ACADEMY_RAILS, TRILHA_FASE_PREPARATORIA } from '../../mocks'
import { useAcademy, pctConcluido } from '../../store/academy'
import { TrilhaModal } from './TrilhaModal'

const TOTAL_AULAS = TRILHA_FASE_PREPARATORIA.aulas.reduce((n, a) => n + a.aulas, 0)

const THUMBS = [
  'linear-gradient(135deg,#22b8a6,#1f6fd0)',
  'linear-gradient(135deg,#7c3aed,#2f6fd0)',
  'linear-gradient(135deg,#1f9d55,#22b8a6)',
  'linear-gradient(135deg,#e0489a,#7c3aed)',
  'linear-gradient(135deg,#2f6fd0,#103b82)',
]

export function SollAcademyPage() {
  const [trilha, setTrilha] = useState<{ title: string; desc: string; thumb: string } | null>(null)
  const progresso = useAcademy((s) => s.progresso)
  const iniciadas = Object.values(progresso).filter((ids) => ids.length > 0).length

  return (
    <div className="flex flex-col gap-8">
      <header className="overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(135deg,#12203f_0%,#1b2f57_100%)] p-8 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold">
              A melhor capacitação em licitações do Brasil
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Aulas exclusivas com especialistas renomados, cobrindo tudo que você precisa:
              licitações, contratos, pregão, governança e muito mais. Comece sua trilha de
              aprendizado agora mesmo.
            </p>
          </div>
          <div className="flex gap-3">
            <HeroBox
              title="Minhas Trilhas"
              cta={iniciadas > 0 ? `${iniciadas} em andamento` : 'Acessar'}
            />
            <HeroBox title="Todas as Categorias" cta="Ver tudo" />
          </div>
        </div>
      </header>

      {ACADEMY_RAILS.map((rail, ri) => (
        <section key={rail.title} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#183263]">{rail.title}</h2>
            <button className="inline-flex items-center gap-1 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-strong)]">
              Ver tudo <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {rail.courses.map((c, ci) => {
              const thumb = THUMBS[(ri + ci) % THUMBS.length]
              return (
                <button
                  key={c.title}
                  onClick={() => setTrilha({ title: c.title, desc: c.desc, thumb })}
                  className="flex w-72 shrink-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
                >
                  <div
                    className="flex h-32 items-end p-3 text-sm font-bold text-white"
                    style={{ background: thumb }}
                  >
                    {c.title}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="text-sm font-bold text-[#183263]">{c.title}</h3>
                    <p className="line-clamp-3 text-xs text-[var(--color-muted)]">{c.desc}</p>
                    {(() => {
                      const pct = pctConcluido((progresso[c.title] ?? []).length, TOTAL_AULAS)
                      return (
                        <div className="mt-auto flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e6e9ef]">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#22b8a6,#1f6fd0)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-[10px] font-bold text-[var(--color-primary-strong)]">
                            {pct}%
                          </span>
                        </div>
                      )
                    })()}
                    <p className="text-[11px] text-[var(--color-muted)]">Autor: Negócios Públicos</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <footer className="rounded-[var(--radius-card)] bg-[linear-gradient(135deg,#12203f_0%,#1b2f57_100%)] p-8 text-center text-white">
        <h2 className="font-display text-xl font-extrabold">Aproveite todo o potencial da Soll Academy</h2>
        <p className="mt-1 text-sm text-white/80">
          Transforme seu conhecimento e alcance novos patamares na sua carreira
        </p>
      </footer>

      <TrilhaModal
        open={!!trilha}
        onClose={() => setTrilha(null)}
        title={trilha?.title ?? ''}
        desc={trilha?.desc ?? ''}
        thumb={trilha?.thumb ?? THUMBS[0]}
      />
    </div>
  )
}

function HeroBox({ title, cta }: { title: string; cta: string }) {
  return (
    <div className="min-w-44 rounded-[var(--radius-control)] border border-white/15 bg-white/10 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <button className="mt-2 rounded-[var(--radius-control)] bg-white px-3 py-1.5 text-xs font-bold text-[#183263]">
        {cta}
      </button>
    </div>
  )
}
