import { useState } from 'react'
import { X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { ICONES } from './artefatoIcones'

export function AdicionarArtefatoModal({
  open,
  onClose,
  nodes,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  nodes: string[]
  onAdd: (nome: string, afterIndex: number, icone: string) => void
}) {
  const [nome, setNome] = useState('')
  const [posicao, setPosicao] = useState('')
  const [icone, setIcone] = useState('Documento')

  const posOptions = ['Ser o primeiro artefato', ...nodes.map((n) => `Após ${n}`)]

  if (!open) return null

  const submit = () => {
    if (!nome.trim() || !posicao) return
    const idx = posOptions.indexOf(posicao) - 1 // -1 => primeiro
    onAdd(nome.trim(), idx, icone)
    setNome('')
    setPosicao('')
    setIcone('Documento')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative my-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
          Adicionar artefato
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Crie um novo modelo e escolha onde ele entrará neste fluxo.
        </p>

        <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Nome do artefato
          <input
            value={nome}
            maxLength={100}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Parecer técnico"
            className="gt-input"
          />
          <span className="self-end text-xs text-[var(--color-muted)]">{nome.length}/100</span>
        </label>

        <label className="mt-2 flex min-w-0 flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Posição no fluxo
          <Combo
            value={posicao}
            onChange={setPosicao}
            options={posOptions}
            placeholder="Selecione a posição"
          />
          <span className="text-xs text-[var(--color-muted)]">
            Informe qual artefato ficará imediatamente antes do novo.
          </span>
        </label>

        <div className="mt-3">
          <p className="text-sm font-medium text-[var(--color-ink)]">Ícone</p>
          <p className="mb-2 text-xs text-[var(--color-muted)]">
            Selecione o ícone que representará o artefato nos cards.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ICONES.map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setIcone(key)}
                className={`flex flex-col items-center gap-2 rounded-[var(--radius-control)] border-2 p-4 text-xs font-semibold transition ${
                  icone === key
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                    : 'border-transparent bg-[#eef3fb] text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Icon size={22} />
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!nome.trim() || !posicao}
            className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Adicionar artefato
          </button>
        </div>
      </div>
    </div>
  )
}
