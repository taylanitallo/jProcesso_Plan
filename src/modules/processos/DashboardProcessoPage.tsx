import type { ReactNode } from 'react'
import { AlertTriangle, Clock, FolderKanban } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { BarChart, DonutChart, LineChart } from '../../components/charts'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const criticosCols: Column<never>[] = [
  { key: 'processo', header: 'Processo' },
  { key: 'artefato', header: 'Artefato' },
  { key: 'etapa', header: 'Etapa atual' },
  { key: 'status', header: 'Status' },
  { key: 'responsavel', header: 'Responsável' },
  { key: 'atraso', header: 'Dias de atraso', align: 'right' },
]

export function DashboardProcessoPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard de Processos" subtitle="Acompanhe os KPIs e métricas de desempenho" />

      <Section title="Visão Geral">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Card>
              <div className="flex items-start gap-4">
                <IconBox color="#1f56ad">
                  <FolderKanban size={20} />
                </IconBox>
                <div className="grid flex-1 grid-cols-3 gap-3 text-sm">
                  <Kpi label="Total de Processos" value="1" />
                  <Kpi label="Total de Processos Ativos" value="1" />
                  <Kpi label="Total de Processos Finalizados" value="0" />
                </div>
              </div>
            </Card>
            <Card accent="#c93645">
              <div className="flex items-center gap-4">
                <IconBox color="#c93645">
                  <AlertTriangle size={20} />
                </IconBox>
                <Kpi label="Processos Atrasados" value="0" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <IconBox color="#198754">
                  <Clock size={20} />
                </IconBox>
                <Kpi label="Tempo Médio de Ciclo (TMC)" value="0 dias" />
              </div>
            </Card>
          </div>

          <Card title="Taxa de Cumprimento de Prazo (Geral)">
            <DonutChart
              labels={['Cumprido', 'Não Cumprido']}
              data={[100, 0]}
              centerLabel="100%"
            />
          </Card>
        </div>
      </Section>

      <Section title="Risco e Status">
        <Card title="Artefatos Críticos de Processos (Atrasados ou Em Risco)">
          <DataTable<never>
            columns={criticosCols}
            rows={[]}
            rowKey={() => ''}
            empty={<EmptyState title="Nenhum processo encontrado" />}
          />
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Distribuição por Status do Processo">
            <DonutChart labels={['Aguardando Envio']} data={[1]} colors={['#2f6fd0']} />
          </Card>
          <Card title="Risco por Etapa">
            <BarChart
              labels={['Aguardando Envio']}
              datasets={[
                { label: 'No Prazo', data: [1], color: '#22a06b' },
                { label: 'Em Risco', data: [0], color: '#d39a16' },
                { label: 'Atrasado', data: [0], color: '#c93645' },
              ]}
            />
          </Card>
        </div>
      </Section>

      <Section title="Eficiência e Desempenho">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Tempo Médio por Etapa/Artefato">
            <BarChart labels={['Enviado']} datasets={[{ label: 'Tempo Médio (dias)', data: [253] }]} />
          </Card>
          <Card title="Carga de Trabalho por Responsável">
            <BarChart
              labels={['ALEF']}
              datasets={[
                { label: 'No Prazo', data: [1], color: '#22a06b' },
                { label: 'Atrasado', data: [0], color: '#c93645' },
              ]}
            />
          </Card>
          <Card title="Índice de Retrabalho por Artefato">
            <BarChart labels={[]} datasets={[{ label: 'Índice de Retrabalho (%)', data: [], color: '#7c3aed' }]} />
          </Card>
          <Card title="Tendência do Tempo Médio de Ciclo (TMC)">
            <LineChart labels={MESES} data={MESES.map(() => 0)} label="Tempo Médio de Ciclo (dias)" />
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
