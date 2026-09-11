import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  FilePenLine,
  FolderTree,
  Info,
  Package,
  Plus,
  RefreshCw,
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
import { useOrganizacao } from '../../store/organizacao'
import {
  usePca,
  CATEGORIAS_ITEM_PCA,
  CRITERIOS_JULGAMENTO_PCA,
  GRAUS_PRIORIDADE,
  dfdCompleta,
  itemPcaCompleto,
  valorDfd,
  valorPca,
  valorPorDepartamento,
  type GrauPrioridade,
  type PcaDfd,
  type PcaItemLocal,
} from '../../store/pca'
import type { MaterialOuServico } from '../../services/types'
import { ImportarPncpItensModal } from './ImportarPncpItensModal'

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** ISO (aaaa-mm-dd) → dd/mm/aaaa e volta, para o <input type="date">. */
const isoToBr = (s: string) => {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}
const brToIso = (s: string) => {
  const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

const dfdVazia = {
  editId: null as string | null,
  objeto: '',
  grauPrioridade: 'Média' as GrauPrioridade,
  dataDesejadaIso: '',
  departamentos: [] as string[],
  justificativa: '',
}

const itemVazio = {
  editId: null as string | null,
  origemItem: 'CATALOGO' as PcaItemLocal['origem'],
  catalogoTravado: false,
  materialOuServico: 'MATERIAL' as MaterialOuServico,
  descricao: '',
  informacaoComplementar: '',
  categoriaNome: '',
  criterioNome: '',
  margem: false,
  conteudoNacional: false,
  unidade: '',
  modoQtd: 'geral' as 'geral' | 'departamento',
  qtd: '',
  qtdDepto: {} as Record<string, string>,
  unitario: '',
  codigoItemCatalogo: '',
  temVinculo: false,
  vinculoNumeroItem: '',
}

type View = 'dfds' | 'dfd-form' | 'itens' | 'item-form' | 'importar'

export function PcaDfdsModal({ pcaId, onClose }: { pcaId: string; onClose: () => void }) {
  const pca = usePca((s) => s.pcas.find((p) => p.id === pcaId))
  const adicionarDfd = usePca((s) => s.adicionarDfd)
  const atualizarDfd = usePca((s) => s.atualizarDfd)
  const removerDfd = usePca((s) => s.removerDfd)
  const adicionarItem = usePca((s) => s.adicionarItem)
  const atualizarItem = usePca((s) => s.atualizarItem)
  const removerItem = usePca((s) => s.removerItem)
  const catalogo = useCatalogo((s) => s.itens)
  const setores = useOrganizacao((s) => s.setores)

  const [view, setView] = useState<View>('dfds')
  const [dfdAtivoId, setDfdAtivoId] = useState<string | null>(null)
  const [dfdForm, setDfdForm] = useState(dfdVazia)
  const [itemForm, setItemForm] = useState(itemVazio)
  const [buscaCatalogo, setBuscaCatalogo] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroImport, setErroImport] = useState('')
  const [pncpOpen, setPncpOpen] = useState(false)
  const [excluirDfdId, setExcluirDfdId] = useState<string | null>(null)
  const [excluirItemId, setExcluirItemId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!pca) return null

  const dfdAtivo = pca.dfds.find((d) => d.id === dfdAtivoId) ?? null
  const alvoExcluirDfd = pca.dfds.find((d) => d.id === excluirDfdId) ?? null
  const alvoExcluirItem = dfdAtivo?.itens.find((i) => i.id === excluirItemId) ?? null

  const deptosDaDfd = dfdAtivo?.departamentos ?? []
  const usarRateio = itemForm.modoQtd === 'departamento' && deptosDaDfd.length > 0
  const qtdTotalForm = usarRateio
    ? deptosDaDfd.reduce((s, d) => s + (Number(itemForm.qtdDepto[d]) || 0), 0)
    : Number(itemForm.qtd) || 0
  const totalForm = qtdTotalForm * (Number(itemForm.unitario) || 0)
  const setoresNomes = setores.map((s) => s.nome)
  const resumoDepto = valorPorDepartamento(pca)

  // ----- DFD -----------------------------------------------------------------
  const abrirNovaDfd = () => {
    setDfdForm(dfdVazia)
    setView('dfd-form')
  }
  const abrirEditarDfd = (d: PcaDfd) => {
    setDfdForm({
      editId: d.id,
      objeto: d.objeto,
      grauPrioridade: d.grauPrioridade,
      dataDesejadaIso: brToIso(d.dataDesejada),
      departamentos: d.departamentos,
      justificativa: d.justificativa,
    })
    setView('dfd-form')
  }
  const toggleDepto = (nome: string) =>
    setDfdForm((f) => ({
      ...f,
      departamentos: f.departamentos.includes(nome)
        ? f.departamentos.filter((d) => d !== nome)
        : [...f.departamentos, nome],
    }))

  const dfdFormValido =
    Boolean(dfdForm.objeto.trim()) &&
    Boolean(dfdForm.grauPrioridade) &&
    Boolean(dfdForm.dataDesejadaIso) &&
    dfdForm.departamentos.length > 0

  const salvarDfd = () => {
    if (!dfdFormValido) return
    const payload = {
      objeto: dfdForm.objeto.trim(),
      grauPrioridade: dfdForm.grauPrioridade,
      dataDesejada: isoToBr(dfdForm.dataDesejadaIso),
      departamentos: dfdForm.departamentos,
      justificativa: dfdForm.justificativa.trim(),
    }
    if (dfdForm.editId) atualizarDfd(pcaId, dfdForm.editId, payload)
    else {
      const id = adicionarDfd(pcaId, payload)
      setDfdAtivoId(id)
    }
    setView('dfds')
  }

  // ----- Item --------------------------------------------------------------
  const abrirNovoItem = () => {
    setItemForm(itemVazio)
    setView('item-form')
  }
  const abrirEditarItem = (it: PcaItemLocal) => {
    const noCatalogo = Boolean(
      it.codigoItemCatalogo && catalogo.some((c) => c.codigo === it.codigoItemCatalogo),
    )
    setItemForm({
      editId: it.id,
      origemItem: it.origem,
      catalogoTravado: noCatalogo,
      materialOuServico: it.materialOuServico,
      descricao: it.descricao,
      informacaoComplementar: it.informacaoComplementar ?? '',
      categoriaNome: it.categoriaItemNome,
      criterioNome: it.criterioJulgamentoNome,
      margem: it.aplicabilidadeMargemPreferencia,
      conteudoNacional: it.exigenciaConteudoNacional,
      unidade: it.unidadeFornecimento,
      modoQtd: it.quantidades && Object.keys(it.quantidades).length > 0 ? 'departamento' : 'geral',
      qtd: String(it.quantidadeEstimada),
      qtdDepto: Object.fromEntries(
        Object.entries(it.quantidades ?? {}).map(([k, v]) => [k, String(v)]),
      ),
      unitario: String(it.valorUnitarioEstimado),
      codigoItemCatalogo: it.codigoItemCatalogo ?? '',
      temVinculo: it.temVinculo ?? false,
      vinculoNumeroItem: it.vinculoNumeroItem ? String(it.vinculoNumeroItem) : '',
    })
    setView('item-form')
  }

  const escolherDoCatalogo = (c: (typeof catalogo)[number]) => {
    const catNome = CATEGORIAS_ITEM_PCA.find((x) => x.nome === c.tipo)?.nome ?? 'Material'
    setItemForm((f) => ({
      ...f,
      origemItem: 'CATALOGO',
      catalogoTravado: true,
      materialOuServico: c.tipo === 'Serviço' ? 'SERVICO' : 'MATERIAL',
      descricao: c.nome,
      informacaoComplementar: c.especificacao,
      unidade: c.unidade,
      codigoItemCatalogo: c.codigo,
      categoriaNome: f.categoriaNome || catNome,
      criterioNome: f.criterioNome || 'Menor preço',
    }))
  }

  const trocarItemDoCatalogo = () =>
    setItemForm((f) => ({
      ...f,
      catalogoTravado: false,
      materialOuServico: 'MATERIAL',
      descricao: '',
      informacaoComplementar: '',
      unidade: '',
      codigoItemCatalogo: '',
    }))

  const valorOk = qtdTotalForm > 0 && (Number(itemForm.unitario) || 0) > 0
  const itemFormValido = itemForm.catalogoTravado
    ? valorOk
    : Boolean(itemForm.descricao.trim()) &&
      Boolean(itemForm.categoriaNome) &&
      Boolean(itemForm.criterioNome) &&
      Boolean(itemForm.unidade) &&
      Boolean(itemForm.codigoItemCatalogo.trim()) &&
      valorOk &&
      (!itemForm.temVinculo || Boolean(itemForm.vinculoNumeroItem))

  const incluirItem = () => {
    if (!itemFormValido || !dfdAtivo) return
    const categoria =
      CATEGORIAS_ITEM_PCA.find((c) => c.nome === itemForm.categoriaNome) ?? CATEGORIAS_ITEM_PCA[0]
    const criterio =
      CRITERIOS_JULGAMENTO_PCA.find((c) => c.nome === itemForm.criterioNome) ??
      CRITERIOS_JULGAMENTO_PCA[0]

    const payload = {
      numeroItem:
        itemForm.editId != null
          ? (dfdAtivo.itens.find((i) => i.id === itemForm.editId)?.numeroItem ?? 1)
          : Math.max(0, ...dfdAtivo.itens.map((i) => i.numeroItem)) + 1,
      materialOuServico: itemForm.materialOuServico,
      categoriaItemId: categoria.id,
      categoriaItemNome: categoria.nome,
      criterioJulgamentoId: criterio.id,
      criterioJulgamentoNome: criterio.nome,
      aplicabilidadeMargemPreferencia: itemForm.margem,
      exigenciaConteudoNacional: itemForm.conteudoNacional,
      classificacao: categoria.nome,
      descricao: itemForm.descricao.trim(),
      informacaoComplementar: itemForm.informacaoComplementar.trim() || undefined,
      unidadeFornecimento: itemForm.unidade,
      quantidadeEstimada: qtdTotalForm,
      quantidades: usarRateio
        ? Object.fromEntries(deptosDaDfd.map((d) => [d, Number(itemForm.qtdDepto[d]) || 0]))
        : undefined,
      valorUnitarioEstimado: Number(itemForm.unitario) || 0,
      codigoItemCatalogo: itemForm.codigoItemCatalogo.trim(),
      temVinculo: itemForm.temVinculo,
      vinculoNumeroItem: itemForm.temVinculo ? Number(itemForm.vinculoNumeroItem) || 0 : 0,
      origem: itemForm.origemItem,
    }

    if (itemForm.editId != null) atualizarItem(pcaId, dfdAtivo.id, itemForm.editId, payload)
    else adicionarItem(pcaId, dfdAtivo.id, payload)
    setView('itens')
  }

  // ----- CSV --------------------------------------------------------------
  const exportarCsv = () => {
    if (!dfdAtivo) return
    const linhas = [
      [
        'Nº', 'Descrição', 'Material/Serviço', 'Código CatMat/CatSer', 'Categoria',
        'Critério de Julgamento', 'Margem de Preferência', 'Conteúdo Nacional', 'Unidade',
        'Qtd.', 'Valor Unit. (R$)', 'Valor Total (R$)', 'Depende do Item Nº',
      ],
      ...dfdAtivo.itens.map((i) => [
        String(i.numeroItem),
        i.descricao,
        i.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço',
        i.codigoItemCatalogo,
        i.categoriaItemNome,
        i.criterioJulgamentoNome,
        i.aplicabilidadeMargemPreferencia ? 'Sim' : 'Não',
        i.exigenciaConteudoNacional ? 'Sim' : 'Não',
        i.unidadeFornecimento,
        String(i.quantidadeEstimada),
        i.valorUnitarioEstimado.toFixed(2),
        i.valorTotalEstimado.toFixed(2),
        i.temVinculo ? String(i.vinculoNumeroItem) : '',
      ]),
    ]
    const csv = linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pca-${pca.nome.replace(/[\\/]/g, '-')}-dfd-${dfdAtivo.numero}-itens.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const importarArquivo = async () => {
    if (!arquivo || !dfdAtivo) return
    try {
      const texto = await arquivo.text()
      const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0)
      if (linhas.length < 2) {
        setErroImport('Arquivo vazio ou sem itens após o cabeçalho.')
        return
      }
      let proximoNumero = Math.max(0, ...dfdAtivo.itens.map((i) => i.numeroItem)) + 1
      linhas.slice(1).forEach((linha) => {
        const cols = linha.split(/[;,]/).map((c) => c.replace(/^"|"$/g, '').trim())
        const [
          , descricao, materialServico, codigo, categoriaNome, criterioNome, margem, conteudo,
          unidade, qtd, unitario, , dependeDe,
        ] = cols
        const categoria =
          CATEGORIAS_ITEM_PCA.find((c) => c.nome === categoriaNome) ?? CATEGORIAS_ITEM_PCA[0]
        const criterio =
          CRITERIOS_JULGAMENTO_PCA.find((c) => c.nome === criterioNome) ?? CRITERIOS_JULGAMENTO_PCA[0]
        const q = Number(qtd) || 0
        const u = Number(unitario) || 0
        const depende = Number(dependeDe) || 0
        adicionarItem(pcaId, dfdAtivo.id, {
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
          codigoItemCatalogo: codigo?.trim() ?? '',
          temVinculo: depende > 0,
          vinculoNumeroItem: depende,
          origem: 'MANUAL',
        })
      })
      setArquivo(null)
      setErroImport('')
      setView('itens')
    } catch {
      setErroImport('Não foi possível ler o arquivo. Envie um .csv exportado de uma planilha.')
    }
  }

  // ----- colunas ----------------------------------------------------------
  const dfdCols: Column<PcaDfd>[] = [
    { key: 'numero', header: 'Nº', align: 'center' },
    {
      key: 'objeto',
      header: 'Objeto',
      render: (d) => (
        <div className="max-w-[280px]">
          <p className="flex items-center gap-1.5 font-bold text-[var(--color-ink)]">
            {d.objeto}
            {!dfdCompleta(d) && (
              <span className="rounded-[var(--radius-pill)] bg-[#fdf1dc] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#a3720c]">
                Incompleta
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            {d.departamentos.length > 0 ? d.departamentos.join(', ') : 'Sem departamento'}
          </p>
        </div>
      ),
    },
    {
      key: 'grauPrioridade',
      header: 'Prioridade',
      align: 'center',
      render: (d) => (
        <Badge tone={d.grauPrioridade === 'Alta' ? 'danger' : d.grauPrioridade === 'Baixa' ? 'neutral' : 'info'}>
          {d.grauPrioridade}
        </Badge>
      ),
    },
    { key: 'dataDesejada', header: 'Data desejada', align: 'center', render: (d) => d.dataDesejada || '—' },
    { key: 'itens', header: 'Itens', align: 'center', render: (d) => d.itens.length },
    {
      key: 'valor',
      header: 'Subtotal (R$)',
      align: 'right',
      render: (d) => fmtBRL(valorDfd(d)),
    },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (d) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setDfdAtivoId(d.id)
              setView('itens')
            }}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <FilePenLine size={13} /> Itens
          </button>
          <button
            onClick={() => abrirEditarDfd(d)}
            aria-label="Editar DFD"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <FilePenLine size={14} />
          </button>
          <button
            onClick={() => setExcluirDfdId(d.id)}
            aria-label="Excluir DFD"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const itemCols: Column<PcaItemLocal>[] = [
    { key: 'numeroItem', header: 'Nº', align: 'center' },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (r) => (
        <div className="max-w-[380px]">
          <p className="flex items-center gap-1.5 font-bold text-[var(--color-ink)]">
            {r.descricao}
            {!itemPcaCompleto(r) && (
              <span className="rounded-[var(--radius-pill)] bg-[#fdf1dc] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#a3720c]">
                Incompleto
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Cód. {r.codigoItemCatalogo || '—'}
            {r.quantidades && Object.keys(r.quantidades).length > 0
              ? ` • ${Object.entries(r.quantidades)
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}`
              : ''}
            {r.temVinculo && r.vinculoNumeroItem ? ` • depende do item nº ${r.vinculoNumeroItem}` : ''}
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
            onClick={() => abrirEditarItem(r)}
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

  const campoQuantidade = (
    <>
      {deptosDaDfd.length > 0 && (
        <Labelled label="Quantidade">
          <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
            {(['geral', 'departamento'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setItemForm((f) => ({ ...f, modoQtd: m }))}
                className={`flex-1 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition ${
                  itemForm.modoQtd === m ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted)]'
                }`}
              >
                {m === 'geral' ? 'Geral' : 'Por departamento'}
              </button>
            ))}
          </div>
        </Labelled>
      )}
      {usarRateio ? (
        <>
          {deptosDaDfd.map((d) => (
            <Field
              key={d}
              label={`Qtd — ${d}`}
              type="number"
              placeholder="0"
              value={itemForm.qtdDepto[d] ?? ''}
              onChange={(v) =>
                setItemForm((f) => ({ ...f, qtdDepto: { ...f.qtdDepto, [d]: v } }))
              }
            />
          ))}
          <Labelled label="Quantidade total">
            <input
              readOnly
              value={String(qtdTotalForm)}
              className="gt-input cursor-not-allowed bg-[#f1f4f9] font-normal normal-case text-[var(--color-muted)]"
            />
          </Labelled>
        </>
      ) : (
        <Field
          label="Quantidade"
          type="number"
          placeholder="0"
          value={itemForm.qtd}
          onChange={(v) => setItemForm((f) => ({ ...f, qtd: v }))}
        />
      )}
    </>
  )

  const camposAvancados = (
    <>
      <Labelled label="Categoria do item">
        <Combo
          value={itemForm.categoriaNome}
          onChange={(v) => setItemForm((f) => ({ ...f, categoriaNome: v }))}
          options={CATEGORIAS_ITEM_PCA.map((c) => c.nome)}
          placeholder="Selecione"
        />
      </Labelled>
      <Labelled label="Critério de julgamento">
        <Combo
          value={itemForm.criterioNome}
          onChange={(v) => setItemForm((f) => ({ ...f, criterioNome: v }))}
          options={CRITERIOS_JULGAMENTO_PCA.map((c) => c.nome)}
          placeholder="Selecione"
        />
      </Labelled>
      <Labelled label="Margem de preferência">
        <TogglePill value={itemForm.margem} onChange={(v) => setItemForm((f) => ({ ...f, margem: v }))} />
      </Labelled>
      <Labelled label="Exigência de conteúdo nacional">
        <TogglePill
          value={itemForm.conteudoNacional}
          onChange={(v) => setItemForm((f) => ({ ...f, conteudoNacional: v }))}
        />
      </Labelled>
      <Labelled label="Depende de outro item?">
        <TogglePill
          value={itemForm.temVinculo}
          onChange={(v) =>
            setItemForm((f) => ({ ...f, temVinculo: v, vinculoNumeroItem: v ? f.vinculoNumeroItem : '' }))
          }
        />
      </Labelled>
      {itemForm.temVinculo && (
        <Labelled label="Depende do item Nº">
          <select
            value={itemForm.vinculoNumeroItem}
            onChange={(e) => setItemForm((f) => ({ ...f, vinculoNumeroItem: e.target.value }))}
            className="gt-input font-normal normal-case"
          >
            <option value="">Selecione</option>
            {(dfdAtivo?.itens ?? [])
              .filter((i) => i.id !== itemForm.editId)
              .map((i) => (
                <option key={i.id} value={i.numeroItem}>
                  Nº {i.numeroItem} — {i.descricao}
                </option>
              ))}
          </select>
        </Labelled>
      )}
    </>
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
          {view === 'dfds' && (
            <button
              onClick={abrirNovaDfd}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              <Plus size={14} /> Nova DFD
            </button>
          )}
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] px-3 py-2 text-xs text-[var(--color-primary-strong)]">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Este PCA é da unidade <strong>{pca.unidadeNome}</strong>. Cada DFD (Documento de
            Formalização da Demanda) agrupa itens com o mesmo grau de prioridade, prazo e
            departamentos demandantes. O valor total do PCA é a soma das DFDs.
          </span>
        </div>

        {/* ---------- LISTA DE DFDs ---------- */}
        {view === 'dfds' && (
          <>
            <DataTable<PcaDfd>
              columns={dfdCols}
              rows={pca.dfds}
              rowKey={(d) => d.id}
              empty={
                <button onClick={abrirNovaDfd} className="w-full">
                  <EmptyState
                    icon={FolderTree}
                    title="Nenhuma DFD cadastrada"
                    subtitle="Crie uma DFD (ex.: Material de Limpeza, Material de Expediente) para adicionar itens."
                  />
                </button>
              }
              footer={<span>DFDs: {pca.dfds.length}</span>}
            />

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
              {resumoDepto.length > 0 && (
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
                  <p className="bg-[#eef3fb] px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                    Resumo por departamento
                  </p>
                  <table className="w-full text-sm">
                    <tbody>
                      {resumoDepto.map((r) => (
                        <tr key={r.departamento} className="border-t border-[var(--color-line)]">
                          <td className="px-4 py-1.5 text-[var(--color-ink)]">{r.departamento}</td>
                          <td className="px-4 py-1.5 text-right font-semibold">R$ {fmtBRL(r.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="px-4 py-1.5 text-[10px] text-[var(--color-muted)]">
                    Itens com quantidade por departamento usam o rateio informado; os demais dividem
                    o valor igualmente entre os departamentos da DFD.
                  </p>
                </div>
              )}
              <div className="self-start rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-5 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Valor Total do PCA
                </p>
                <p className="text-lg font-extrabold text-[#183263]">R$ {fmtBRL(valorPca(pca))}</p>
              </div>
            </div>
          </>
        )}

        {/* ---------- FORM DE DFD ---------- */}
        {view === 'dfd-form' && (
          <div>
            <h4 className="font-display text-sm font-bold text-[#183263]">
              {dfdForm.editId ? 'Editar DFD' : 'Nova DFD'}
            </h4>
            <p className="mb-3 text-xs text-[var(--color-muted)]">
              Objeto, grau de prioridade, data desejada e departamentos demandantes valem para
              todos os itens desta DFD.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Field
                  label="Objeto da demanda"
                  placeholder="Ex.: Material de Limpeza"
                  value={dfdForm.objeto}
                  onChange={(v) => setDfdForm((f) => ({ ...f, objeto: v }))}
                />
              </div>
              <Labelled label="Grau de prioridade">
                <Combo
                  value={dfdForm.grauPrioridade}
                  onChange={(v) => setDfdForm((f) => ({ ...f, grauPrioridade: v as GrauPrioridade }))}
                  options={GRAUS_PRIORIDADE}
                  placeholder="Selecione"
                />
              </Labelled>
              <Field
                label="Data desejada"
                type="date"
                value={dfdForm.dataDesejadaIso}
                onChange={(v) => setDfdForm((f) => ({ ...f, dataDesejadaIso: v }))}
              />
              <div className="sm:col-span-3">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Departamentos demandantes
                </p>
                {setoresNomes.length === 0 ? (
                  <div className="flex items-start gap-2 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs text-[#8a6d1a]">
                    Nenhum setor cadastrado.{' '}
                    <Link to="/GerenciarUnidadeSetor" className="font-semibold underline">
                      Cadastre em Gerenciar Unidade/Setor
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {setoresNomes.map((nome) => {
                      const on = dfdForm.departamentos.includes(nome)
                      return (
                        <button
                          key={nome}
                          type="button"
                          onClick={() => toggleDepto(nome)}
                          className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-semibold transition ${
                            on
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                              : 'border-[var(--color-line)] bg-white text-[var(--color-muted)]'
                          }`}
                        >
                          {nome}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="sm:col-span-3">
                <TextAreaField
                  label="Justificativa da demanda"
                  placeholder="Por que esta demanda precisa ser contratada?"
                  value={dfdForm.justificativa}
                  onChange={(v) => setDfdForm((f) => ({ ...f, justificativa: v }))}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setView('dfds')}
                className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                onClick={salvarDfd}
                disabled={!dfdFormValido}
                className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {dfdForm.editId ? 'Salvar DFD' : 'Criar DFD'}
              </button>
            </div>
          </div>
        )}

        {/* ---------- ITENS DE UMA DFD ---------- */}
        {(view === 'itens' || view === 'item-form' || view === 'importar') && dfdAtivo && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setView('dfds')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary-strong)]"
              >
                <ArrowLeft size={14} /> Voltar às DFDs
              </button>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={exportarCsv}
                  disabled={dfdAtivo.itens.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f1f4f9] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={14} /> Exportar CSV
                </button>
                <button
                  onClick={abrirNovoItem}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
                >
                  <Plus size={14} /> Novo Item
                </button>
                <button
                  onClick={() => {
                    setArquivo(null)
                    setErroImport('')
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

            <div className="mb-3 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] px-4 py-3">
              <p className="font-display text-sm font-bold text-[#183263]">
                DFD Nº {dfdAtivo.numero} — {dfdAtivo.objeto}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {dfdAtivo.grauPrioridade} • {dfdAtivo.dataDesejada || 'sem data'} •{' '}
                {dfdAtivo.departamentos.join(', ') || 'sem departamento'}
              </p>
            </div>

            {/* item form */}
            {view === 'item-form' && (
              <div className="mb-6 border-b border-[var(--color-line)] pb-5">
                {itemForm.editId == null && !itemForm.catalogoTravado ? (
                  <div>
                    <h4 className="font-display text-sm font-bold text-[#183263]">Escolha no catálogo</h4>
                    <p className="mb-2 text-xs text-[var(--color-muted)]">
                      Todo item vem do <strong>Catálogo de Itens</strong>. Selecione um; depois
                      informe quantidade e valor unitário.
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
                          Nenhum item no catálogo.{' '}
                          <Link to="/CatalogoItens" className="font-semibold text-[var(--color-primary-strong)] underline">
                            Cadastre no Catálogo de Itens
                          </Link>
                          .
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
                              <span className="block text-sm font-semibold text-[var(--color-ink)]">{c.nome}</span>
                              {c.especificacao && (
                                <span className="block text-xs text-[var(--color-muted)]">{c.especificacao}</span>
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
                      {itemForm.catalogoTravado
                        ? 'Os dados do item vêm do Catálogo de Itens. Informe apenas a quantidade e o valor unitário.'
                        : 'Preencha os campos exigidos pelo PNCP pra este item.'}
                    </p>

                    {itemForm.catalogoTravado ? (
                      <>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-4 py-3">
                          <div className="flex items-start gap-2">
                            <Package size={16} className="mt-0.5 shrink-0 text-[var(--color-primary-strong)]" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--color-ink)]">{itemForm.descricao}</p>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                                Item do catálogo • Cód. {itemForm.codigoItemCatalogo || '—'} •{' '}
                                {itemForm.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço'} •{' '}
                                {itemForm.unidade}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={trocarItemDoCatalogo}
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-strong)]"
                          >
                            <RefreshCw size={13} /> Trocar item do catálogo
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <ReadOnlyField label="Descrição (do catálogo)" value={itemForm.descricao} />
                          <ReadOnlyField
                            label="Informação complementar (do catálogo)"
                            value={itemForm.informacaoComplementar || '—'}
                          />
                          <ReadOnlyField
                            label="Material ou Serviço (do catálogo)"
                            value={itemForm.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço'}
                          />
                          <ReadOnlyField label="Unidade de medida (do catálogo)" value={itemForm.unidade} />
                          <ReadOnlyField
                            label="Código CatMat/CatSer (do catálogo)"
                            value={itemForm.codigoItemCatalogo || '—'}
                          />
                          {campoQuantidade}
                          <Field
                            label="Valor unitário"
                            type="number"
                            placeholder="0,00"
                            value={itemForm.unitario}
                            onChange={(v) => setItemForm((f) => ({ ...f, unitario: v }))}
                          />
                          <Labelled label="Valor total">
                            <input
                              readOnly
                              value={`R$ ${fmtBRL(totalForm)}`}
                              className="gt-input cursor-not-allowed bg-[#f1f4f9] font-normal normal-case text-[var(--color-muted)]"
                            />
                          </Labelled>
                        </div>

                        <details className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] px-4 py-3">
                          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                            Dados complementares do PNCP (já preenchidos — ajuste se precisar)
                          </summary>
                          <div className="mt-3 grid gap-4 sm:grid-cols-3">{camposAvancados}</div>
                        </details>
                      </>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-3">
                        <TextAreaField
                          label="Descrição"
                          placeholder="Ex: Aquisição de notebooks para o setor administrativo"
                          value={itemForm.descricao}
                          onChange={(v) => setItemForm((f) => ({ ...f, descricao: v }))}
                        />
                        <TextAreaField
                          label="Informação complementar"
                          placeholder="Especificações adicionais…"
                          value={itemForm.informacaoComplementar}
                          onChange={(v) => setItemForm((f) => ({ ...f, informacaoComplementar: v }))}
                        />
                        <Labelled label="Material ou Serviço">
                          <Combo
                            value={itemForm.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço'}
                            onChange={(v) =>
                              setItemForm((f) => ({ ...f, materialOuServico: v === 'Serviço' ? 'SERVICO' : 'MATERIAL' }))
                            }
                            options={['Material', 'Serviço']}
                            placeholder="Selecione"
                          />
                        </Labelled>
                        <Labelled label="Unidade de medida">
                          <Combo
                            value={itemForm.unidade}
                            onChange={(v) => setItemForm((f) => ({ ...f, unidade: v }))}
                            options={UNIDADES}
                            placeholder="Selecione ou digite para filtrar"
                            filterable
                          />
                        </Labelled>
                        <Field
                          label="Código CatMat/CatSer"
                          placeholder="Ex.: 150912"
                          value={itemForm.codigoItemCatalogo}
                          onChange={(v) => setItemForm((f) => ({ ...f, codigoItemCatalogo: v }))}
                        />
                        {campoQuantidade}
                        <Field
                          label="Valor unitário"
                          type="number"
                          placeholder="0,00"
                          value={itemForm.unitario}
                          onChange={(v) => setItemForm((f) => ({ ...f, unitario: v }))}
                        />
                        <Labelled label="Valor total">
                          <input
                            readOnly
                            value={`R$ ${fmtBRL(totalForm)}`}
                            className="gt-input cursor-not-allowed bg-[#f1f4f9] font-normal normal-case text-[var(--color-muted)]"
                          />
                        </Labelled>
                        {camposAvancados}
                      </div>
                    )}

                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        onClick={() => setView('itens')}
                        className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={incluirItem}
                        disabled={!itemFormValido}
                        className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {itemForm.editId != null ? 'Salvar item' : 'Incluir item'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* importar csv */}
            {view === 'importar' && (
              <div className="mb-6 border-b border-[var(--color-line)] pb-5">
                <h4 className="font-display text-sm font-bold text-[#183263]">Importar itens de uma planilha</h4>
                <p className="mb-3 text-xs text-[var(--color-muted)]">
                  Envie um .csv no formato do "Exportar CSV": Nº, Descrição, Material/Serviço, Código
                  CatMat/CatSer, Categoria, Critério de Julgamento, Margem de Preferência, Conteúdo
                  Nacional, Unidade, Qtd., Valor Unit., Valor Total, Depende do Item Nº. Os itens
                  entram nesta DFD.
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
                {erroImport && (
                  <p className="mt-2 text-xs font-semibold text-[var(--color-danger)]">{erroImport}</p>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setView('itens')
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

            {/* tabela de itens da DFD */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-sm font-bold text-[#183263]">Itens da DFD</h4>
                <p className="text-xs text-[var(--color-muted)]">
                  Gerencie os itens desta DFD. Grau de prioridade e data desejada são da DFD.
                </p>
              </div>
              <div className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-5 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Subtotal da DFD
                </p>
                <p className="text-lg font-extrabold text-[#183263]">R$ {fmtBRL(valorDfd(dfdAtivo))}</p>
              </div>
            </div>

            <DataTable<PcaItemLocal>
              columns={itemCols}
              rows={dfdAtivo.itens}
              rowKey={(r) => r.id}
              empty={
                <button onClick={abrirNovoItem} className="w-full">
                  <EmptyState
                    title="Nenhum item nesta DFD"
                    subtitle="Inclua um item do catálogo ou importe do PNCP para começar."
                  />
                </button>
              }
              footer={<span>Itens: {dfdAtivo.itens.length}</span>}
            />
          </div>
        )}
      </div>

      {pncpOpen && dfdAtivo && (
        <ImportarPncpItensModal pcaId={pcaId} dfdId={dfdAtivo.id} onClose={() => setPncpOpen(false)} />
      )}

      {alvoExcluirDfd && (
        <ConfirmDialog
          titulo="Excluir DFD?"
          texto={
            <>
              A DFD <strong>{alvoExcluirDfd.objeto}</strong> e todos os seus {alvoExcluirDfd.itens.length}{' '}
              item(ns) serão removidos. Esta ação não pode ser desfeita.
            </>
          }
          onCancel={() => setExcluirDfdId(null)}
          onConfirm={() => {
            removerDfd(pcaId, alvoExcluirDfd.id)
            if (dfdAtivoId === alvoExcluirDfd.id) {
              setDfdAtivoId(null)
              setView('dfds')
            }
            setExcluirDfdId(null)
          }}
        />
      )}

      {alvoExcluirItem && dfdAtivo && (
        <ConfirmDialog
          titulo="Excluir item?"
          texto={
            <>
              O item <strong>{alvoExcluirItem.descricao}</strong> será removido desta DFD.
            </>
          }
          onCancel={() => setExcluirItemId(null)}
          onConfirm={() => {
            removerItem(pcaId, dfdAtivo.id, alvoExcluirItem.id)
            setExcluirItemId(null)
          }}
        />
      )}
    </div>
  )
}

function ConfirmDialog({
  titulo,
  texto,
  onCancel,
  onConfirm,
}: {
  titulo: string
  texto: React.ReactNode
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
          <Trash2 size={24} />
        </span>
        <p className="mt-3 font-display text-base font-bold text-[#183263]">{titulo}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{texto}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
          >
            Sim, excluir
          </button>
        </div>
      </div>
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <input
        readOnly
        value={value}
        className="gt-input min-w-0 cursor-not-allowed bg-[#f1f4f9] font-normal normal-case text-[var(--color-muted)]"
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
