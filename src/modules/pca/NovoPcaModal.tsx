import { useState } from 'react'
import { CalendarRange, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { usePca } from '../../store/pca'
import { PROCESSO_LEGISLACOES } from '../../mocks'

const vazio = {
  nome: '',
  anoPca: String(new Date().getFullYear()),
  cnpjOrgao: '',
  nomeOrgao: '',
  unidade: '',
  legislacao: PROCESSO_LEGISLACOES[0],
  observacoes: '',
}

export function NovoPcaModal({ onCriado, onClose }: { onCriado: (id: string) => void; onClose: () => void }) {
  const criar = usePca((s) => s.criar)
  const [form, setForm] = useState(vazio)

  const podeSalvar = form.nome.trim() && form.cnpjOrgao.trim() && form.nomeOrgao.trim()

  const salvar = () => {
    if (!podeSalvar) return
    const id = criar({
      nome: form.nome,
      anoPca: Number(form.anoPca) || new Date().getFullYear(),
      cnpjOrgao: form.cnpjOrgao,
      nomeOrgao: form.nomeOrgao,
      unidade: form.unidade,
      legislacao: form.legislacao,
      observacoes: form.observacoes,
    })
    onCriado(id)
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
            <CalendarRange size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Novo PCA</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Informe os dados do Plano de Contratação Anual. Os itens são adicionados na
              próxima tela.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Nome do PCA
            <input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: PCA 2027 - Secretaria de Administração"
              className="gt-input font-normal normal-case"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Ano do PCA
              <input
                value={form.anoPca}
                onChange={(e) => setForm((f) => ({ ...f, anoPca: e.target.value }))}
                className="gt-input font-normal normal-case"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Legislação
              <Combo
                value={form.legislacao}
                onChange={(v) => setForm((f) => ({ ...f, legislacao: v }))}
                options={PROCESSO_LEGISLACOES}
                placeholder="Selecione"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              CNPJ do Órgão
              <input
                value={form.cnpjOrgao}
                onChange={(e) => setForm((f) => ({ ...f, cnpjOrgao: e.target.value }))}
                placeholder="00.000.000/0000-00"
                className="gt-input font-normal normal-case"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Nome do Órgão
              <input
                value={form.nomeOrgao}
                onChange={(e) => setForm((f) => ({ ...f, nomeOrgao: e.target.value }))}
                placeholder="Ex: Prefeitura Municipal de..."
                className="gt-input font-normal normal-case"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Unidade
            <input
              value={form.unidade}
              onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
              placeholder="Ex: Secretaria de Administração"
              className="gt-input font-normal normal-case"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Observações
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              placeholder="Detalhes adicionais…"
              rows={3}
              className="gt-input resize-y font-normal normal-case"
            />
          </label>
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
            disabled={!podeSalvar}
            className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar e Adicionar Itens
          </button>
        </div>
      </div>
    </div>
  )
}
