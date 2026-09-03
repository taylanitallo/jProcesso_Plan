import { useMemo, useState } from 'react'
import { Combo } from '../../components/common/Combo'
import { PROCESSO_LEGISLACOES, PROCESSO_TIPOS, WORKFLOWS } from '../../mocks'

/**
 * Campos da aba "Processo" — compartilhados pelos três modos de criação de
 * Processo Inteligente (manual, a partir de registros, com solicitação).
 */
export function ProcessoFields() {
  const [numero, setNumero] = useState('')
  const [legislacao, setLegislacao] = useState('')
  const [tipo, setTipo] = useState('')
  const [fluxo, setFluxo] = useState('')
  const [nome, setNome] = useState('')
  const [lote, setLote] = useState('')
  const [descricao, setDescricao] = useState('')

  const fluxoLiberado = Boolean(legislacao && tipo)
  const fluxoOptions = useMemo(
    () => WORKFLOWS.filter((w) => w.legislacao === legislacao && w.tipo === tipo).map((w) => w.nome),
    [legislacao, tipo],
  )

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="NÚMERO DO PROCESSO"
            placeholder="Digite o número do processo"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>
        <Labelled label="LEGISLAÇÃO">
          <Combo
            value={legislacao}
            onChange={setLegislacao}
            options={PROCESSO_LEGISLACOES}
            placeholder="Selecione uma Legislação"
          />
        </Labelled>
        <Labelled label="TIPO DE PROCESSO">
          <Combo
            value={tipo}
            onChange={setTipo}
            options={PROCESSO_TIPOS}
            placeholder="Selecione um Tipo"
          />
        </Labelled>
        <div className="sm:col-span-2">
          <Labelled label="FLUXO DE TRABALHO">
            <Combo
              value={fluxo}
              onChange={setFluxo}
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
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <Labelled label="LOTE ÚNICO">
          <Combo value={lote} onChange={setLote} options={['Sim', 'Não']} placeholder="Selecione:" />
        </Labelled>
      </div>

      <label className="mt-4 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        Descrição do Processo
        <textarea
          rows={4}
          maxLength={500}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
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
