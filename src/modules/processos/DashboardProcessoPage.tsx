import { useMemo, type ReactNode } from 'react'
import { AlertTriangle, Clock, FolderKanban } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/common/Badge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { BarChart, DonutChart, LineChart } from '../../components/charts'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { PROCESSO_ARTEFATOS } from '../../mocks'
import { useProcessos, type ProcessoLocal } from '../../store/processos'

const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const PALETA = ['#2f6fd0', '#22a06b', '#d39a16', '#7c3aed', '#c93645', '#0ea5b5', '#e5e9f0']

type CriticoRow = {
  id: string
  processo: string
  artefato: string
  etapa: string
  status: string
  responsavel: string
  atraso: number
}

const criticosCols: Column<CriticoRow>[] = [
  { key: 'processo', header: 'Processo' },
  { key: 'artefato', header: 'Artefato' },
  { key: 'etapa', header: 'Etapa atual' },
  { key: 'status', header: 'Status', render: () => <Badge tone="danger">Atrasado</Badge> },
  { key: 'responsavel', header: 'Responsável' },
  { key: 'atraso', header: 'Dias de atraso', align: 'right', render: (r) => r.atraso },
]

/** Aceita `dd/mm/aaaa` e `dd/mm/aaaa HH:MM`. */
function parseData(s: string): Date | null {
  const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return Number.isNaN(d.getTime()) ? null : d
}

function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

/** 1º artefato do template ainda não enviado. */
function etapaAtual(p: ProcessoLocal): string {
  const pendente = p.artefatos.find((a) => !a.enviado)
  return pendente ? pendente.nome : 'Concluído'
}

export function DashboardProcessoPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const processos = useProcessos((s) => s.processos)

  const m = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const ativos = processos.filter((p) => p.status === 'ATIVO')
    const finalizados = processos.filter((p) => p.status === 'FINALIZADO')
    const nomesArt = PROCESSO_ARTEFATOS.map((a) => a.nome)

    // --- TMC (ciclo dos finalizados) ---
    const ciclos = finalizados
      .map((p) => {
        const ini = parseData(p.criadoEm)
        const fim = parseData(p.atualizadoEm)
        return ini && fim ? diasEntre(ini, fim) : null
      })
      .filter((n): n is number => n != null)
    const tmc = ciclos.length
      ? Math.round(ciclos.reduce((a, b) => a + b, 0) / ciclos.length)
      : 0

    // --- artefatos com prazo digitado ---
    const comPrazo: { enviado: boolean }[] = []
    processos.forEach((p) =>
      p.artefatos.forEach((a) => {
        if (parseData(a.prazo)) comPrazo.push({ enviado: a.enviado })
      }),
    )
    const cumprimento = comPrazo.length
      ? Math.round((comPrazo.filter((a) => a.enviado).length / comPrazo.length) * 100)
      : null

    const atrasados = ativos.filter((p) =>
      p.artefatos.some((a) => {
        const d = parseData(a.prazo)
        return !a.enviado && d != null && diasEntre(hoje, d) < 0
      }),
    ).length

    // --- artefatos críticos (ativos, não enviados, prazo vencido) ---
    const criticos: CriticoRow[] = []
    ativos.forEach((p) =>
      p.artefatos.forEach((a) => {
        const d = parseData(a.prazo)
        if (a.enviado || !d) return
        const atraso = diasEntre(hoje, d)
        if (atraso >= 0) return
        criticos.push({
          id: `${p.id}-${a.completo}`,
          processo: p.nome,
          artefato: a.nome,
          etapa: etapaAtual(p),
          status: 'Atrasado',
          responsavel: a.responsavel || 'Não designado',
          atraso: Math.abs(atraso),
        })
      }),
    )
    criticos.sort((x, y) => y.atraso - x.atraso)

    // --- etapa atual dos ativos ---
    const etapaCount = new Map<string, number>()
    ativos.forEach((p) => {
      const e = etapaAtual(p)
      etapaCount.set(e, (etapaCount.get(e) ?? 0) + 1)
    })
    const etapas = [...etapaCount.keys()]

    // distribuição por status: etapa atual + fatia finalizado
    const statusLabels = [...etapas]
    const statusData = etapas.map((e) => etapaCount.get(e) as number)
    if (finalizados.length) {
      statusLabels.push('Finalizado')
      statusData.push(finalizados.length)
    }

    // risco por etapa
    const noPrazo: number[] = []
    const emRisco: number[] = []
    const atrasado: number[] = []
    etapas.forEach((e) => {
      let np = 0
      let er = 0
      let at = 0
      ativos
        .filter((p) => etapaAtual(p) === e)
        .forEach((p) => {
          const art = p.artefatos.find((a) => !a.enviado)
          const d = art ? parseData(art.prazo) : null
          const dd = d ? diasEntre(hoje, d) : null
          if (dd != null && dd < 0) at += 1
          else if (dd != null && dd <= 3) er += 1
          else np += 1
        })
      noPrazo.push(np)
      emRisco.push(er)
      atrasado.push(at)
    })

    // enviados por etapa (funil de progresso)
    const enviadosPorArt = nomesArt.map(
      (nome) =>
        processos.filter((p) => p.artefatos.some((a) => a.nome === nome && a.enviado)).length,
    )

    // carga por responsável
    const cargaMap = new Map<string, { enviado: number; pendente: number }>()
    processos.forEach((p) =>
      p.artefatos.forEach((a) => {
        if (!a.responsavel) return
        const cur = cargaMap.get(a.responsavel) ?? { enviado: 0, pendente: 0 }
        if (a.enviado) cur.enviado += 1
        else cur.pendente += 1
        cargaMap.set(a.responsavel, cur)
      }),
    )
    const respLabels = [...cargaMap.keys()]
    const cargaEnviado = respLabels.map((r) => cargaMap.get(r)!.enviado)
    const cargaPendente = respLabels.map((r) => cargaMap.get(r)!.pendente)

    // retrabalho por artefato (só os que têm ocorrência)
    const retLabels: string[] = []
    const retData: number[] = []
    nomesArt.forEach((nome) => {
      const n = processos.filter((p) =>
        p.artefatos.some((a) => a.nome === nome && a.revisao),
      ).length
      if (n > 0) {
        retLabels.push(nome)
        retData.push(n)
      }
    })

    // tendência do TMC — meses do ano corrente
    const anoAtual = new Date().getFullYear()
    const somaMes = Array(12).fill(0)
    const cntMes = Array(12).fill(0)
    finalizados.forEach((p) => {
      const ini = parseData(p.criadoEm)
      const fim = parseData(p.atualizadoEm)
      if (!ini || !fim || fim.getFullYear() !== anoAtual) return
      somaMes[fim.getMonth()] += diasEntre(ini, fim)
      cntMes[fim.getMonth()] += 1
    })
    const tendencia = somaMes.map((s, i) => (cntMes[i] ? Math.round(s / cntMes[i]) : 0))

    return {
      total: processos.length,
      ativos: ativos.length,
      finalizados: finalizados.length,
      atrasados,
      tmc,
      cumprimento,
      criticos,
      statusLabels,
      statusData,
      etapas,
      noPrazo,
      emRisco,
      atrasado,
      nomesArt,
      enviadosPorArt,
      respLabels,
      cargaEnviado,
      cargaPendente,
      retLabels,
      retData,
      tendencia,
    }
  }, [processos])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard de Processos" subtitle="Acompanhe os KPIs e métricas de desempenho" />

      <Section title="Visão Geral">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Card>
              <div className="flex items-start gap-4">
                <IconBox color="#1f56ad">
                  <FolderKanban size={20} />
                </IconBox>
                <div className="grid flex-1 grid-cols-3 gap-3 text-sm">
                  <Kpi label="Total de Processos" value={String(m.total)} />
                  <Kpi label="Total de Processos Ativos" value={String(m.ativos)} />
                  <Kpi label="Total de Processos Finalizados" value={String(m.finalizados)} />
                </div>
              </div>
            </Card>
            <Card accent="#c93645">
              <div className="flex items-center gap-4">
                <IconBox color="#c93645">
                  <AlertTriangle size={20} />
                </IconBox>
                <Kpi label="Processos Atrasados" value={String(m.atrasados)} />
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <IconBox color="#198754">
                  <Clock size={20} />
                </IconBox>
                <Kpi label="Tempo Médio de Ciclo (TMC)" value={`${m.tmc} dias`} />
              </div>
            </Card>
          </div>

          <Card title="Taxa de Cumprimento de Prazo (Geral)">
            {m.cumprimento == null ? (
              <DonutChart
                labels={['Sem prazo definido']}
                data={[1]}
                colors={['#e5e9f0']}
                centerLabel="n/d"
              />
            ) : (
              <DonutChart
                labels={['Cumprido', 'Não Cumprido']}
                data={[m.cumprimento, 100 - m.cumprimento]}
                centerLabel={`${m.cumprimento}%`}
              />
            )}
          </Card>
        </div>
      </Section>

      <Section title="Risco e Status">
        <Card title="Artefatos Críticos de Processos (Atrasados ou Em Risco)">
          <DataTable<CriticoRow>
            columns={criticosCols}
            rows={m.criticos}
            rowKey={(r) => r.id}
            empty={<EmptyState title="Nenhum artefato atrasado" />}
          />
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Distribuição por Status do Processo">
            {m.statusData.length ? (
              <DonutChart labels={m.statusLabels} data={m.statusData} colors={PALETA} />
            ) : (
              <EmptyState title="Nenhum processo" />
            )}
          </Card>
          <Card title="Risco por Etapa">
            {m.etapas.length ? (
              <BarChart
                labels={m.etapas}
                datasets={[
                  { label: 'No Prazo', data: m.noPrazo, color: '#22a06b' },
                  { label: 'Em Risco', data: m.emRisco, color: '#d39a16' },
                  { label: 'Atrasado', data: m.atrasado, color: '#c93645' },
                ]}
              />
            ) : (
              <EmptyState title="Nenhum processo ativo" />
            )}
          </Card>
        </div>
      </Section>

      <Section title="Eficiência e Desempenho">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Artefatos Enviados por Etapa">
            <BarChart
              labels={m.nomesArt}
              datasets={[{ label: 'Enviados', data: m.enviadosPorArt, color: '#22a06b' }]}
            />
          </Card>
          <Card title="Carga de Trabalho por Responsável">
            {m.respLabels.length ? (
              <BarChart
                labels={m.respLabels}
                datasets={[
                  { label: 'Enviado', data: m.cargaEnviado, color: '#22a06b' },
                  { label: 'Pendente', data: m.cargaPendente, color: '#d39a16' },
                ]}
              />
            ) : (
              <EmptyState title="Nenhum artefato designado" />
            )}
          </Card>
          <Card title="Índice de Retrabalho por Artefato">
            {m.retLabels.length ? (
              <BarChart
                labels={m.retLabels}
                datasets={[{ label: 'Processos com revisão', data: m.retData, color: '#7c3aed' }]}
              />
            ) : (
              <EmptyState title="Nenhum retrabalho registrado" />
            )}
          </Card>
          <Card title="Tendência do Tempo Médio de Ciclo (TMC)">
            <LineChart
              labels={MESES_CURTOS}
              data={m.tendencia}
              label="Tempo Médio de Ciclo (dias)"
            />
          </Card>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-[var(--color-line)] pb-2 font-display text-lg font-bold text-[#183263]">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Card({
  title,
  accent,
  children,
}: {
  title?: string
  accent?: string
  children: ReactNode
}) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
    >
      {title && <h3 className="mb-3 text-sm font-bold text-[#183263]">{title}</h3>}
      {children}
    </div>
  )
}

function IconBox({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] text-white"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="font-display text-xl font-extrabold text-[#183263]">{value}</p>
    </div>
  )
}
