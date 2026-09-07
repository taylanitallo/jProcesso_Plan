import { useEffect, useMemo, useState } from 'react'
import { Building2, CalendarDays, Download, Hash, MapPin, Package, Plus, Search, X } from 'lucide-react'
import { useNecessidades } from '../../store/necessidades'
import { pcaService, type PcaCabecalho, type PcaItem } from '../../services'

const brl = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ImportarPcaModal({ onClose }: { onClose: () => void }) {
  const adicionar = useNecessidades((s) => s.adicionar)

  const [cnpj, setCnpj] = useState('')
  const [ano, setAno] = useState(String(new Date().getFullYear()))
  const [pcas, setPcas] = useState<PcaCabecalho[]>([])
  const [ativo, setAtivo] = useState<number | null>(null)
  const [itens, setItens] = useState<PcaItem[]>([])
  const [carregando, setCarregando] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [marcados, setMarcados] = useState<Set<number>>(new Set())

  const cab = pcas.find((p) => p.sequencial === ativo) ?? null

  const consultar = async () => {
    if (!cnpj.trim()) return
    setCarregando(true)
    const lista = await pcaService.consultarPca(cnpj.trim(), Number(ano) || new Date().getFullYear())
    setPcas(lista)
    setAtivo(lista[0]?.sequencial ?? null)
    setMarcados(new Set())
    setCarregando(false)
  }

  useEffect(() => {
    if (ativo == null) {
      setItens([])
      return
    }
    let cancelado = false
    setCarregando(true)
    pcaService.consultarItensPca(cnpj.trim(), Number(ano), ativo).then((r) => {
      if (cancelado) return
      setItens(r)
      setMarcados(new Set())
      setCarregando(false)
    })
    return () => {
      cancelado = true
    }
  }, [ativo, cnpj, ano])

  const filtrados = useMemo(
    () => itens.filter((i) => i.descricao.toLowerCase().includes(filtro.toLowerCase())),
    [itens, filtro],
  )
  const todos = filtrados.length > 0 && filtrados.every((i) => marcados.has(i.numeroItem))

  const toggle = (n: number) =>
    setMarcados((prev) => {
      const s = new Set(prev)
      if (s.has(n)) s.delete(n)
      else s.add(n)
      return s
    })
  const marcarTodos = () =>
    setMarcados((prev) => {
      const s = new Set(prev)
      filtrados.forEach((i) => (todos ? s.delete(i.numeroItem) : s.add(i.numeroItem)))
      return s
    })

  const baixarCsv = () => {
    const linhas = [
      ['Nº', 'Descrição', 'Categoria', 'Classificação', 'Qtd', 'Unid.', 'Valor Unit.', 'Valor Total'],
      ...itens.map((i) => [
        String(i.numeroItem),
        i.descricao,
        i.categoria,
        i.classificacao,
        String(i.quantidadeEstimada),
        i.unidadeFornecimento,
        i.valorUnitarioEstimado.toFixed(2),
        i.valorTotalEstimado.toFixed(2),
      ]),
    ]
    const csv = linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pca-${ativo}-${ano}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const importar = () => {
    if (marcados.size === 0 || !cab) return
    const escolhidos = itens.filter((i) => marcados.has(i.numeroItem))
    const valor = escolhidos.reduce((s, i) => s + i.valorTotalEstimado, 0)
    adicionar({
      nome: `Importação PCA/PNCP ${ano} — PCA #${cab.sequencial}`,
      descricao: `${cab.nomeOrgao} (${cnpj}) • Nº controle ${cab.numeroControlePNCP} • ${escolhidos.length} item(ns) • ${brl(valor)}`,
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
            disabled={!cnpj.trim() || carregando}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search size={15} /> Consultar
          </button>
        </div>

        {pcas.length > 0 && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {pcas.map((p) => (
                <button
                  key={p.sequencial}
                  onClick={() => setAtivo(p.sequencial)}
                  className={`rounded-[var(--radius-control)] px-3 py-1.5 text-xs font-semibold transition ${
                    ativo === p.sequencial
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'border border-[var(--color-line)] bg-white text-[var(--color-muted)]'
                  }`}
                >
                  PCA #{p.sequencial}
                </button>
              ))}
            </div>

            {cab && (
              <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
                <div className="bg-[linear-gradient(135deg,#1f56ad_0%,#2d68c4_100%)] px-4 py-3 text-white">
                  <p className="flex items-center gap-2 text-sm font-extrabold">
                    <Building2 size={16} /> {cab.nomeOrgao}
                  </p>
                  <p className="text-xs text-white/80">CNPJ: {cab.cnpjOrgao}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-[var(--color-line)] border-b border-[var(--color-line)] text-center sm:grid-cols-5">
                  <Stat icon={<MapPin size={13} />} label="Localização" valor={cab.localizacao} />
                  <Stat icon={<CalendarDays size={13} />} label="Ano PCA" valor={String(cab.anoPca)} />
                  <Stat icon={<Hash size={13} />} label="Nº Controle" valor={cab.numeroControlePNCP} />
                  <Stat icon={<Package size={13} />} label="Total de Itens" valor={String(cab.totalItens)} />
                  <Stat
                    icon={<span className="text-[var(--color-success)]">$</span>}
                    label="Valor Total"
                    valor={brl(cab.valorTotalEstimado)}
                    destaque
                  />
                </div>
                <p className="bg-[var(--color-primary-soft)] px-4 py-1.5 text-[11px] text-[var(--color-primary-strong)]">
                  Unidade: {cab.nomeUnidade} ({cab.codigoUnidade}) • Publicado em {cab.dataPublicacao}{' '}
                  • Fonte: dados abertos compras.gov.br
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
                      onClick={baixarCsv}
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)]"
                    >
                      <Download size={13} /> CSV
                    </button>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {carregando ? (
                    <p className="py-10 text-center text-sm text-[var(--color-muted)]">Carregando itens…</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[#eef3fb] text-left uppercase tracking-wide text-[var(--color-muted)]">
                        <tr>
                          <th className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={todos}
                              onChange={marcarTodos}
                              className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                            />
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
                          <tr key={it.numeroItem} className="border-t border-[var(--color-line)] align-top">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={marcados.has(it.numeroItem)}
                                onChange={() => toggle(it.numeroItem)}
                                className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                              />
                            </td>
                            <td className="px-3 py-2 text-[var(--color-muted)]">{it.numeroItem}</td>
                            <td className="px-3 py-2 font-semibold text-[var(--color-ink)]">{it.descricao}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold text-white ${
                                  it.materialOuServico === 'MATERIAL'
                                    ? 'bg-[var(--color-primary)]'
                                    : 'bg-[#7c3aed]'
                                }`}
                              >
                                {it.categoria}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[var(--color-muted)]">{it.classificacao}</td>
                            <td className="px-3 py-2 text-center">{it.quantidadeEstimada}</td>
                            <td className="px-3 py-2 text-[var(--color-muted)]">{it.unidadeFornecimento}</td>
                            <td className="px-3 py-2 text-right">{brl(it.valorUnitarioEstimado)}</td>
                            <td className="px-3 py-2 text-right font-semibold">{brl(it.valorTotalEstimado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
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
