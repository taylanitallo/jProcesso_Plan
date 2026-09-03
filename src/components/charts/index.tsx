import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
)

const BLUE = '#2f6fd0'
const GREEN = '#22a06b'
const AMBER = '#d39a16'
const RED = '#c93645'
const PURPLE = '#7c3aed'

const legendBottom = {
  plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } } },
  maintainAspectRatio: false,
}

export function DonutChart({
  labels,
  data,
  colors = [GREEN, '#e5e9f0'],
  centerLabel,
}: {
  labels: string[]
  data: number[]
  colors?: string[]
  centerLabel?: string
}) {
  return (
    <div className="relative h-56">
      <Doughnut
        data={{ labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] }}
        options={{ ...legendBottom, cutout: '68%' }}
      />
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
          <span className="font-display text-2xl font-extrabold text-[var(--color-success)]">
            {centerLabel}
          </span>
        </div>
      )}
    </div>
  )
}

export function BarChart({
  labels,
  datasets,
}: {
  labels: string[]
  datasets: { label: string; data: number[]; color?: string }[]
}) {
  return (
    <div className="h-56">
      <Bar
        data={{
          labels,
          datasets: datasets.map((d, i) => ({
            label: d.label,
            data: d.data,
            backgroundColor: d.color ?? [BLUE, GREEN, AMBER, RED, PURPLE][i % 5],
          })),
        }}
        options={{ ...legendBottom, scales: { y: { beginAtZero: true } } }}
      />
    </div>
  )
}

export function LineChart({
  labels,
  data,
  label,
}: {
  labels: string[]
  data: number[]
  label: string
}) {
  return (
    <div className="h-56">
      <Line
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              borderColor: BLUE,
              backgroundColor: 'rgba(47,111,208,0.12)',
              tension: 0.3,
              fill: true,
            },
          ],
        }}
        options={{ ...legendBottom }}
      />
    </div>
  )
}
