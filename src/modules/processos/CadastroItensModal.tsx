import { useRef, useState } from 'react'
import {
  Download,
  FilePenLine,
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

type ItemLote = {
  codigo: string
  sequencia: string
  nome: string
  tipo: string
  unidade: string
  qtd: number
  unitario: number
  total: number
}

const TIPOS_ITEM = ['Material', 'Serviço']
const UNIDADES = [
  'Unidade (Un)',
  'Quilograma (Kg)',
  'Metro (m)',
  'Litro (L)',
  'Hora (h)',
  'Metro Cúbico (m³)',
  'Grama (g)',
  'Dia (d)',
  'Posto de Trabalho (PT)',
  'AMPOLA (AM)',
  'ANO/ANOS (ANO)',
  'ARROBA (ARR)',
  'BARRIL (BAR)',
  'BALDE (BD)',
  'BISNAGA (BIS)',
  'BLOCO (BL)',
  'BARRICA (BRI)',
  'BOTIJÃO (BTJ)',
  'CENTENA (C)',
  'CARTUCHO (CA)',
  'CÁPSULA (CAPS)',
  'CILINDRADA (CC)',
  'CHAPA (CH)',
  'CILINDRO (CIL)',
  'CONJUNTO (CJ)',
  'CENTÍMETRO (CM)',
  'CENTIMETRO QUADRADO (CM2)',
  'CENTÍMETRO CÚBICO (CM3)',
  'CONTEINER (CO)',
  'COMPRIMENTO (COMP)',
  'CÓPIA (CÓPIA)',
  'CAIXA (CX)',
  'DIA (DIA)',
  'DIAS (DIAS)',
  'DUZIA (DZ)',
  'FARDO (FD)',
  'FOLHA (FL)',
  'FRASCO (FR)',
  'FRASCO-AMPOLA (FR-AM)',
  'GALÃO (GL)',
  'GARRAFA (GRF)',
  'GARRAFÃO (GRR)',
  'HECTARE (HA)',
  'HABITANTES (HAB)',
  'HORA-AULA (H-AULA)',
  'HOMEM/HORA (HOMEM/H)',
  'JOGO (JG)',
  'QUILOBYTE (KB)',
  'KILOHERTZ (KHZ)',
  'QUILOMETRO (KM)',
  'QUILOWATT-HORA (KWH)',
  'LIBRA (LB)',
  'LOTE (LOTE)',
  'LATA (LT)',
  'METRO QUADRADO (M2)',
  'MAÇO (MÇ)',
  'MICROGRAMA (MCG)',
  'MÊS/MESES (MÊS)',
  'MILIGRAMA (MG)',
  'MILHA (MI)',
  'MILHEIRO (MIL)',
  'MINUTO (MIN)',
  'METRO KILOGRAMAFORÇA (MKGF)',
  'MILILITRO (ML)',
  'MILÍMETRO (MM)',
  'MILÍMETRO QUADRADO (MM2)',
  'MILIWATT (MW)',
  'ONÇA (OZ)',
  'PEÇA (PC)',
  'PACOTE (PCT)',
  'PÉ (PE)',
  'PESSOA / DIA (PE/D)',
  'PERCENTAGEM (PER)',
  'POLEGADA (POL)',
  'POTE (POTE)',
  'RESMA (RES)',
  'RENDA MÉDIA/PESSOA (RM/PESS)',
  'ROLO (RO)',
  'SACO (SC)',
  'TONELADA (T)',
  'TONELADA/KM² (T/KM²)',
  'TONELADA/PESSOA (T/PESS)',
  'VEÍCULO/DIA (VEIC/D)',
  'VEÍCULO/HORA (VEIC/H)',
  'VEÍCULO/MÊS (VEIC/M)',
  'VEÍCULO (VEÍCULO)',
  'POSTO (POSTO)',
  'PROFISSIONAL (PROFISSIONAL)',
  'EQUIPE (EQUIPE)',
  'SERVIÇO (SERVIÇO)',
  'CHAMADO (CHAMADO)',
  'ORDEM DE SERVIÇO (ORDEM DE SERVIÇO)',
]

/** Catálogo de referência para a aba "Catálogo" do formulário de novo item. */
const CATALOGO_REF = [
  { nome: 'Papel A4 75g (resma 500 folhas)', tipo: 'Material', unidade: 'Caixa (CX)', unitario: 24.9 },
  { nome: 'Cadeira de escritório giratória', tipo: 'Material', unidade: 'Unidade (UN)', unitario: 389 },
  { nome: 'Serviço de manutenção de ar-condicionado', tipo: 'Serviço', unidade: 'Serviço (SV)', unitario: 180 },
  { nome: 'Cabo de rede CAT6', tipo: 'Material', unidade: 'Metro (M)', unitario: 3.2 },
  { nome: 'Consultoria técnica especializada', tipo: 'Serviço', unidade: 'Hora (H)', unitario: 250 },
]

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const emptyForm = { nome: '', codigo: '', referencia: '', tipo: '', unidade: '', qtd: '', unitario: '' }

export function CadastroItensModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [itens, setItens] = useState<ItemLote[]>([])
  const [view, setView] = useState<'lista' | 'form' | 'importar'>('lista')
  const [origem, setOrigem] = useState<'novo' | 'catalogo'>('novo')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [buscaCatalogo, setBuscaCatalogo] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroImport, setErroImport] = useState('')
  const [unidadesExtra, setUnidadesExtra] = useState<string[]>([])
  const [novaUnidadeAberta, setNovaUnidadeAberta] = useState(false)
  const [novaUnidadeNome, setNovaUnidadeNome] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const unidadesDisponiveis = [...UNIDADES, ...unidadesExtra]

  const cadastrarUnidade = () => {
    const nome = novaUnidadeNome.trim()
    if (!nome) return
    if (!unidadesDisponiveis.includes(nome)) setUnidadesExtra((prev) => [...prev, nome])
    setForm((f) => ({ ...f, unidade: nome }))
    setNovaUnidadeNome('')
    setNovaUnidadeAberta(false)
  }

  const totalLote = itens.reduce((s, i) => s + i.total, 0)
  const totalForm = (Number(form.qtd) || 0) * (Number(form.unitario) || 0)

  const fecharTudo = () => {
    setView('lista')
    setForm(emptyForm)
    setOrigem('novo')
    setEditIndex(null)
    setArquivo(null)
    setErroImport('')
    onClose()
  }

  const abrirNovo = () => {
    setForm(emptyForm)
    setOrigem('novo')
    setEditIndex(null)
    setView('form')
  }

  const abrirEditar = (i: number) => {
    const it = itens[i]
    setForm({
      nome: it.nome,
      codigo: it.codigo,
      referencia: it.sequencia,
      tipo: it.tipo,
      unidade: it.unidade,
      qtd: String(it.qtd),
      unitario: String(it.unitario),
    })
    setOrigem('novo')
    setEditIndex(i)
    setView('form')
  }

  const excluir = (i: number) => setItens((prev) => prev.filter((_, idx) => idx !== i))

  const escolherDoCatalogo = (c: (typeof CATALOGO_REF)[number]) => {
    setForm((f) => ({ ...f, nome: c.nome, tipo: c.tipo, unidade: c.unidade, unitario: String(c.unitario) }))
    setOrigem('novo')
  }

  const incluirItem = () => {
    if (!form.nome.trim() || !form.codigo.trim() || !form.tipo || !form.unidade) return
    const novo: ItemLote = {
      codigo: form.codigo.trim(),
      sequencia: form.referencia.trim() || String(itens.length + 1),
      nome: form.nome.trim(),
      tipo: form.tipo,
      unidade: form.unidade,
      qtd: Number(form.qtd) || 0,
      unitario: Number(form.unitario) || 0,
      total: totalForm,
    }
    setItens((prev) => {
      if (editIndex !== null) {
        const next = [...prev]
        next[editIndex] = novo
        return next
      }
      return [...prev, novo]
    })
    setView('lista')
  }

  const exportarExcel = () => {
    const linhas = [
      ['Código', 'Sequência', 'Nome', 'Tipo', 'Unidade', 'Qtd.', 'Unitário (R$)', 'Total (R$)'],
      ...itens.map((i) => [
        i.codigo,
        i.sequencia,
        i.nome,
        i.tipo,
        i.unidade,
        String(i.qtd),
        i.unitario.toFixed(2),
        i.total.toFixed(2),
      ]),
    ]
    const csv = linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'itens-do-lote.csv'
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
      const novos: ItemLote[] = linhas.slice(1).map((linha, idx) => {
        const cols = linha.split(/[;,]/).map((c) => c.replace(/^"|"$/g, '').trim())
        const [codigo, sequencia, nome, tipo, unidade, qtd, unitario] = cols
        const q = Number(qtd) || 0
        const u = Number(unitario) || 0
        return {
          codigo: codigo || `IMP-${idx + 1}`,
          sequencia: sequencia || String(itens.length + idx + 1),
          nome: nome || 'Item importado',
          tipo: tipo || 'Material',
          unidade: unidade || 'Unidade (UN)',
          qtd: q,
          unitario: u,
          total: q * u,
        }
      })
      setItens((prev) => [...prev, ...novos])
      setArquivo(null)
      setErroImport('')
      setView('lista')
    } catch {
      setErroImport('Não foi possível ler o arquivo. Envie um .csv exportado de uma planilha.')
    }
  }

  const cols: Column<ItemLote>[] = [
    { key: 'codigo', header: 'Código' },
    { key: 'sequencia', header: 'Sequência' },
    { key: 'nome', header: 'Nome' },
    { key: 'unidade', header: 'Unidade', align: 'center' },
    { key: 'qtd', header: 'Qtd.', align: 'center' },
    { key: 'unitario', header: 'Unitário (R$)', align: 'right', render: (r) => fmtBRL(r.unitario) },
    { key: 'total', header: 'Total (R$)', align: 'right', render: (r) => fmtBRL(r.total) },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => {
        const i = itens.indexOf(r)
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => abrirEditar(i)}
              aria-label="Editar item"
              className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <FilePenLine size={14} />
            </button>
            <button
              onClick={() => excluir(i)}
              aria-label="Excluir item"
              className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-[#f0c2c8] text-[var(--color-danger)]"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      },
    },
  ]

  const catalogoFiltrado = CATALOGO_REF.filter((c) =>
    c.nome.toLowerCase().includes(buscaCatalogo.toLowerCase()),
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={fecharTudo}
    >
      <div
        className="relative my-4 w-full max-w-6xl rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={fecharTudo}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 pr-8">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#d7f5ea] text-[var(--color-success)]">
              <Plus size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-extrabold text-[#183263] sm:text-xl">
                Cadastro de Itens
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                Cadastre, importe ou atualize os itens e lotes associados ao processo atual.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportarExcel}
              disabled={itens.length === 0}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f1f4f9] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={14} /> Exportar Excel
            </button>
            <button
              onClick={abrirNovo}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              <Plus size={14} /> Novo Item
            </button>
            <button
              onClick={() => setView('importar')}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              <Upload size={14} /> Importar Itens
            </button>
          </div>
        </div>

        {view === 'lista' && (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-sm font-bold text-[#183263]">Itens cadastrados</h4>
                <p className="text-xs text-[var(--color-muted)]">
                  Gerencie os itens existentes. Utilize os botões de ação para editá-los ou removê-los.
                </p>
              </div>
              <div className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-5 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Total do Lote
                </p>
                <p className="text-lg font-extrabold text-[#183263]">R$ {fmtBRL(totalLote)}</p>
              </div>
            </div>

            <DataTable<ItemLote>
              columns={cols}
              rows={itens}
              rowKey={(r) => r.codigo}
              empty={
                <button onClick={abrirNovo} className="w-full">
                  <EmptyState
                    title="Nenhum item registrado"
                    subtitle="Inclua um item manualmente ou importe uma planilha para começar."
                  />
                </button>
              }
              footer={<span>Registros encontrados: {itens.length}</span>}
            />
          </>
        )}

        {view === 'form' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Origem do Item
                </p>
                <p className="text-sm text-[var(--color-ink)]">
                  {origem === 'novo'
                    ? 'Você vai cadastrar um novo item no catálogo.'
                    : 'Selecione um item já existente no catálogo.'}
                </p>
              </div>
              <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
                <button
                  onClick={() => setOrigem('novo')}
                  className={`rounded-[8px] px-4 py-1.5 text-xs font-semibold transition ${
                    origem === 'novo'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Novo item
                </button>
                <button
                  onClick={() => setOrigem('catalogo')}
                  className={`rounded-[8px] px-4 py-1.5 text-xs font-semibold transition ${
                    origem === 'catalogo'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Catálogo
                </button>
              </div>
            </div>

            {origem === 'catalogo' ? (
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
                  {catalogoFiltrado.map((c) => (
                    <li key={c.nome}>
                      <button
                        onClick={() => escolherDoCatalogo(c)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 text-left transition hover:bg-[var(--color-primary-soft)]"
                      >
                        <Package size={16} className="shrink-0 text-[var(--color-primary-strong)]" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-[var(--color-ink)]">{c.nome}</span>
                          <span className="block text-xs text-[var(--color-muted)]">
                            {c.tipo} • {c.unidade}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-[var(--color-primary-strong)]">
                          R$ {fmtBRL(c.unitario)}
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
                  Preencha os campos obrigatórios para cadastrar um novo item ou atualizar um existente.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    label="Nome do item"
                    placeholder="Ex: Parafuso galvanizado"
                    value={form.nome}
                    onChange={(v) => setForm((f) => ({ ...f, nome: v }))}
                  />
                  <Field
                    label="Código"
                    placeholder="Informe o código único do item"
                    value={form.codigo}
                    onChange={(v) => setForm((f) => ({ ...f, codigo: v }))}
                  />
                  <Field
                    label="Referência"
                    placeholder="Ex: 0003"
                    value={form.referencia}
                    onChange={(v) => setForm((f) => ({ ...f, referencia: v }))}
                  />
                  <Labelled label="Tipo de item">
                    <Combo value={form.tipo} onChange={(v) => setForm((f) => ({ ...f, tipo: v }))} options={TIPOS_ITEM} placeholder="Selecione" />
                  </Labelled>
                  <Labelled label="Unidade de medida">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Combo
                          value={form.unidade}
                          onChange={(v) => setForm((f) => ({ ...f, unidade: v }))}
                          options={unidadesDisponiveis}
                          placeholder="Selecione ou digite para filtrar"
                          filterable
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setNovaUnidadeAberta((o) => !o)}
                        aria-label="Cadastrar nova unidade"
                        title="Cadastrar nova unidade"
                        className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft)]"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {novaUnidadeAberta && (
                      <div className="mt-2 flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-2">
                        <input
                          autoFocus
                          value={novaUnidadeNome}
                          onChange={(e) => setNovaUnidadeNome(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && cadastrarUnidade()}
                          placeholder="Ex: Rolo (RO)"
                          className="gt-input min-w-0 flex-1 font-normal normal-case"
                        />
                        <button
                          type="button"
                          onClick={cadastrarUnidade}
                          disabled={!novaUnidadeNome.trim()}
                          className="shrink-0 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Adicionar
                        </button>
                      </div>
                    )}
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
                    disabled={!form.nome.trim() || !form.codigo.trim() || !form.tipo || !form.unidade}
                    className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editIndex !== null ? 'Salvar item' : 'Incluir item'}
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
              Envie um arquivo .csv com as colunas: Código, Sequência, Nome, Tipo, Unidade, Qtd.,
              Unitário.
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
      </div>
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
