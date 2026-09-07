import { useState } from 'react'
import { CheckCircle2, Crown, FileSignature, Info, Pencil, Plus, ScrollText, Users } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../store/auth'
import { GerenciarCertificadosModal } from './GerenciarCertificadosModal'

const TABS = ['Gerenciamento de Usuários', 'Assinatura Eletrônica']

const LIMITS = [
  ['SollAI Chat', '0 de 3'],
  ['Processos Inteligentes', '0 de 3'],
  ['SollAI Academy', '0 de 3'],
  ['Analisadores Processo', '0 de 3'],
]

export function GerenciarUsuariosPage() {
  const user = useAuth((s) => s.user)
  const [tab, setTab] = useState(TABS[0])
  const [certModal, setCertModal] = useState(false)

  return (
    <div>
      <PageHeader
        title="Gerenciamento de Usuários"
        subtitle="Gerencie permissões e acesso dos usuários do sistema"
        center
      />

      <div className="mb-5 flex justify-center">
        <div className="flex rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[var(--radius-pill)] px-4 py-2 text-xs font-semibold transition ${
                tab === t
                  ? 'bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] text-white'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === TABS[0] ? (
        <>
          <div className="mb-4 flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <ul className="space-y-2 text-sm">
              {LIMITS.map(([label, val]) => (
                <li key={label} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--color-success)]" />
                  <span className="text-[var(--color-ink)]">{label}:</span>
                  <span className="font-semibold text-[var(--color-primary)]">{val}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <Users size={20} className="mx-auto text-[var(--color-muted)]" />
              <p className="text-xs text-[var(--color-muted)]">Total de Usuários</p>
              <p className="font-display text-2xl font-extrabold text-[var(--color-primary)]">0 de 3</p>
              <button className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2 text-sm font-semibold text-white">
                <Plus size={15} /> Novo Usuário
              </button>
            </div>
          </div>

          <div className="mb-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
            <div className="border-l-4 border-[#e0a92a] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e0a92a] text-sm font-bold text-white">
                    {user?.initials}
                  </span>
                  <div>
                    <p className="font-semibold uppercase text-[#183263]">{user?.name}</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-2.5 py-0.5 text-xs font-semibold text-white">
                      <Crown size={12} /> Gestor de Contrato
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setCertModal(true)}
                    title="Gerenciar certificados"
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]"
                  >
                    <ScrollText size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-2 rounded-[var(--radius-control)] bg-[#eef7f1] px-3 py-2 text-xs text-[var(--color-muted)]">
                <Info size={14} className="text-[var(--color-info)]" />
                Este usuário possui todas as permissões
              </p>
            </div>
          </div>

          <EmptyState icon={Users} title="Nenhum usuário encontrado!" />

          {certModal && (
            <GerenciarCertificadosModal
              pessoaId={user?.email ?? 'me'}
              pessoaNome={user?.name ?? ''}
              pessoaEmail={user?.email ?? ''}
              onClose={() => setCertModal(false)}
            />
          )}
        </>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                <FileSignature size={20} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Assinatura Eletrônica
                </p>
                <p className="font-display text-lg font-bold text-[#183263]">Pessoas para Assinatura</p>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2 text-sm font-semibold text-white">
              <Plus size={15} /> Nova Pessoa
            </button>
          </div>
          <EmptyState
            icon={FileSignature}
            title="Nenhum assinante externo cadastrado"
            subtitle="Registre certificados ao contrato para os fluxos de assinatura."
          />
        </div>
      )}
    </div>
  )
}
