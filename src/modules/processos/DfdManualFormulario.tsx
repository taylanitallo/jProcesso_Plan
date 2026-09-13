import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Building2,
  FileText,
  Link2,
  type LucideIcon,
  Package,
  Pencil,
  Plus,
  Save,
  Tags,
  Trash2,
  X as XIcon,
} from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ACCENTS, type Accent } from '../../components/common/accents'
import { useOrganizacao } from '../../store/organizacao'
import { useCatalogo } from '../../store/catalogo'
import { useUsuarios } from '../../store/usuarios'
import { useAuth } from '../../store/auth'
import { usePca, GRAUS_PRIORIDADE, CATEGORIAS_ITEM_PCA, type GrauPrioridade } from '../../store/pca'
import {
  useDfdManual,
  dfdManualVazio,
  valorTotalItens,
  disponibilidadeItemPca,
  encontrarItemOrigemPca,
  TIPOS_CONTRATACAO_DFD,
  type DfdManual,
  type ItemDfdManual,
} from '../../store/dfdManual'

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const itemVazio = {
  codigo: '',
  descricao: '',
  unidade: '',
  qtd: '',
  unitario: '',
  previsaoIso: '',
  origemItemId: undefined as string | undefined,
}

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
 * Seções coloridas + ícones (Identificação/Classificação/Objeto/Itens) pra
 * facilitar a leitura visual em vez de um bloco só de campos.
 *
 * Quando a DFD veio de um PCA (`dados.origemPca`), a lista de itens fica
 * travada: não dá pra adicionar item novo, só editar especificação/valor/
 * previsão e reduzir a quantidade — nunca ultrapassar o total da DFD do PCA,
 * controlado junto com todas as outras "DFDs de execução" que apontam pro
 * mesmo item (`disponibilidadeItemPca`).
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
  const todasDfds = useDfdManual((s) => s.porChave)
  const pcas = usePca((s) => s.pcas)
  const unidades = useOrganizacao((s) => s.unidades)
  const setoresCadastrados = useOrganizacao((s) => s.setores)
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
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const travado = Boolean(dados.origemPca)
  const pcaOrigem = dados.origemPca ? pcas.find((p) => p.id === dados.origemPca?.pcaId) : undefined
  const dfdOrigem = pcaOrigem?.dfds.find((d) => d.id === dados.origemPca?.dfdId)

  const disponibilidadePara = (origemItemId: string) => {
    const origem = encontrarItemOrigemPca(origemItemId, pcas)
    if (!origem) return null
    return disponibilidadeItemPca(origemItemId, origem, todasDfds, chave)
  }

  const set = <K extends keyof DfdManual>(campo: K, valor: DfdManual[K]) =>
    setDados((d) => ({ ...d, [campo]: valor }))

  const toggleSetor = (nome: string) =>
    setDados((d) => ({
      ...d,
      setores: d.setores.includes(nome) ? d.setores.filter((s) => s !== nome) : [...d.setores, nome],
    }))

  const escolherItemCatalogo = (nome: string) => {
    setItemCatalogoNome(nome)
    const item = catalogo.find((c) => `${c.codigo} — ${c.nome}` === nome)
    if (item) {
      setItemForm((f) => ({ ...f, codigo: item.codigo, descricao: item.nome, unidade: item.unidade }))
    }
  }

  const infoEdicao = itemForm.origemItemId ? disponibilidadePara(itemForm.origemItemId) : null
  const excedeLimite = infoEdicao ? Number(itemForm.qtd) > infoEdicao.disponivel : false

  const podeSalvarItem =
    itemForm.codigo.trim() &&
    itemForm.descricao.trim() &&
    Number(itemForm.qtd) > 0 &&
    Number(itemForm.unitario) > 0 &&
    !excedeLimite

  const cancelarEdicaoItem = () => {
    setEditandoId(null)
    setItemForm(itemVazio)
    setItemCatalogoNome('')
  }

  const salvarItem = () => {
    if (!podeSalvarItem) return
    const item: ItemDfdManual = {
      id: editandoId ?? `it${uid()}`,
      codigoItemCatalogo: itemForm.codigo.trim(),
      descricao: itemForm.descricao.trim(),
      unidadeFornecimento: itemForm.unidade.trim(),
      quantidade: Number(itemForm.qtd),
      valorUnitario: Number(itemForm.unitario),
      previsao: isoToBr(itemForm.previsaoIso),
      origemItemId: itemForm.origemItemId,
    }
    setDados((d) => ({
      ...d,
      itens: editandoId ? d.itens.map((it) => (it.id === editandoId ? item : it)) : [...d.itens, item],
    }))
    cancelarEdicaoItem()
  }

  const editarItem = (it: ItemDfdManual) => {
    setEditandoId(it.id)
    setItemCatalogoNome(`${it.codigoItemCatalogo} — ${it.descricao}`)
    setItemForm({
      codigo: it.codigoItemCatalogo,
      descricao: it.descricao,
      unidade: it.unidadeFornecimento,
      qtd: String(it.quantidade),
      unitario: String(it.valorUnitario),
      previsaoIso: isoDe(it.previsao),
      origemItemId: it.origemItemId,
    })
  }

  const removerItem = (id: string) => {
    setDados((d) => ({ ...d, itens: d.itens.filter((it) => it.id !== id) }))
    if (editandoId === id) cancelarEdicaoItem()
  }

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
    {
      key: 'disponivel',
      header: 'Disponível (PCA)',
      align: 'center',
      render: (r) => {
        if (!r.origemItemId) return '—'
        const info = disponibilidadePara(r.origemItemId)
        return info ? `${info.disponivel} de ${info.totalPca}` : '—'
      },
    },
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
        <div className="flex justify-end gap-1">
          <button
            onClick={() => editarItem(r)}
            aria-label="Editar item"
            className="grid h-7 w-7 place-items-center rounded-[var(--radius-control)] text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft)]"
          >
            <Pencil size={13} />
          </button>
          {!r.origemItemId && (
            <button
              onClick={() => removerItem(r.id)}
              aria-label="Remover item"
              className="grid h-7 w-7 place-items-center rounded-[var(--radius-control)] text-[var(--color-danger)] hover:bg-[#fbeff1]"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {travado && (
        <p className="flex items-start gap-2 rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-3 py-2 text-xs text-[var(--color-primary-strong)]">
          <Link2 size={14} className="mt-0.5 shrink-0" />
          DFD de execução puxada do PCA {pcaOrigem?.nome ?? ''}
          {dfdOrigem ? ` — DFD #${dfdOrigem.numero}` : ''}. Não dá pra adicionar item novo aqui; só
          ajustar especificação, valor, previsão e reduzir quantidade — sem ultrapassar o total da DFD
          do PCA.
        </p>
      )}

      <Secao icon={Building2} titulo="Identificação da demanda" accent="blue">
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
          <Campo label="Setores/departamentos demandantes" span={2}>
            {setoresCadastrados.length === 0 ? (
              <span className="rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs font-normal normal-case text-[#8a6d1a]">
                Nenhum setor cadastrado em Gerenciar Unidade/Setor.
              </span>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {setoresCadastrados.map((s) => {
                  const on = dados.setores.includes(s.nome)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSetor(s.nome)}
                      className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-semibold normal-case transition ${
                        on
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-[var(--color-line)] bg-white text-[var(--color-muted)]'
                      }`}
                    >
                      {s.nome}
                    </button>
                  )
                })}
              </div>
            )}
          </Campo>
        </div>
      </Secao>

      <Secao icon={Tags} titulo="Classificação e responsáveis" accent="teal">
        <div className="grid gap-3 sm:grid-cols-3">
          <Campo label="Categoria">
            <Combo
              value={dados.categoria}
              onChange={(v) => set('categoria', v)}
              options={CATEGORIAS_ITEM_PCA.map((c) => c.nome)}
              placeholder="Selecione"
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
                      ? 'bg-[var(--color-teal)] text-white'
                      : 'text-[var(--color-muted)]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
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
        </div>
      </Secao>

      <Secao icon={FileText} titulo="Objeto e justificativa" accent="amber">
        <div className="flex flex-col gap-3">
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
        </div>
      </Secao>

      <Secao icon={Package} titulo="Itens" accent="green">
        {(!travado || editandoId) && (
          <div className="mb-3 flex flex-col gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-3">
            {editandoId && (
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
                Editando item — ajuste a especificação e salve
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,1fr)]">
              {travado ? (
                <div className="flex flex-col justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#eef1f7] px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                    Código (fixo — vem do PCA)
                  </span>
                  <span className="text-sm text-[var(--color-ink)]">{itemForm.codigo}</span>
                </div>
              ) : (
                <Combo
                  value={itemCatalogoNome}
                  onChange={escolherItemCatalogo}
                  options={catalogo.map((c) => `${c.codigo} — ${c.nome}`)}
                  placeholder={catalogo.length === 0 ? 'Nenhum item no catálogo' : 'Base do catálogo'}
                  disabled={catalogo.length === 0}
                  filterable
                />
              )}
              <input
                value={itemForm.descricao}
                onChange={(e) => setItemForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Descrição / especificação"
                className="gt-input font-normal normal-case"
              />
              <input
                value={itemForm.unidade}
                onChange={(e) => setItemForm((f) => ({ ...f, unidade: e.target.value }))}
                placeholder="Unidade"
                className="gt-input font-normal normal-case"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto_auto]">
              <input
                type="number"
                min={0}
                max={infoEdicao ? infoEdicao.disponivel : undefined}
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
              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicaoItem}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2 text-xs font-bold text-[var(--color-muted)]"
                >
                  <XIcon size={14} /> Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={salvarItem}
                disabled={!podeSalvarItem}
                className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} /> {editandoId ? 'Salvar item' : 'Adicionar'}
              </button>
            </div>
            {infoEdicao && (
              <p className={`text-xs ${excedeLimite ? 'font-bold text-[var(--color-danger)]' : 'text-[var(--color-muted)]'}`}>
                Disponível no PCA: {infoEdicao.disponivel} de {infoEdicao.totalPca}
                {infoEdicao.usadoEmOutras > 0 ? ` (${infoEdicao.usadoEmOutras} já usado em outras execuções)` : ''}.
                {excedeLimite
                  ? ' Quantidade acima do disponível — reduza pra salvar.'
                  : ` Vai sobrar pro PCA depois desta DFD: ${Math.max(0, infoEdicao.disponivel - (Number(itemForm.qtd) || 0))}.`}
              </p>
            )}
          </div>
        )}

        {travado && !editandoId && (
          <p className="mb-3 rounded-[var(--radius-control)] border border-dashed border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-muted)]">
            Itens vêm da DFD do PCA de origem — clique no lápis de um item pra ajustar especificação,
            valor, previsão ou reduzir a quantidade.
          </p>
        )}

        <DataTable<ItemDfdManual>
          columns={cols}
          rows={dados.itens}
          rowKey={(r) => r.id}
          empty={<EmptyState title="Nenhum item adicionado" subtitle="Escolha um item do catálogo acima." />}
          footer={<span>Valor total dos itens: R$ {fmtBRL(valorTotalItens(dados))}</span>}
        />
      </Secao>

      <div className="flex justify-end gap-2 border-t border-[var(--color-line)] pt-4">
        <button
          onClick={onClose}
          className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)]"
        >
          Cancelar
        </button>
        <button
          onClick={salvar}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold text-white"
        >
          <Save size={15} /> Salvar DFD
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

function Secao({
  icon: Icon,
  titulo,
  accent,
  children,
}: {
  icon: LucideIcon
  titulo: string
  accent: Accent
  children: ReactNode
}) {
  const a = ACCENTS[accent]
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4">
      <div className={`mb-3 flex items-center gap-2 border-l-4 ${a.border} pl-2.5`}>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[8px] ${a.bg} ${a.text}`}>
          <Icon size={15} />
        </span>
        <h4 className="font-display text-sm font-bold text-[#183263]">{titulo}</h4>
      </div>
      {children}
    </div>
  )
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
