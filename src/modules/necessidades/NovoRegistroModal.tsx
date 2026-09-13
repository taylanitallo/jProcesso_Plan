import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useNecessidades } from '../../store/necessidades'
import { useOrganizacao } from '../../store/organizacao'

const vazio = { nome: '', descricao: '', setor: 'Sem setor', dataDesejada: '' }

export function NovoRegistroModal({ onClose }: { onClose: () => void }) {
  const adicionar = useNecessidades((s) => s.adicionar)
  const setores = useOrganizacao((s) => s.setores)
  const [form, setForm] = useState(vazio)

  const salvar = () => {
    if (!form.nome.trim()) return
    adicionar(form)
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
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-teal-soft)] text-[var(--color-teal)]">
            <Plus size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Registrar Necessidades</h3>
            <p className="text-xs text-[var(--color-muted)]">Informe nome e descrição da necessidade.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Nome da necessidade
            <input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Necessidade - Obra XPTO"
              className="gt-input font-normal normal-case"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Descrição
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Detalhes adicionais…"
              rows={3}
              className="gt-input resize-y font-normal normal-case"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Setor
              <select
                value={form.setor}
                onChange={(e) => setForm((f) => ({ ...f, setor: e.target.value }))}
                className="gt-input font-normal normal-case"
              >
                <option value="Sem setor">Sem setor</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.nome}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Data desejada
              <input
                type="date"
                value={form.dataDesejada}
                onChange={(e) => setForm((f) => ({ ...f, dataDesejada: e.target.value }))}
                className="gt-input font-normal normal-case"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setForm(vazio)}
            className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
          >
            Limpar
          </button>
          <button
            onClick={salvar}
            disabled={!form.nome.trim()}
            className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar e Adicionar Itens
          </button>
        </div>
      </div>
    </div>
  )
}
