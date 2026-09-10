import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { PERFIS } from '../../store/auth'
import { useOrganizacao } from '../../store/organizacao'
import { useUsuarios, type Usuario } from '../../store/usuarios'
import type { Perfil } from '../../types'

const PERFIL_LABELS = PERFIS.map((p) => p.label)
const labelDoPerfil = (p: Perfil) => PERFIS.find((x) => x.value === p)!.label
const perfilDoLabel = (l: string) => PERFIS.find((x) => x.label === l)?.value ?? 'USUARIO'

/** Cadastro / edição de usuário do contrato. Sem `usuario` = criar. */
export function NovoUsuarioModal({
  usuario,
  onClose,
}: {
  usuario?: Usuario
  onClose: () => void
}) {
  const criar = useUsuarios((s) => s.criar)
  const atualizar = useUsuarios((s) => s.atualizar)
  const unidades = useOrganizacao((s) => s.unidades)

  const [nome, setNome] = useState(usuario?.nome ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [perfil, setPerfil] = useState<Perfil>(usuario?.perfil ?? 'USUARIO')
  const [unidadeId, setUnidadeId] = useState(usuario?.unidadeId ?? '')

  const editando = Boolean(usuario)
  const unidadeNome = unidades.find((u) => u.id === unidadeId)?.nome ?? ''
  const podeSalvar = Boolean(nome.trim() && email.trim().includes('@'))

  const salvar = () => {
    if (!podeSalvar) return
    if (usuario) {
      atualizar(usuario.id, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        perfil,
        unidadeId,
      })
    } else {
      criar({ nome, email, perfil, unidadeId })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-lg rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <UserPlus size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
              {editando ? 'Editar usuário' : 'Novo usuário'}
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Defina os dados de acesso e o perfil do usuário no contrato.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Nome completo
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria Oliveira"
              className="gt-input font-normal normal-case"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@orgao.gov.br"
              className="gt-input font-normal normal-case"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Perfil
              <Combo
                value={labelDoPerfil(perfil)}
                onChange={(v) => setPerfil(perfilDoLabel(v))}
                options={PERFIL_LABELS}
                placeholder="Selecione o perfil"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Unidade Orçamentária
              <Combo
                value={unidadeNome}
                onChange={(v) =>
                  setUnidadeId(unidades.find((u) => u.nome === v)?.id ?? '')
                }
                options={unidades.map((u) => u.nome)}
                placeholder={unidades.length === 0 ? 'Nenhuma cadastrada' : 'Opcional'}
                disabled={unidades.length === 0}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editando ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
