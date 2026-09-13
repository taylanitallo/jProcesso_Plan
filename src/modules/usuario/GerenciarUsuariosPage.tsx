import { useState } from 'react'
import {
  Ban,
  CheckCircle2,
  Crown,
  FileSignature,
  Info,
  Pencil,
  Plus,
  ScrollText,
  Trash2,
  Users,
} from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/common/Badge'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth, perfilLabel } from '../../store/auth'
import { useUi } from '../../store/ui'
import { useOrganizacao } from '../../store/organizacao'
import { useUsuarios, type Usuario } from '../../store/usuarios'
import { useAssinantes, type Assinante } from '../../store/assinantes'
import { GerenciarCertificadosModal } from './GerenciarCertificadosModal'
import { NovoUsuarioModal } from './NovoUsuarioModal'
import { NovoAssinanteModal } from './NovoAssinanteModal'

const TABS = ['Gerenciamento de Usuários', 'Assinatura Eletrônica']

const LIMITS = [
  ['SollAI Chat', '0 de 3'],
  ['Processos Inteligentes', '0 de 3'],
  ['SollAI Academy', '0 de 3'],
  ['Analisadores Processo', '0 de 3'],
]

const iniciais = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export function GerenciarUsuariosPage() {
  const user = useAuth((s) => s.user)
  const usuarios = useUsuarios((s) => s.usuarios)
  const remover = useUsuarios((s) => s.remover)
  const definirAtivo = useUsuarios((s) => s.definirAtivo)
  const setUserModal = useUi((s) => s.setUserModal)
  const unidades = useOrganizacao((s) => s.unidades)
  const assinantes = useAssinantes((s) => s.assinantes)
  const removerAssinante = useAssinantes((s) => s.remover)

  const [tab, setTab] = useState(TABS[0])
  const [certModal, setCertModal] = useState(false)
  const [modal, setModal] = useState<'none' | 'novo'>('none')
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)
  const [assinanteModal, setAssinanteModal] = useState(false)
  const [assinanteEdit, setAssinanteEdit] = useState<Assinante | null>(null)
  const [assinanteExcluirId, setAssinanteExcluirId] = useState<string | null>(null)
  const [certAssinante, setCertAssinante] = useState<Assinante | null>(null)

  const assinanteExcluirAlvo = assinantes.find((a) => a.id === assinanteExcluirId) ?? null

  const total = 1 + usuarios.length
  const excluirAlvo = usuarios.find((u) => u.id === excluirId) ?? null
  const nomeUnidade = (id: string) => unidades.find((u) => u.id === id)?.nome ?? ''

  return (
    <div>
      <PageHeader
        title="Gerenciamento de Usuários"
        subtitle="Gerencie permissões e acesso dos usuários do sistema"
        icon={Users}
        accent="violet"
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
              <p className="font-display text-2xl font-extrabold text-[var(--color-primary)]">
                {total}
              </p>
              <button
                onClick={() => {
                  setEditando(null)
                  setModal('novo')
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2 text-sm font-semibold text-white"
              >
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
                  <button
                    onClick={() => setUserModal('perfil')}
                    title="Editar meus dados"
                    className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
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

          {usuarios.length === 0 ? (
            <EmptyState icon={Users} title="Nenhum usuário adicional cadastrado" />
          ) : (
            <ul className="flex flex-col gap-2">
              {usuarios.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-primary-soft)] text-sm font-bold text-[var(--color-primary-strong)]">
                      {iniciais(u.nome)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#183263]">{u.nome}</p>
                      <p className="truncate text-xs text-[var(--color-muted)]">{u.email}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge tone={u.ativo ? 'info' : 'neutral'}>{perfilLabel(u.perfil)}</Badge>
                        {u.unidadeId && nomeUnidade(u.unidadeId) && (
                          <span className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
                            {nomeUnidade(u.unidadeId)}
                          </span>
                        )}
                        {!u.ativo && (
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => definirAtivo(u.id, !u.ativo)}
                      aria-label={u.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                      title={u.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                      className={`grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border ${
                        u.ativo
                          ? 'border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                          : 'border-[#a9d9c1] text-[var(--color-success)]'
                      }`}
                    >
                      {u.ativo ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setEditando(u)
                        setModal('novo')
                      }}
                      aria-label="Editar usuário"
                      className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setExcluirId(u.id)}
                      aria-label="Excluir usuário"
                      className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {modal === 'novo' && (
            <NovoUsuarioModal
              usuario={editando ?? undefined}
              onClose={() => {
                setModal('none')
                setEditando(null)
              }}
            />
          )}

          {excluirAlvo && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setExcluirId(null)
              }}
            >
              <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
                  <Trash2 size={24} />
                </span>
                <p className="mt-3 font-display text-base font-bold text-[#183263]">
                  Excluir usuário?
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  <strong>{excluirAlvo.nome}</strong> perderá o acesso ao contrato. Esta ação não pode
                  ser desfeita.
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <button
                    onClick={() => setExcluirId(null)}
                    className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      remover(excluirAlvo.id)
                      setExcluirId(null)
                    }}
                    className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
                  >
                    Sim, excluir
                  </button>
                </div>
              </div>
            </div>
          )}

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
            <button
              onClick={() => {
                setAssinanteEdit(null)
                setAssinanteModal(true)
              }}
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={15} /> Nova Pessoa
            </button>
          </div>

          {assinantes.length === 0 ? (
            <EmptyState
              icon={FileSignature}
              title="Nenhum assinante externo cadastrado"
              subtitle="Registre certificados ao contrato para os fluxos de assinatura."
            />
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {assinantes.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-primary-soft)] text-sm font-bold text-[var(--color-primary-strong)]">
                      {iniciais(a.nome)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#183263]">{a.nome}</p>
                      <p className="truncate text-xs text-[var(--color-muted)]">{a.email}</p>
                      {a.documento && (
                        <p className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
                          CPF {a.documento}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setCertAssinante(a)}
                      title="Gerenciar certificados"
                      className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    >
                      <ScrollText size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setAssinanteEdit(a)
                        setAssinanteModal(true)
                      }}
                      aria-label="Editar pessoa"
                      className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setAssinanteExcluirId(a.id)}
                      aria-label="Excluir pessoa"
                      className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {assinanteModal && (
            <NovoAssinanteModal
              assinante={assinanteEdit ?? undefined}
              onClose={() => {
                setAssinanteModal(false)
                setAssinanteEdit(null)
              }}
            />
          )}

          {certAssinante && (
            <GerenciarCertificadosModal
              pessoaId={certAssinante.id}
              pessoaNome={certAssinante.nome}
              pessoaEmail={certAssinante.email}
              onClose={() => setCertAssinante(null)}
            />
          )}

          {assinanteExcluirAlvo && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setAssinanteExcluirId(null)
              }}
            >
              <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
                  <Trash2 size={24} />
                </span>
                <p className="mt-3 font-display text-base font-bold text-[#183263]">
                  Excluir pessoa?
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  <strong>{assinanteExcluirAlvo.nome}</strong> deixará de estar disponível para os
                  fluxos de assinatura.
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <button
                    onClick={() => setAssinanteExcluirId(null)}
                    className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      removerAssinante(assinanteExcluirAlvo.id)
                      setAssinanteExcluirId(null)
                    }}
                    className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
                  >
                    Sim, excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
