import { useMemo, useState } from 'react'
import { Building2, CalendarDays, Download, Hash, MapPin, Package, Plus, Search, X } from 'lucide-react'
import { useNecessidades } from '../../store/necessidades'

type ItemPca = {
  numero: number
  descricao: string
  categoria: 'Material' | 'Serviço'
  classificacao: string
  qtd: number
  unidade: string
  valorUnit: number
}

const DESCRICOES: [string, ItemPca['categoria'], string, string][] = [
  ['ADAPTADOR COM FLANGE 1 - 32MM.', 'Material', 'ACESSÓRIOS E FERRAGENS PARA MANGUEIRAS, CANOS E TUBOS', 'UNIDADE'],
  ['ADAPTADOR COM FLANGE 25MM (3/4)', 'Material', 'EQUIPAMENTOS DE APOIO', 'UNIDADE'],
  ['ADAPTADOR ELÉTRICO TÊ', 'Material', 'CONECTORES ELÉTRICOS', 'UNIDADE'],
  ['CIMENTO PORTLAND CP-II 50KG', 'Material', 'MATERIAIS DE CONSTRUÇÃO', 'SACO'],
  ['AREIA MÉDIA LAVADA', 'Material', 'AGREGADOS PARA CONSTRUÇÃO', 'M3'],
  ['TINTA LÁTEX ACRÍLICA 18L', 'Material', 'TINTAS E VERNIZES', 'LATA'],
  ['CAMINHÃO LEVE TIPO 3/4', 'Material', 'VEÍCULOS SOBRE RODAS', 'UNIDADE'],
  ['NOTEBOOK CORE I5 16GB SSD 512GB', 'Material', 'EQUIPAMENTOS DE INFORMÁTICA', 'UNIDADE'],
  ['APRESENTAÇÃO MUSICAL - REY VAQUEIRO', 'Serviço', 'SERVIÇOS DE ARTISTAS', 'SERVIÇO'],
  ['SERVIÇO DE MANUTENÇÃO DE AR-CONDICIONADO', 'Serviço', 'MANUTENÇÃO PREDIAL', 'SERVIÇO'],
  ['LOCAÇÃO DE PALCO E SONORIZAÇÃO', 'Serviço', 'LOCAÇÃO DE EQUIPAMENTOS PARA EVENTOS', 'DIÁRIA'],
  ['CONSULTORIA TÉCNICA EM ENGENHARIA', 'Serviço', 'CONSULTORIA EM ENGENHARIA', 'HORA'],
  ['SERVIÇO CONTINUADO DE LIMPEZA PREDIAL', 'Serviço', 'LIMPEZA E CONSERVAÇÃO', 'POSTO'],
  ['COMBUSTÍVEL - ÓLEO DIESEL S10', 'Material', 'COMBUSTÍVEIS E LUBRIFICANTES', 'LITRO'],
  ['PNEU 275/80 R22.5', 'Material', 'PNEUS E CÂMARAS DE AR', 'UNIDADE'],
]

function gerarItens(seed: number): ItemPca[] {
  return Array.from({ length: 24 }, (_, i) => {
    const [descricao, categoria, classificacao, unidade] = DESCRICOES[(seed + i) % DESCRICOES.length]
    const qtd = 1 + ((seed * 7 + i * 3) % 40)
    const valorUnit = Number((2 + ((seed * 13 + i * 29) % 900) + ((i * 7) % 100) / 100).toFixed(2))
    return { numero: 9427 + seed * 100 + i, descricao, categoria, classificacao, qtd, unidade, valorUnit }
  })
}

const brl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ImportarPcaModal({ onClose }: { onClose: () => void }) {
  const adicionar = useNecessidades((s) => s.adicionar)

  const [cnpj, setCnpj] = useState('')
  const [ano, setAno] = useState(String(new Date().getFullYear()))
  const [consultado, setConsultado] = useState(false)
  const [pcaAtivo, setPcaAtivo] = useState(1)
  const [filtro, setFiltro] = useState('')
  const [marcados, setMarcados] = useState<Set<number>>(new Set())

  const pcas = consultado ? Array.from({ length: 13 }, (_, i) => i + 1) : []
  const itens = useMemo(() => gerarItens(pcaAtivo), [pcaAtivo])
  const filtrados = itens.filter((i) => i.descricao.toLowerCase().includes(filtro.toLowerCase()))
  const totalItens = itens.reduce((s, i) => s + i.qtd * i.valorUnit, 0)

  const consultar = () => {
    if (!cnpj.trim()) return
    setConsultado(true)
    setPcaAtivo(1)
    setMarcados(new Set())
  }

  const toggle = (n: number) =>
    setMarcados((prev) => {
      const s = new Set(prev)
      if (s.has(n)) s.delete(n)
      else s.add(n)
      return s
    })

  const todosMarcados = filtrados.length > 0 && filtrados.every((i) => marcados.has(i.numero))
  const marcarTodos = () =>
    setMarcados((prev) => {
      const s = new Set(prev)
      if (todosMarcados) filtrados.forEach((i) => s.delete(i.numero))
      else filtrados.forEach((i) => s.add(i.numero))
      return s
    })

  const importar = () => {
    if (marcados.size === 0) return
    const escolhidos = itens.filter((i) => marcados.has(i.numero))
    const valor = escolhidos.reduce((s, i) => s + i.qtd * i.valorUnit, 0)
    adicionar({
      nome: `Importação PCA/PNCP ${ano} — PCA #${pcaAtivo}`,
      descricao: `CNPJ ${cnpj} • ${escolhidos.length} item(ns) • ${brl(valor)}`,
      itens: escolhidos.length,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-[1320px] rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
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
            <h3 className="font-display text-base font-bold text-[#183263]">Importar do PCA / PNCP</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Pesquise pelo CNPJ da instituição e ano para criar o Registro de Necessidade.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
          <label className="flex min-w-[240px] flex-1 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            CNPJ do Órgão
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="gt-input !pl-9 font-normal normal-case"
              />
            </div>
          </label>
          <label className="flex w-28 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Ano
            <input value={ano} onChange={(e) => setAno(e.target.value)} className="gt-input font-normal normal-case" />
          </label>
          <button
            onClick={consultar}
            disabled={!cnpj.trim()}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search size={15} /> Consultar
          </button>
        </div>

        {consultado && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {pcas.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setPcaAtivo(n)
                    setMarcados(new Set())
                  }}
                  className={`rounded-[var(--radius-control)] px-3 py-1.5 text-xs font-semibold transition ${
                    pcaAtivo === n
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'border border-[var(--color-line)] bg-white text-[var(--color-muted)]'
                  }`}
                >
                  PCA #{n}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
              <div className="bg-[linear-gradient(135deg,#1f56ad_0%,#2d68c4_100%)] px-4 py-3 text-white">
                <p className="flex items-center gap-2 text-sm font-extrabold">
                  <Building2 size={16} /> MUNICÍPIO DE IRAUÇUBA
                </p>
                <p className="text-xs text-white/80">CNPJ: {cnpj}</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[var(--color-line)] border-b border-[var(--color-line)] text-center sm:grid-cols-5">
                <Stat icon={<MapPin size={13} />} label="Localização" valor="Irauçuba - CE" />
                <Stat icon={<CalendarDays size={13} />} label="Ano PCA" valor={ano} />
                <Stat icon={<Hash size={13} />} label="Nº Controle" valor={`07683188000169-0-00000${pcaAtivo}/${ano}`} />
                <Stat icon={<Package size={13} />} label="Total de Itens" valor={String(itens.length)} />
                <Stat
                  icon={<span className="text-[var(--color-success)]">$</span>}
                  label="Valor Total"
                  valor={brl(totalItens)}
                  destaque
                />
              </div>
              <p className="bg-[var(--color-primary-soft)] px-4 py-1.5 text-[11px] text-[var(--color-primary-strong)]">
                Unidade: SECRETARIA DO DESENVOLVIMENTO RURAL, MEIO AMBIENTE E RECURSOS HÍDRICOS (2501)
                • Publicado em 12/08/2025 • Fonte: SollAI
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="relative min-w-[220px] flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                  <input
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="Filtrar itens…"
                    className="gt-input !pl-9 text-xs font-normal normal-case"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-muted)]">
                    {filtrados.length} de {itens.length} itens
                  </span>
                  <button
                    onClick={() => {
                      const linhas = [
                        ['Nº', 'Descrição', 'Categoria', 'Classificação', 'Qtd', 'Unid.', 'Valor Unit.', 'Valor Total'],
                        ...itens.map((i) => [
                          String(i.numero),
                          i.descricao,
                          i.categoria,
                          i.classificacao,
                          String(i.qtd),
                          i.unidade,
                          i.valorUnit.toFixed(2),
                          (i.qtd * i.valorUnit).toFixed(2),
                        ]),
                      ]
                      const csv = linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n')
                      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `pca-${pcaAtivo}-${ano}.csv`
                      document.body.appendChild(a)
                      a.click()
                      a.remove()
                      URL.revokeObjectURL(url)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)]"
                  >
                    <Download size={13} /> CSV
                  </button>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#eef3fb] text-left uppercase tracking-wide text-[var(--color-muted)]">
                    <tr>
                      <th className="px-3 py-2">
                        <input type="checkbox" checked={todosMarcados} onChange={marcarTodos} className="h-3.5 w-3.5 accent-[var(--color-primary)]" />
                      </th>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Descrição</th>
                      <th className="px-3 py-2">Categoria</th>
                      <th className="px-3 py-2">Classificação</th>
                      <th className="px-3 py-2 text-center">Qtd</th>
                      <th className="px-3 py-2">Unid.</th>
                      <th className="px-3 py-2 text-right">Valor Unit.</th>
                      <th className="px-3 py-2 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((it) => (
                      <tr key={it.numero} className="border-t border-[var(--color-line)] align-top">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={marcados.has(it.numero)}
                            onChange={() => toggle(it.numero)}
                            className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                          />
                        </td>
                        <td className="px-3 py-2 text-[var(--color-muted)]">{it.numero}</td>
                        <td className="px-3 py-2 font-semibold text-[var(--color-ink)]">{it.descricao}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold text-white ${
                              it.categoria === 'Material' ? 'bg-[var(--color-primary)]' : 'bg-[#7c3aed]'
                            }`}
                          >
                            {it.categoria}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[var(--color-muted)]">{it.classificacao}</td>
                        <td className="px-3 py-2 text-center">{it.qtd}</td>
                        <td className="px-3 py-2 text-[var(--color-muted)]">{it.unidade}</td>
                        <td className="px-3 py-2 text-right">{brl(it.valorUnit)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{brl(it.qtd * it.valorUnit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <button
          onClick={importar}
          disabled={marcados.size === 0}
          className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Importar Itens Selecionados{marcados.size > 0 ? ` (${marcados.size})` : ''}
        </button>
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  valor,
  destaque,
}: {
  icon: React.ReactNode
  label: string
  valor: string
  destaque?: boolean
}) {
  return (
    <div className="px-3 py-3">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
        {icon} {label}
      </p>
      <p className={`mt-0.5 text-xs font-bold ${destaque ? 'text-[var(--color-success)]' : 'text-[var(--color-ink)]'}`}>
        {valor}
      </p>
    </div>
  )
}
