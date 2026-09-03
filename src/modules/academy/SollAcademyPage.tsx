import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ACADEMY_RAILS, courseSlug } from '../../mocks'

const THUMBS = [
  'linear-gradient(135deg,#22b8a6,#1f6fd0)',
  'linear-gradient(135deg,#7c3aed,#2f6fd0)',
  'linear-gradient(135deg,#1f9d55,#22b8a6)',
  'linear-gradient(135deg,#e0489a,#7c3aed)',
  'linear-gradient(135deg,#2f6fd0,#103b82)',
]

export function SollAcademyPage() {
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
            <HeroBox title="Minhas Trilhas" cta="Acessar" />
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
            {rail.courses.map((c, ci) => (
              <Link
                key={c.title}
                to={`/SollAcademy/${courseSlug(c.title)}`}
                className="flex w-72 shrink-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
              >
                <div
                  className="flex h-32 items-end p-3 text-sm font-bold text-white"
                  style={{ background: THUMBS[(ri + ci) % THUMBS.length] }}
                >
                  {c.title}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-bold text-[#183263]">{c.title}</h3>
                  <p className="line-clamp-3 text-xs text-[var(--color-muted)]">{c.desc}</p>
                  <p className="mt-auto text-[11px] text-[var(--color-muted)]">Autor: Negócios Públicos</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <footer className="rounded-[var(--radius-card)] bg-[linear-gradient(135deg,#12203f_0%,#1b2f57_100%)] p-8 text-center text-white">
        <h2 className="font-display text-xl font-extrabold">Aproveite todo o potencial da Soll Academy</h2>
        <p className="mt-1 text-sm text-white/80">
          Transforme seu conhecimento e alcance novos patamares na sua carreira
        </p>
      </footer>
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
