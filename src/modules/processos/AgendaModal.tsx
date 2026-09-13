import { useMemo, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, UserRound, X } from 'lucide-react'
import { useProcessos } from '../../store/processos'

const WEEK = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']

/** Aceita `dd/mm/aaaa` e `dd/mm/aaaa HH:MM`. */
function parseData(s: string): Date | null {
  const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return Number.isNaN(d.getTime()) ? null : d
}

const chave = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

/** Grade de 42 células a partir do domingo anterior ao dia 1 do mês. */
function buildGrid(base: Date) {
  const first = new Date(base.getFullYear(), base.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

type Evento = {
  id: string
  date: Date
  processoId: string
  processo: string
  numero: string
  artefato: string
  responsavel: string
  enviado: boolean
}

export function AgendaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const processos = useProcessos((s) => s.processos)
  const [ref, setRef] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })

  const eventos = useMemo<Evento[]>(
    () =>
      processos.flatMap((p) =>
        p.artefatos.flatMap((a) => {
          const d = parseData(a.prazo)
          if (!d) return []
          return [
            {
              id: `${p.id}-${a.completo}`,
              date: d,
              processoId: p.id,
              processo: p.nome,
              numero: p.numero,
              artefato: a.nome,
              responsavel: a.responsavel,
              enviado: a.enviado,
            },
          ]
        }),
      ),
    [processos],
  )

  const porDia = useMemo(() => {
    const m = new Map<string, Evento[]>()
    for (const e of eventos) {
      const k = chave(e.date)
      const arr = m.get(k)
      if (arr) arr.push(e)
      else m.set(k, [e])
    }
    return m
  }, [eventos])

  const doMes = useMemo(
    () =>
      eventos
        .filter((e) => e.date.getMonth() === ref.getMonth() && e.date.getFullYear() === ref.getFullYear())
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [eventos, ref],
  )

  if (!open) return null

  const now = new Date()
  const cells = buildGrid(ref)
  const monthLabel = ref.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()
  const irMes = (delta: number) =>
    setRef((r) => new Date(r.getFullYear(), r.getMonth() + delta, 1))

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-4 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-[1320px] rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-center gap-3 pr-8">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--color-indigo-soft)] text-[var(--color-indigo)]">
            <Calendar size={20} />
          </span>
          <h3 className="font-display text-base font-bold text-[#183263]">Agenda de Prazos</h3>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setRef(new Date(now.getFullYear(), now.getMonth(), 1))}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-sm font-semibold text-[var(--color-primary-strong)]"
          >
            <Calendar size={15} /> Hoje
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => irMes(-1)}
              aria-label="Mês anterior"
              className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-white">
              {monthLabel} <Calendar size={14} />
            </span>
            <button
              onClick={() => irMes(1)}
              aria-label="Próximo mês"
              className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]"
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <span className="text-xs font-semibold text-[var(--color-muted)]">
            {doMes.length} prazo{doMes.length === 1 ? '' : 's'} neste mês
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {WEEK.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const outside = d.getMonth() !== ref.getMonth()
            const today = d.toDateString() === now.toDateString()
            const evs = porDia.get(chave(d)) ?? []
            return (
              <div
                key={i}
                className={`min-h-[92px] rounded-[10px] border p-2 text-xs ${
                  today
                    ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--color-line)]'
                } ${outside ? 'bg-[#f6f8fc] text-[var(--color-muted)]' : 'bg-white text-[var(--color-ink)]'}`}
              >
                <span className="font-semibold">{d.getDate()}</span>
                <div className="mt-1 flex flex-col gap-1">
                  {evs.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      title={`${e.artefato} — ${e.processo}`}
                      className={`truncate rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold ${
                        e.enviado
                          ? 'bg-[#e4f4ec] text-[var(--color-success)]'
                          : 'bg-[#fdf1dc] text-[#a3720c]'
                      }`}
                    >
                      {e.artefato}
                    </span>
                  ))}
                  {evs.length > 2 && (
                    <span className="text-[10px] font-semibold text-[var(--color-muted)]">
                      +{evs.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <h4 className="mb-2 font-display text-sm font-bold text-[#183263]">Prazos do mês</h4>
          {doMes.length === 0 ? (
            <p className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] px-3 py-4 text-center text-sm text-[var(--color-muted)]">
              Nenhum artefato com prazo definido neste mês.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {doMes.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="grid h-7 w-9 shrink-0 place-items-center rounded-[8px] bg-[var(--color-primary-soft)] text-xs font-bold text-[var(--color-primary-strong)]">
                      {e.date.getDate()}/{e.date.getMonth() + 1}
                    </span>
                    <span className="font-semibold text-[var(--color-ink)]">{e.artefato}</span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {e.numero} — {e.processo}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={11} /> {e.responsavel || 'Não designado'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        e.enviado ? 'text-[var(--color-success)]' : 'text-[#a3720c]'
                      }`}
                    >
                      <Clock size={11} /> {e.enviado ? 'Enviado' : 'Pendente'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
