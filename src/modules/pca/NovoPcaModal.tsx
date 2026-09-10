import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Building2, CalendarRange, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { usePca } from '../../store/pca'
import { useOrganizacao } from '../../store/organizacao'
import { useInstituicao, instituicaoConfigurada } from '../../store/instituicao'
import { useUi } from '../../store/ui'
import { PROCESSO_LEGISLACOES } from '../../mocks'

const ANO_MIN = new Date().getFullYear() - 1
const ANO_MAX = new Date().getFullYear() + 10

const vazio = {
  nome: '',
  anoPca: String(new Date().getFullYear()),
  unidadeNome: '',
  legislacao: PROCESSO_LEGISLACOES[0],
  observacoes: '',
}

export function NovoPcaModal({ onCriado, onClose }: { onCriado: (id: string) => void; onClose: () => void }) {
  const criar = usePca((s) => s.criar)
  const unidades = useOrganizacao((s) => s.unidades)
  const instituicao = useInstituicao((s) => s.instituicao)
  const setUserModal = useUi((s) => s.setUserModal)
  const [form, setForm] = useState(vazio)

  const instOk = instituicaoConfigurada(instituicao)
  const unidadeSelecionada = unidades.find((u) => u.nome === form.unidadeNome) ?? null
  const anoNum = Number(form.anoPca)
  const anoOk = Number.isInteger(anoNum) && anoNum >= ANO_MIN && anoNum <= ANO_MAX
  const podeSalvar = form.nome.trim() && instOk && unidadeSelecionada && anoOk

  const salvar = () => {
    if (!podeSalvar || !unidadeSelecionada) return
    const id = criar({
      nome: form.nome,
      anoPca: anoNum,
      cnpjOrgao: instituicao.cnpj,
      nomeOrgao: instituicao.nome,
      unidadeId: unidadeSelecionada.id,
      unidadeNome: unidadeSelecionada.nome,
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
                type="number"
                min={ANO_MIN}
                max={ANO_MAX}
                value={form.anoPca}
                onChange={(e) => setForm((f) => ({ ...f, anoPca: e.target.value }))}
                className="gt-input font-normal normal-case"
              />
              {form.anoPca !== '' && !anoOk && (
                <span className="font-normal normal-case text-[var(--color-danger)]">
                  Informe um ano entre {ANO_MIN} e {ANO_MAX}.
                </span>
              )}
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

          {instOk ? (
            <div className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] px-3 py-2.5">
              <Building2 size={16} className="mt-0.5 shrink-0 text-[var(--color-primary-strong)]" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-[var(--color-ink)]">{instituicao.nome}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  CNPJ {instituicao.cnpj}
                  {instituicao.cidade && ` • ${instituicao.cidade}`}
                  {instituicao.uf && `/${instituicao.uf}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserModal('instituicao')}
                className="shrink-0 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Editar
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs text-[#8a6d1a]">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Os dados da instituição (nome e CNPJ do órgão) ainda não foram cadastrados.{' '}
                <button
                  type="button"
                  onClick={() => setUserModal('instituicao')}
                  className="font-semibold underline"
                >
                  Cadastre em Dados da Instituição
                </button>{' '}
                antes de criar o PCA.
              </span>
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Unidade Orçamentária
            <Combo
              value={form.unidadeNome}
              onChange={(v) => setForm((f) => ({ ...f, unidadeNome: v }))}
              options={unidades.map((u) => u.nome)}
              placeholder={unidades.length === 0 ? 'Nenhuma unidade cadastrada' : 'Selecione a unidade'}
              disabled={unidades.length === 0}
              filterable
            />
            <p className="text-[11px] font-normal normal-case text-[var(--color-muted)]">
              Cada Unidade Orçamentária monta o seu próprio PCA.
            </p>
          </label>

          {unidades.length === 0 && (
            <div className="flex items-start gap-2 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs text-[#8a6d1a]">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Nenhuma Unidade Orçamentária cadastrada.{' '}
                <Link to="/GerenciarUnidadeSetor" className="font-semibold underline">
                  Cadastre em Gerenciar Unidade/Setor
                </Link>{' '}
                antes de criar o PCA.
              </span>
            </div>
          )}

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
