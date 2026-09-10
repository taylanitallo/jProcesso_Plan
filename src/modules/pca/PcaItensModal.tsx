import { useRef, useState } from 'react'
import {
  Download,
  FilePenLine,
  Info,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { Badge } from '../../components/common/Badge'
import { UNIDADES } from '../catalogo/itemOpcoes'
import { useCatalogo } from '../../store/catalogo'
import {
  usePca,
  CATEGORIAS_ITEM_PCA,
  CRITERIOS_JULGAMENTO_PCA,
  type PcaItemLocal,
} from '../../store/pca'
import type { MaterialOuServico } from '../../services/types'
import { ImportarPncpItensModal } from './ImportarPncpItensModal'

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const emptyForm = {
  editId: null as string | null,
  origemItem: 'MANUAL' as PcaItemLocal['origem'],
  materialOuServico: 'MATERIAL' as MaterialOuServico,
  descricao: '',
  informacaoComplementar: '',
  categoriaNome: '',
  criterioNome: '',
  margem: false,
  conteudoNacional: false,
  unidade: '',
  qtd: '',
  unitario: '',
  codigoItemCatalogo: '',
}

export function PcaItensModal({ pcaId, onClose }: { pcaId: string; onClose: () => void }) {
  const pca = usePca((s) => s.pcas.find((p) => p.id === pcaId))
  const adicionarItem = usePca((s) => s.adicionarItem)
  const atualizarItem = usePca((s) => s.atualizarItem)
  const removerItem = usePca((s) => s.removerItem)
  const catalogo = useCatalogo((s) => s.itens)

  const [view, setView] = useState<'lista' | 'form' | 'importar'>('lista')
  const [form, setForm] = useState(emptyForm)
  const [buscaCatalogo, setBuscaCatalogo] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroImport, setErroImport] = useState('')
  const [pncpOpen, setPncpOpen] = useState(false)
  const [excluirItemId, setExcluirItemId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!pca) return null

  const alvoExcluir = pca.itens.find((i) => i.id === excluirItemId) ?? null

  const totalLote = pca.itens.reduce((s, i) => s + i.valorTotalEstimado, 0)
  const totalForm = (Number(form.qtd) || 0) * (Number(form.unitario) || 0)

  const abrirNovo = () => {
    setForm(emptyForm)
    setView('form')
  }

  const abrirEditar = (it: PcaItemLocal) => {
    setForm({
      editId: it.id,
      origemItem: it.origem,
      materialOuServico: it.materialOuServico,
      descricao: it.descricao,
      informacaoComplementar: it.informacaoComplementar ?? '',
      categoriaNome: it.categoriaItemNome,
      criterioNome: it.criterioJulgamentoNome,
      margem: it.aplicabilidadeMargemPreferencia,
      conteudoNacional: it.exigenciaConteudoNacional,
      unidade: it.unidadeFornecimento,
      qtd: String(it.quantidadeEstimada),
      unitario: String(it.valorUnitarioEstimado),
      codigoItemCatalogo: it.codigoItemCatalogo ?? '',
    })
    setView('form')
  }

  const escolherDoCatalogo = (c: (typeof catalogo)[number]) => {
    setForm((f) => ({
      ...f,
      origemItem: 'CATALOGO',
      materialOuServico: c.tipo === 'Serviço' ? 'SERVICO' : 'MATERIAL',
      descricao: c.nome,
      informacaoComplementar: c.especificacao,
      unidade: c.unidade,
      codigoItemCatalogo: c.codigo,
    }))
  }

  const incluirItem = () => {
    const categoria = CATEGORIAS_ITEM_PCA.find((c) => c.nome === form.categoriaNome)
    const criterio = CRITERIOS_JULGAMENTO_PCA.find((c) => c.nome === form.criterioNome)
    if (!form.descricao.trim() || !categoria || !criterio || !form.unidade) return

    const payload = {
      numeroItem:
        form.editId != null
          ? (pca.itens.find((i) => i.id === form.editId)?.numeroItem ?? 1)
          : Math.max(0, ...pca.itens.map((i) => i.numeroItem)) + 1,
      materialOuServico: form.materialOuServico,
      categoriaItemId: categoria.id,
      categoriaItemNome: categoria.nome,
      criterioJulgamentoId: criterio.id,
      criterioJulgamentoNome: criterio.nome,
      aplicabilidadeMargemPreferencia: form.margem,
      exigenciaConteudoNacional: form.conteudoNacional,
      classificacao: categoria.nome,
      descricao: form.descricao.trim(),
      informacaoComplementar: form.informacaoComplementar.trim() || undefined,
      unidadeFornecimento: form.unidade,
      quantidadeEstimada: Number(form.qtd) || 0,
      valorUnitarioEstimado: Number(form.unitario) || 0,
      codigoItemCatalogo: form.codigoItemCatalogo || undefined,
      origem: form.origemItem,
    }

    if (form.editId != null) atualizarItem(pcaId, form.editId, payload)
    else adicionarItem(pcaId, payload)
    setView('lista')
  }

  const exportarCsv = () => {
    const linhas = [
      [
        'Nº', 'Descrição', 'Material/Serviço', 'Categoria', 'Critério de Julgamento',
        'Margem de Preferência', 'Conteúdo Nacional', 'Unidade', 'Qtd.', 'Valor Unit. (R$)', 'Valor Total (R$)',
      ],
      ...pca.itens.map((i) => [
        String(i.numeroItem),
        i.descricao,
        i.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço',
        i.categoriaItemNome,
        i.criterioJulgamentoNome,
        i.aplicabilidadeMargemPreferencia ? 'Sim' : 'Não',
        i.exigenciaConteudoNacional ? 'Sim' : 'Não',
        i.unidadeFornecimento,
        String(i.quantidadeEstimada),
        i.valorUnitarioEstimado.toFixed(2),
        i.valorTotalEstimado.toFixed(2),
      ]),
    ]
    const csv = linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pca-${pca.nome.replace(/[\\/]/g, '-')}-itens.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const importarArquivo = async () => {
    if (!arquivo) return
    try {
      const texto = await arquivo.text()
      const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0)
      if (linhas.length < 2) {
        setErroImport('Arquivo vazio ou sem itens após o cabeçalho.')
        return
      }
      let proximoNumero = Math.max(0, ...pca.itens.map((i) => i.numeroItem)) + 1
      linhas.slice(1).forEach((linha) => {
        const cols = linha.split(/[;,]/).map((c) => c.replace(/^"|"$/g, '').trim())
        const [, descricao, materialServico, categoriaNome, criterioNome, margem, conteudo, unidade, qtd, unitario] =
          cols
        const categoria =
          CATEGORIAS_ITEM_PCA.find((c) => c.nome === categoriaNome) ?? CATEGORIAS_ITEM_PCA[0]
        const criterio =
          CRITERIOS_JULGAMENTO_PCA.find((c) => c.nome === criterioNome) ?? CRITERIOS_JULGAMENTO_PCA[0]
        const q = Number(qtd) || 0
        const u = Number(unitario) || 0
        adicionarItem(pcaId, {
          numeroItem: proximoNumero++,
          materialOuServico: materialServico?.trim().toLowerCase().startsWith('serv')
            ? 'SERVICO'
            : 'MATERIAL',
          categoriaItemId: categoria.id,
          categoriaItemNome: categoria.nome,
          criterioJulgamentoId: criterio.id,
          criterioJulgamentoNome: criterio.nome,
          aplicabilidadeMargemPreferencia: margem?.trim().toLowerCase() === 'sim',
          exigenciaConteudoNacional: conteudo?.trim().toLowerCase() === 'sim',
          classificacao: categoria.nome,
          descricao: descricao || 'Item importado',
          unidadeFornecimento: unidade || 'Unidade (UN)',
          quantidadeEstimada: q,
          valorUnitarioEstimado: u,
          origem: 'MANUAL',
        })
      })
      setArquivo(null)
      setErroImport('')
      setView('lista')
    } catch {
      setErroImport('Não foi possível ler o arquivo. Envie um .csv exportado de uma planilha.')
    }
  }

  const cols: Column<PcaItemLocal>[] = [
    { key: 'numeroItem', header: 'Nº', align: 'center' },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (r) => (
        <div className="max-w-[380px]">
          <p className="font-bold text-[var(--color-ink)]">{r.descricao}</p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            {r.categoriaItemNome} • {r.criterioJulgamentoNome}
          </p>
        </div>
      ),
    },
    {
      key: 'materialOuServico',
      header: 'Tipo',
      align: 'center',
      render: (r) => (
        <span
          className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold text-white ${
            r.materialOuServico === 'MATERIAL' ? 'bg-[var(--color-primary)]' : 'bg-[#7c3aed]'
          }`}
        >
          {r.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço'}
        </span>
      ),
    },
    { key: 'unidadeFornecimento', header: 'Unidade', align: 'center' },
    { key: 'quantidadeEstimada', header: 'Qtd.', align: 'center' },
    {
      key: 'valorUnitarioEstimado',
      header: 'Unitário (R$)',
      align: 'right',
      render: (r) => fmtBRL(r.valorUnitarioEstimado),
    },
    {
      key: 'valorTotalEstimado',
      header: 'Total (R$)',
      align: 'right',
      render: (r) => fmtBRL(r.valorTotalEstimado),
    },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => abrirEditar(r)}
            aria-label="Editar item"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <FilePenLine size={14} />
          </button>
          <button
            onClick={() => setExcluirItemId(r.id)}
            aria-label="Excluir item"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const catalogoFiltrado = catalogo.filter(
    (c) =>
      c.nome.toLowerCase().includes(buscaCatalogo.toLowerCase()) ||
      c.codigo.toLowerCase().includes(buscaCatalogo.toLowerCase()),
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-[1320px] rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 pr-8">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">{pca.nome}</h3>
            <p className="text-sm text-[var(--color-muted)]">
              {pca.nomeOrgao} • {pca.unidadeNome} • Ano {pca.anoPca} •{' '}
              <Badge tone={pca.status === 'RASCUNHO' ? 'neutral' : 'info'}>
                {pca.status === 'RASCUNHO' ? 'Rascunho' : 'Pronto para Envio'}
              </Badge>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportarCsv}
              disabled={pca.itens.length === 0}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f1f4f9] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={14} /> Exportar CSV
            </button>
            <button
              onClick={abrirNovo}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              <Plus size={14} /> Novo Item
            </button>
            <button
              onClick={() => {
                setForm(emptyForm)
                setView('importar')
              }}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              <Upload size={14} /> Importar CSV
            </button>
            <button
              onClick={() => setPncpOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[#7c3aed] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              <Upload size={14} /> Importar do PNCP
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] px-3 py-2 text-xs text-[var(--color-primary-strong)]">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Este PCA é da unidade <strong>{pca.unidadeNome}</strong>. Quando estiver completo, marque
            como "Pronto para Envio" na listagem — o administrador geral do sistema transmite todos os
            PCAs prontos ao PNCP de uma vez só.
          </span>
        </div>

        {view === 'form' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Origem do Item
                </p>
                <p className="text-sm text-[var(--color-ink)]">
                  {form.origemItem === 'CATALOGO'
                    ? 'Selecione um item já existente no catálogo.'
                    : 'Você vai cadastrar um novo item.'}
                </p>
              </div>
              <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
                <button
                  onClick={() => setForm((f) => ({ ...f, origemItem: 'MANUAL' }))}
                  className={`rounded-[8px] px-4 py-1.5 text-xs font-semibold transition ${
                    form.origemItem !== 'CATALOGO'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Novo item
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, origemItem: 'CATALOGO' }))}
                  className={`rounded-[8px] px-4 py-1.5 text-xs font-semibold transition ${
                    form.origemItem === 'CATALOGO'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Catálogo
                </button>
              </div>
            </div>

            {form.origemItem === 'CATALOGO' && !form.descricao ? (
              <div>
                <h4 className="font-display text-sm font-bold text-[#183263]">Escolha no catálogo</h4>
                <p className="mb-2 text-xs text-[var(--color-muted)]">
                  Selecione um item de referência para preencher o formulário.
                </p>
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                  <input
                    value={buscaCatalogo}
                    onChange={(e) => setBuscaCatalogo(e.target.value)}
                    placeholder="Buscar no catálogo..."
                    className="gt-input !pl-9"
                  />
                </div>
                <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                  {catalogoFiltrado.length === 0 && (
                    <li className="py-4 text-center text-xs text-[var(--color-muted)]">
                      Nenhum item no catálogo. Cadastre em Catálogo de Itens.
                    </li>
                  )}
                  {catalogoFiltrado.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => escolherDoCatalogo(c)}
                        className="flex w-full items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 text-left transition hover:bg-[var(--color-primary-soft)]"
                      >
                        <Package size={16} className="mt-0.5 shrink-0 text-[var(--color-primary-strong)]" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-[var(--color-ink)]">
                            {c.nome}
                          </span>
                          {c.especificacao && (
                            <span className="block text-xs text-[var(--color-muted)]">
                              {c.especificacao}
                            </span>
                          )}
                          <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                            Cód. {c.codigo} • {c.tipo} • {c.unidade}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <h4 className="font-display text-sm font-bold text-[#183263]">Informações do item</h4>
                <p className="mb-3 text-xs text-[var(--color-muted)]">
                  Preencha os campos exigidos pelo PNCP pra este item do PCA.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <TextAreaField
                    label="Descrição"
                    placeholder="Ex: Aquisição de notebooks para o setor administrativo"
                    value={form.descricao}
                    onChange={(v) => setForm((f) => ({ ...f, descricao: v }))}
                  />
                  <TextAreaField
                    label="Informação complementar"
                    placeholder="Especificações adicionais…"
                    value={form.informacaoComplementar}
                    onChange={(v) => setForm((f) => ({ ...f, informacaoComplementar: v }))}
                  />
                  <Labelled label="Material ou Serviço">
                    <Combo
                      value={form.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço'}
                      onChange={(v) =>
                        setForm((f) => ({ ...f, materialOuServico: v === 'Serviço' ? 'SERVICO' : 'MATERIAL' }))
                      }
                      options={['Material', 'Serviço']}
                      placeholder="Selecione"
                    />
                  </Labelled>
                  <Labelled label="Categoria do item">
                    <Combo
                      value={form.categoriaNome}
                      onChange={(v) => setForm((f) => ({ ...f, categoriaNome: v }))}
                      options={CATEGORIAS_ITEM_PCA.map((c) => c.nome)}
                      placeholder="Selecione"
                    />
                  </Labelled>
                  <Labelled label="Critério de julgamento">
                    <Combo
                      value={form.criterioNome}
                      onChange={(v) => setForm((f) => ({ ...f, criterioNome: v }))}
                      options={CRITERIOS_JULGAMENTO_PCA.map((c) => c.nome)}
                      placeholder="Selecione"
                    />
                  </Labelled>
                  <Labelled label="Unidade de medida">
                    <Combo
                      value={form.unidade}
                      onChange={(v) => setForm((f) => ({ ...f, unidade: v }))}
                      options={UNIDADES}
                      placeholder="Selecione ou digite para filtrar"
                      filterable
                    />
                  </Labelled>
                  <Labelled label="Margem de preferência">
                    <TogglePill
                      value={form.margem}
                      onChange={(v) => setForm((f) => ({ ...f, margem: v }))}
                    />
                  </Labelled>
                  <Labelled label="Exigência de conteúdo nacional">
                    <TogglePill
                      value={form.conteudoNacional}
                      onChange={(v) => setForm((f) => ({ ...f, conteudoNacional: v }))}
                    />
                  </Labelled>
                  <Field
                    label="Quantidade"
                    type="number"
                    placeholder="0"
                    value={form.qtd}
                    onChange={(v) => setForm((f) => ({ ...f, qtd: v }))}
                  />
                  <Field
                    label="Valor unitário"
                    type="number"
                    placeholder="0,00"
                    value={form.unitario}
                    onChange={(v) => setForm((f) => ({ ...f, unitario: v }))}
                  />
                  <Labelled label="Valor total">
                    <input
                      readOnly
                      value={`R$ ${fmtBRL(totalForm)}`}
                      className="gt-input cursor-not-allowed bg-[#f1f4f9] font-normal normal-case text-[var(--color-muted)]"
                    />
                  </Labelled>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setView('lista')}
                    className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={incluirItem}
                    disabled={!form.descricao.trim() || !form.categoriaNome || !form.criterioNome || !form.unidade}
                    className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {form.editId != null ? 'Salvar item' : 'Incluir item'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {view === 'importar' && (
          <div>
            <h4 className="font-display text-sm font-bold text-[#183263]">Importar itens de uma planilha</h4>
            <p className="mb-3 text-xs text-[var(--color-muted)]">
              Envie um arquivo .csv com as colunas: Nº, Descrição, Material/Serviço, Categoria,
              Critério de Julgamento, Margem de Preferência, Conteúdo Nacional, Unidade, Qtd.,
              Valor Unitário.
            </p>

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-control)] border-2 border-dashed border-[#c9d6ea] bg-[#f7f9fc] px-4 py-10 text-center">
              <Upload size={28} className="text-[var(--color-muted)]" />
              <span className="text-sm font-semibold text-[var(--color-primary-strong)]">
                {arquivo ? arquivo.name : 'Clique para selecionar o arquivo'}
              </span>
              <span className="text-xs text-[var(--color-muted)]">Formato .csv, até 5MB.</span>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  setErroImport('')
                  setArquivo(e.target.files?.[0] ?? null)
                }}
              />
            </label>

            {erroImport && <p className="mt-2 text-xs font-semibold text-[var(--color-danger)]">{erroImport}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setView('lista')
                  setArquivo(null)
                  setErroImport('')
                }}
                className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                onClick={importarArquivo}
                disabled={!arquivo}
                className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f9d55_0%,#198754_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Importar
              </button>
            </div>
          </div>
        )}

        {view !== 'importar' && (
          <div className={view === 'form' ? 'mt-6 border-t border-[var(--color-line)] pt-5' : ''}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-sm font-bold text-[#183263]">Itens do PCA</h4>
                <p className="text-xs text-[var(--color-muted)]">
                  Gerencie os itens deste PCA. Utilize os botões de ação para editá-los ou removê-los.
                </p>
              </div>
              <div className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-5 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Valor Total Estimado
                </p>
                <p className="text-lg font-extrabold text-[#183263]">R$ {fmtBRL(totalLote)}</p>
              </div>
            </div>

            <DataTable<PcaItemLocal>
              columns={cols}
              rows={pca.itens}
              rowKey={(r) => r.id}
              empty={
                <button onClick={abrirNovo} className="w-full">
                  <EmptyState
                    title="Nenhum item registrado"
                    subtitle="Inclua um item manualmente, do catálogo ou importe do PNCP para começar."
                  />
                </button>
              }
              footer={<span>Registros encontrados: {pca.itens.length}</span>}
            />
          </div>
        )}
      </div>

      {pncpOpen && <ImportarPncpItensModal pcaId={pcaId} onClose={() => setPncpOpen(false)} />}

      {alvoExcluir && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExcluirItemId(null)
          }}
        >
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
              <Trash2 size={24} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Excluir item?</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O item <strong>{alvoExcluir.descricao}</strong> será removido deste PCA.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => setExcluirItemId(null)}
                className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  removerItem(pcaId, alvoExcluir.id)
                  setExcluirItemId(null)
                }}
                className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TogglePill({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
      {([false, true] as const).map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition ${
            value === v ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted)]'
          }`}
        >
          {v ? 'Sim' : 'Não'}
        </button>
      ))}
    </div>
  )
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      {children}
    </label>
  )
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="gt-input min-w-0 font-normal normal-case"
        {...rest}
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="gt-input min-w-0 resize-y font-normal normal-case"
      />
    </label>
  )
}
