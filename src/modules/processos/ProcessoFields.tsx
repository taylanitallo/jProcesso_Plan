import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { PROCESSO_TIPOS } from '../../mocks'
import { useWorkflows } from '../../store/workflows'
import { useOrganizacao } from '../../store/organizacao'
import { useAuth } from '../../store/auth'
import type { ProcessoFormValue } from './processoForm'

/**
 * Campos da aba "Processo" — compartilhados pelos três modos de criação de
 * Processo Inteligente (manual, a partir de registros, com solicitação).
 * Controlado: estado vive no modal pai.
 */
export function ProcessoFields({
  value,
  onChange,
  unidadeBloqueada,
}: {
  value: ProcessoFormValue
  onChange: (patch: Partial<ProcessoFormValue>) => void
  /** Trava a Unidade Orçamentária (ex.: quando o DFD foi puxado de um PCA de uma unidade específica). */
  unidadeBloqueada?: boolean
}) {
  const workflows = useWorkflows((s) => s.workflows)
  const unidades = useOrganizacao((s) => s.unidades)
  const user = useAuth((s) => s.user)
  const isAdmin = user?.perfil === 'ADMIN_GERAL'
  const fluxoLiberado = Boolean(value.legislacao && value.tipo)
  const fluxoOptions = useMemo(
    () =>
      workflows
        .filter(
          (w) => w.ativo && w.legislacao === value.legislacao && w.tipo === value.tipo,
        )
        .map((w) => w.nome),
    [workflows, value.legislacao, value.tipo],
  )

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="NÚMERO DO PROCESSO"
            placeholder="Digite o número do processo"
            value={value.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Labelled label="TIPO DE PROCESSO">
            <Combo
              value={value.tipo}
              onChange={(v) => onChange({ tipo: v, fluxo: '' })}
              options={PROCESSO_TIPOS}
              placeholder="Selecione um Tipo"
            />
          </Labelled>
        </div>
        <div className="sm:col-span-2">
          <Labelled label="FLUXO DE TRABALHO">
            <Combo
              value={value.fluxo}
              onChange={(v) => onChange({ fluxo: v })}
              options={fluxoOptions}
              placeholder="Selecione um Fluxo"
              disabled={!fluxoLiberado}
            />
            {!fluxoLiberado && (
              <span className="font-normal normal-case text-[var(--color-muted)]">
                O campo será liberado após a escolha do tipo de processo.
              </span>
            )}
          </Labelled>
        </div>
        <div className="sm:col-span-2">
          <Labelled label="UNIDADE ORÇAMENTÁRIA">
            {unidadeBloqueada ? (
              <>
                <input
                  readOnly
                  value={value.unidadeNome}
                  className="gt-input cursor-not-allowed bg-[#f1f4f9] font-normal normal-case text-[var(--color-muted)]"
                />
                <span className="font-normal normal-case text-[var(--color-muted)]">
                  Definida pelo PCA de origem do DFD — não dá pra trocar aqui.
                </span>
              </>
            ) : isAdmin ? (
              <Combo
                value={value.unidadeNome}
                onChange={(v) =>
                  onChange({ unidadeNome: v, unidadeId: unidades.find((u) => u.nome === v)?.id ?? '' })
                }
                options={unidades.map((u) => u.nome)}
                placeholder={unidades.length === 0 ? 'Nenhuma cadastrada' : 'Selecione a unidade'}
                disabled={unidades.length === 0}
              />
            ) : value.unidadeNome ? (
              <input
                readOnly
                value={value.unidadeNome}
                className="gt-input cursor-not-allowed bg-[#f1f4f9] font-normal normal-case text-[var(--color-muted)]"
              />
            ) : (
              <span className="flex items-start gap-2 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs font-normal normal-case text-[#8a6d1a]">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                Sua conta não tem Unidade Orçamentária vinculada. Peça ao administrador geral pra
                vincular em{' '}
                <Link to="/GerenciarUsuarios" className="font-semibold underline">
                  Gerenciar Usuários
                </Link>
                .
              </span>
            )}
          </Labelled>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="NOME DO PROCESSO"
            placeholder="Digite o nome do processo"
            value={value.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
          />
        </div>
      </div>

      <label className="mt-4 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        Descrição do Processo
        <textarea
          rows={4}
          maxLength={500}
          value={value.descricao}
          onChange={(e) => onChange({ descricao: e.target.value })}
          className="gt-input resize-y font-normal normal-case"
          placeholder="Caso queira, descreva detalhes adicionais"
        />
      </label>
      <p className="mt-1 text-xs text-[var(--color-muted)]">Máximo de 500 caracteres.</p>
    </>
  )
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      {children}
    </div>
  )
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <input className="gt-input min-w-0 font-normal normal-case" {...rest} />
    </label>
  )
}
