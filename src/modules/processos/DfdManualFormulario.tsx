import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useOrganizacao } from '../../store/organizacao'
import { useCatalogo } from '../../store/catalogo'
import { useUsuarios } from '../../store/usuarios'
import { useAuth } from '../../store/auth'
import { GRAUS_PRIORIDADE, CATEGORIAS_ITEM_PCA, type GrauPrioridade } from '../../store/pca'
import {
  useDfdManual,
  dfdManualVazio,
  valorTotalItens,
  TIPOS_CONTRATACAO_DFD,
  type DfdManual,
  type ItemDfdManual,
} from '../../store/dfdManual'

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const itemVazio = { codigo: '', qtd: '', unitario: '', previsaoIso: '' }

const isoToBr = (s: string) => {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/**
 * Formulário estruturado do DFD (Documento de Formalização da Demanda) —
 * cabeçalho + objeto/justificativa + tabela de itens, no lugar de perguntas
 * dissertativas soltas. Campos e organização baseados no modelo real de
 * sistemas de DFD do setor (Secretaria/Setor/Ordenador/Responsável,
 * Categoria, Tipo de contratação, Grau de prioridade + itens do catálogo).
 */
export function DfdManualFormulario({
  chave,
  onClose,
  onSalvar,
}: {
  chave: string
  onClose: () => void
  onSalvar?: () => void
}) {
  const salvarStore = useDfdManual((s) => s.salvar)
  const existente = useDfdManual((s) => s.porChave[chave])
  const unidades = useOrganizacao((s) => s.unidades)
  const setores = useOrganizacao((s) => s.setores)
  const catalogo = useCatalogo((s) => s.itens)
  const usuarios = useUsuarios((s) => s.usuarios)
  const usuarioAtual = useAuth((s) => s.user)

  const nomesResponsaveis = [
    ...(usuarioAtual ? [usuarioAtual.name] : []),
    ...usuarios.filter((u) => u.ativo).map((u) => u.nome),
  ].filter((n, i, arr) => n && arr.indexOf(n) === i)

  const [dados, setDados] = useState<DfdManual>(existente ?? dfdManualVazio())
  const [itemForm, setItemForm] = useState(itemVazio)
  const [itemCatalogoNome, setItemCatalogoNome] = useState('')

  const set = <K extends keyof DfdManual>(campo: K, valor: DfdManual[K]) =>
    setDados((d) => ({ ...d, [campo]: valor }))

  const escolherItemCatalogo = (nome: string) => {
    setItemCatalogoNome(nome)
    const item = catalogo.find((c) => `${c.codigo} — ${c.nome}` === nome)
    if (item) setItemForm((f) => ({ ...f, codigo: item.codigo }))
  }

  const itemSelecionado = catalogo.find((c) => c.codigo === itemForm.codigo)
  const podeAdicionarItem =
    itemSelecionado && Number(itemForm.qtd) > 0 && Number(itemForm.unitario) > 0

  const adicionarItem = () => {
    if (!itemSelecionado || !podeAdicionarItem) return
    const novo: ItemDfdManual = {
      id: `it${uid()}`,
      codigoItemCatalogo: itemSelecionado.codigo,
      descricao: itemSelecionado.nome,
      unidadeFornecimento: itemSelecionado.unidade,
      quantidade: Number(itemForm.qtd),
      valorUnitario: Number(itemForm.unitario),
      previsao: isoToBr(itemForm.previsaoIso),
    }
    setDados((d) => ({ ...d, itens: [...d.itens, novo] }))
    setItemForm(itemVazio)
    setItemCatalogoNome('')
  }

  const removerItem = (id: string) =>
    setDados((d) => ({ ...d, itens: d.itens.filter((it) => it.id !== id) }))

  const salvar = () => {
    salvarStore(chave, dados)
    onSalvar?.()
    onClose()
  }

  const cols: Column<ItemDfdManual>[] = [
    { key: 'codigo', header: 'Código', render: (r) => r.codigoItemCatalogo },
    { key: 'descricao', header: 'Descrição' },
    { key: 'unidade', header: 'Unid.', render: (r) => r.unidadeFornecimento },
    { key: 'qtd', header: 'Qtd.', align: 'center', render: (r) => r.quantidade },
    { key: 'valor', header: 'Valor (R$)', align: 'right', render: (r) => fmtBRL(r.valorUnitario) },
    {
      key: 'total',
      header: 'Total (R$)',
      align: 'right',
      render: (r) => fmtBRL(r.quantidade * r.valorUnitario),
    },
    { key: 'previsao', header: 'Previsão', align: 'center', render: (r) => r.previsao || '—' },
    {
      key: 'acoes',
      header: '',
      align: 'right',
      render: (r) => (
        <button
          onClick={() => removerItem(r.id)}
          aria-label="Remover item"
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-control)] text-[var(--color-danger)] hover:bg-[#fbeff1]"
        >
          <Trash2 size={13} />
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Campo label="Data">
          <input
            type="date"
            value={dados.data ? isoDe(dados.data) : ''}
            onChange={(e) => set('data', isoToBr(e.target.value))}
            className="gt-input font-normal normal-case"
          />
        </Campo>
        <Campo label="Descrição (simplificada)" span={2}>
          <input
            value={dados.descricaoSimplificada}
            onChange={(e) => set('descricaoSimplificada', e.target.value)}
            placeholder="Ex.: Cestas básicas de alimentos"
            className="gt-input font-normal normal-case"
          />
        </Campo>

        <Campo label="Secretaria">
          <Combo
            value={dados.secretaria}
            onChange={(v) => set('secretaria', v)}
            options={unidades.map((u) => u.nome)}
            placeholder={unidades.length === 0 ? 'Nenhuma unidade cadastrada' : 'Selecione'}
            disabled={unidades.length === 0}
            filterable
          />
        </Campo>
        <Campo label="Setor">
          <Combo
            value={dados.setor}
            onChange={(v) => set('setor', v)}
            options={setores.map((s) => s.nome)}
            placeholder="Selecione"
            filterable
          />
        </Campo>
        <Campo label="Categoria">
          <Combo
            value={dados.categoria}
            onChange={(v) => set('categoria', v)}
            options={CATEGORIAS_ITEM_PCA.map((c) => c.nome)}
            placeholder="Selecione"
          />
        </Campo>

        <Campo label="Responsável pela demanda">
          <Combo
            value={dados.responsavel}
            onChange={(v) => set('responsavel', v)}
            options={nomesResponsaveis}
            placeholder="Selecione"
            filterable
          />
        </Campo>
        <Campo label="Ordenador(a)">
          <Combo
            value={dados.ordenador}
            onChange={(v) => set('ordenador', v)}
            options={nomesResponsaveis}
            placeholder="Selecione"
            filterable
          />
        </Campo>
        <Campo label="Tipo de contratação">
          <select
            value={dados.tipoContratacao}
            onChange={(e) => set('tipoContratacao', e.target.value as DfdManual['tipoContratacao'])}
            className="gt-input font-normal normal-case"
          >
            <option value="">Selecione</option>
            {TIPOS_CONTRATACAO_DFD.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Grau de prioridade">
          <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
            {GRAUS_PRIORIDADE.map((g: GrauPrioridade) => (
              <button
                key={g}
                type="button"
                onClick={() => set('grauPrioridade', g)}
                className={`flex-1 rounded-[8px] px-2 py-1.5 text-xs font-semibold transition ${
                  dados.grauPrioridade === g
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-muted)]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Campo>
        <Campo label="Demanda para o PCA?">
          <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
            {([true, false] as const).map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => set('demandaParaPca', v)}
                className={`flex-1 rounded-[8px] px-2 py-1.5 text-xs font-semibold transition ${
                  dados.demandaParaPca === v
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-muted)]'
                }`}
              >
                {v ? 'Sim' : 'Não'}
              </button>
            ))}
          </div>
        </Campo>
      </div>

      <Campo label="Objeto (detalhado)">
        <textarea
          rows={3}
          value={dados.objeto}
          onChange={(e) => set('objeto', e.target.value)}
          className="gt-input resize-y font-normal normal-case"
          placeholder="Descreva o objeto da contratação com detalhes."
        />
      </Campo>
      <Campo label="Justificativa da contratação">
        <textarea
          rows={3}
          value={dados.justificativa}
          onChange={(e) => set('justificativa', e.target.value)}
          className="gt-input resize-y font-normal normal-case"
          placeholder="Por que essa contratação é necessária?"
        />
      </Campo>

      <div>
        <h4 className="mb-2 font-display text-sm font-bold text-[#183263]">Itens</h4>
        <div className="mb-3 grid gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-3 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]">
          <Combo
            value={itemCatalogoNome}
            onChange={escolherItemCatalogo}
            options={catalogo.map((c) => `${c.codigo} — ${c.nome}`)}
            placeholder={catalogo.length === 0 ? 'Nenhum item no catálogo' : 'Selecione o item'}
            disabled={catalogo.length === 0}
            filterable
          />
          <input
            type="number"
            min={0}
            value={itemForm.qtd}
            onChange={(e) => setItemForm((f) => ({ ...f, qtd: e.target.value }))}
            placeholder="Quantidade"
            className="gt-input font-normal normal-case"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={itemForm.unitario}
            onChange={(e) => setItemForm((f) => ({ ...f, unitario: e.target.value }))}
            placeholder="Valor unit."
            className="gt-input font-normal normal-case"
          />
          <input
            type="date"
            value={itemForm.previsaoIso}
            onChange={(e) => setItemForm((f) => ({ ...f, previsaoIso: e.target.value }))}
            className="gt-input font-normal normal-case"
          />
          <button
            type="button"
            onClick={adicionarItem}
            disabled={!podeAdicionarItem}
            className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>

        <DataTable<ItemDfdManual>
          columns={cols}
          rows={dados.itens}
          rowKey={(r) => r.id}
          empty={<EmptyState title="Nenhum item adicionado" subtitle="Escolha um item do catálogo acima." />}
          footer={<span>Valor total dos itens: R$ {fmtBRL(valorTotalItens(dados))}</span>}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-[var(--color-line)] pt-4">
        <button
          onClick={onClose}
          className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)]"
        >
          Cancelar
        </button>
        <button
          onClick={salvar}
          className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold text-white"
        >
          Salvar DFD
        </button>
      </div>
    </div>
  )
}

/** dd/mm/aaaa → aaaa-mm-dd (pro <input type="date">). */
function isoDe(br: string) {
  const m = br?.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

function Campo({
  label,
  span,
  children,
}: {
  label: string
  span?: number
  children: React.ReactNode
}) {
  return (
    <label
      className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]"
      style={span ? { gridColumn: `span ${span} / span ${span}` } : undefined}
    >
      {label}
      {children}
    </label>
  )
}
