import { useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'

const TABS = ['Unidades', 'Setores']

export function GerenciarUnidadeSetorPage() {
  const [tab, setTab] = useState(TABS[0])
  const isUnidade = tab === 'Unidades'

  return (
    <div>
      <PageHeader
        title="Gerenciamento de Unidade e Setor"
        subtitle="Gerencie os Unidades e Setores da instituição"
        actions={
          <div className="flex rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-[var(--radius-pill)] px-4 py-1.5 text-xs font-semibold transition ${
                  tab === t
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
              <Building2 size={20} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                {isUnidade ? 'Unidades' : 'Setores'}
              </p>
              <p className="font-display text-lg font-bold text-[#183263]">
                {isUnidade ? 'Unidades da instituição' : 'Setores da instituição'}
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2 text-sm font-semibold text-white">
            <Plus size={15} /> {isUnidade ? 'Nova Unidade' : 'Novo Setor'}
          </button>
        </div>
        <EmptyState
          icon={Building2}
          title={isUnidade ? 'Nenhuma unidade cadastrada' : 'Nenhum setor cadastrado'}
          subtitle={isUnidade ? 'Registre as unidades da instituição.' : 'Registre os setores da instituição.'}
        />
      </div>
    </div>
  )
}
