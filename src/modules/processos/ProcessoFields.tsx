import { useMemo } from 'react'
import { Combo } from '../../components/common/Combo'
import { PROCESSO_LEGISLACOES, PROCESSO_TIPOS } from '../../mocks'
import { useWorkflows } from '../../store/workflows'
import type { ProcessoFormValue } from './processoForm'

/**
 * Campos da aba "Processo" — compartilhados pelos três modos de criação de
 * Processo Inteligente (manual, a partir de registros, com solicitação).
 * Controlado: estado vive no modal pai.
 */
export function ProcessoFields({
  value,
  onChange,
}: {
  value: ProcessoFormValue
  onChange: (patch: Partial<ProcessoFormValue>) => void
}) {
  const workflows = useWorkflows((s) => s.workflows)
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
        <Labelled label="LEGISLAÇÃO">
          <Combo
            value={value.legislacao}
            onChange={(v) => onChange({ legislacao: v, fluxo: '' })}
            options={PROCESSO_LEGISLACOES}
            placeholder="Selecione uma Legislação"
          />
        </Labelled>
        <Labelled label="TIPO DE PROCESSO">
          <Combo
            value={value.tipo}
            onChange={(v) => onChange({ tipo: v, fluxo: '' })}
            options={PROCESSO_TIPOS}
            placeholder="Selecione um Tipo"
          />
        </Labelled>
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
                O campo será liberado após a escolha da legislação e do tipo de processo.
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
        <Labelled label="LOTE ÚNICO">
          <Combo
            value={value.lote}
            onChange={(v) => onChange({ lote: v })}
            options={['Sim', 'Não']}
            placeholder="Selecione:"
          />
        </Labelled>
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
