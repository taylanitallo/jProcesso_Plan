import { useState } from 'react'
import { FileText, Info, Plus, Trash2, UploadCloud, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { useModelos } from '../../store/modelos'
import { PROCESSO_LEGISLACOES } from '../../mocks'
import { MODELO_NOMES } from './modeloNomes'

export function NovoModeloModal({ onClose }: { onClose: () => void }) {
  const adicionar = useModelos((s) => s.adicionar)

  const [legislacao, setLegislacao] = useState('14.133')
  const [modelo, setModelo] = useState('')
  const [origem, setOrigem] = useState<'SollAI' | 'Word'>('SollAI')
  const [arquivo, setArquivo] = useState('')

  const podeSalvar = Boolean(modelo) && (origem === 'SollAI' || arquivo)

  const salvar = () => {
    if (!podeSalvar) return
    adicionar({ nome: modelo, legislacao, origem, arquivo })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-2xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Novo Modelo Personalizado</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Selecione a legislação, o modelo e escolha a fonte do arquivo para importar ou utilizar
              a estrutura padrão.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Legislação
            <Combo
              value={legislacao}
              onChange={setLegislacao}
              options={PROCESSO_LEGISLACOES}
              placeholder="Selecione"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Modelo
            <Combo
              value={modelo}
              onChange={setModelo}
              options={MODELO_NOMES}
              placeholder="Selecione um Modelo"
              filterable
            />
          </label>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          Origem do arquivo
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(
            [
              ['SollAI', 'Utilizar modelo SollAI'],
              ['Word', 'Enviar arquivo Word'],
            ] as ['SollAI' | 'Word', string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setOrigem(k)}
              className={`rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-semibold transition ${
                origem === k
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-line)] bg-[#f8fafd] text-[var(--color-muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {origem === 'Word' && (
          <div className="mt-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[#f8fafd] p-4">
            <label className="mx-auto flex w-fit cursor-pointer items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f9d55_0%,#198754_100%)] px-4 py-2.5 text-sm font-semibold text-white">
              <UploadCloud size={16} /> Selecionar Arquivo
              <input
                type="file"
                accept=".doc,.docx"
                className="hidden"
                onChange={(e) => setArquivo(e.target.files?.[0]?.name ?? '')}
              />
            </label>
            {arquivo && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3 py-2">
                <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-ink)]">
                  <FileText size={16} className="shrink-0 text-[var(--color-success)]" />
                  <span className="truncate">{arquivo}</span>
                </span>
                <button
                  onClick={() => setArquivo('')}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] bg-[#5b6472] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] px-3 py-2 text-xs text-[var(--color-primary-strong)]">
          <Info size={14} className="shrink-0" />
          <span>Arquivos enviados devem estar no formato .doc ou .docx e ter no máximo 800 MB.</span>
        </div>

        <button
          onClick={salvar}
          disabled={!podeSalvar}
          className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Salvar modelo
        </button>
      </div>
    </div>
  )
}
