import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Play } from 'lucide-react'
import { findCourse, TRILHA_MODULOS } from '../../mocks'

export function TrilhaDetailPage() {
  const { slug = '' } = useParams()
  const course = findCourse(slug)
  const [openModule, setOpenModule] = useState(0)

  if (!course) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-[var(--color-muted)]">Trilha não encontrada.</p>
        <Link to="/SollAcademy" className="mt-2 inline-block font-semibold text-[var(--color-primary)]">
          ← Voltar para a Academy
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/SollAcademy"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
      >
        <ChevronLeft size={15} /> {course.rail}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
          <div className="grid aspect-video place-items-center bg-[linear-gradient(135deg,#12203f,#1b2f57)] text-white">
            <button className="grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur">
              <Play size={28} className="translate-x-0.5" />
            </button>
          </div>
          <div className="p-5">
            <h1 className="font-display text-xl font-extrabold text-[#183263]">{course.title}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{course.desc}</p>
            <p className="mt-3 text-[11px] text-[var(--color-muted)]">Autor: Negócios Públicos</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-line)] px-4 py-3">
            <p className="text-sm font-bold text-[#183263]">Conteúdo da trilha</p>
            <p className="text-xs text-[var(--color-muted)]">
              {TRILHA_MODULOS.length} módulos ·{' '}
              {TRILHA_MODULOS.reduce((n, m) => n + m.aulas, 0)} aulas
            </p>
          </div>
          <ul>
            {TRILHA_MODULOS.map((m, i) => (
              <li key={m.titulo} className="border-b border-[var(--color-line)] last:border-0">
                <button
                  onClick={() => setOpenModule((cur) => (cur === i ? -1 : i))}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm"
                >
                  <span className="font-semibold text-[var(--color-ink)]">
                    {i + 1}. {m.titulo}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[var(--color-muted)] transition ${
                      openModule === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openModule === i && (
                  <div className="px-4 pb-3 text-xs text-[var(--color-muted)]">
                    {m.aulas} aulas · {m.duracao}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
