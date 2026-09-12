import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Coins, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Combo } from '../../components/common/Combo'
import { Badge } from '../../components/common/Badge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { useCatalogo } from '../../store/catalogo'
import { precosService } from '../../services'
import type { MaterialOuServico, PrecoPraticado } from '../../services/types'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function PesquisaPrecosPage() {
  useModuleLinks([
    { key: 'base', label: 'Catálogo', to: '/CatalogoItens', icon: 'database' },
    { key: 'precos', label: 'Pesquisa de Preços', to: '/PesquisaPrecos', icon: 'precos' },
  ])

  const catalogo = useCatalogo((s) => s.itens)
  const [params] = useSearchParams()

  const [itemCatalogo, setItemCatalogo] = useState('')
  const [codigo, setCodigo] = useState(params.get('codigo') ?? '')
  const [tipo, setTipo] = useState<MaterialOuServico>(
    params.get('tipo') === 'SERVICO' ? 'SERVICO' : 'MATERIAL',
  )
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')

  const [consultando, setConsultando] = useState(false)
  const [consultou, setConsultou] = useState(false)
  const [real, setReal] = useState(true)
  const [resultado, setResultado] = useState<PrecoPraticado[]>([])

  const escolherDoCatalogo = (nome: string) => {
    setItemCatalogo(nome)
    const item = catalogo.find((c) => `${c.codigo} — ${c.nome}` === nome)
    if (item) {
      setCodigo(item.codigo)
      setTipo(item.tipo === 'Serviço' ? 'SERVICO' : 'MATERIAL')
    }
  }

  const consultar = async () => {
    if (!codigo.trim()) return
    setConsultando(true)
    setConsultou(false)
    const r = await precosService.pesquisarPrecos(codigo.trim(), tipo, {
      inicio,
      fim,
    })
    setResultado(r.itens)
    setReal(r.real)
    setConsultando(false)
    setConsultou(true)
  }

  const precos = resultado.map((r) => r.precoUnitario).filter((v) => v > 0)
  const menor = precos.length ? Math.min(...precos) : 0
  const maior = precos.length ? Math.max(...precos) : 0
  const media = precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : 0

  const cols: Column<PrecoPraticado>[] = [
    {
      key: 'fornecedor',
      header: 'Fornecedor',
      render: (r) => (
        <div>
          <p className="font-semibold text-[var(--color-ink)]">{r.nomeFornecedor || '—'}</p>
          {r.niFornecedor && <p className="text-xs text-[var(--color-muted)]">{r.niFornecedor}</p>}
        </div>
      ),
    },
    { key: 'quantidade', header: 'Qtd.', align: 'center' },
    {
      key: 'precoUnitario',
      header: 'Valor Unit. (R$)',
      align: 'right',
      render: (r) => fmtBRL(r.precoUnitario),
    },
    { key: 'dataCompra', header: 'Data da Compra', align: 'center', render: (r) => r.dataCompra || '—' },
    { key: 'codigoUasg', header: 'UASG', align: 'center', render: (r) => r.codigoUasg || '—' },
    { key: 'idCompra', header: 'Nº da Compra', render: (r) => r.idCompra || '—' },
  ]

  return (
    <div>
      <PageHeader
        title="Pesquisa de Preços"
        subtitle="Consulte preços praticados em compras públicas pra fundamentar a estimativa de valor do item."
      />

      <div className="mb-4 flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Item do catálogo (opcional)
            <Combo
              value={itemCatalogo}
              onChange={escolherDoCatalogo}
              options={catalogo.map((c) => `${c.codigo} — ${c.nome}`)}
              placeholder={catalogo.length === 0 ? 'Nenhum item cadastrado' : 'Selecione pra preencher o código'}
              disabled={catalogo.length === 0}
              filterable
            />
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Código CatMat/CatSer
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex.: 450127"
                className="gt-input font-normal normal-case"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Tipo
              <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
                {(['MATERIAL', 'SERVICO'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`rounded-[8px] px-3 py-1.5 text-xs font-semibold transition ${
                      tipo === t ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted)]'
                    }`}
                  >
                    {t === 'MATERIAL' ? 'Material' : 'Serviço'}
                  </button>
                ))}
              </div>
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Data inicial (opcional)
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="gt-input font-normal normal-case" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Data final (opcional)
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="gt-input font-normal normal-case" />
          </label>
          <div className="flex items-end">
            <button
              onClick={consultar}
              disabled={!codigo.trim() || consultando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={15} /> {consultando ? 'Consultando…' : 'Consultar'}
            </button>
          </div>
        </div>
      </div>

      {consultou && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge tone={real ? 'success' : 'neutral'}>
              {real ? 'Dado real — compras.gov.br' : 'Amostra local (API indisponível)'}
            </Badge>
            {resultado.length > 0 && (
              <div className="ml-auto flex flex-wrap gap-3">
                <Resumo icon={<TrendingDown size={14} />} label="Menor preço" valor={fmtBRL(menor)} tone="success" />
                <Resumo icon={<Coins size={14} />} label="Preço médio" valor={fmtBRL(media)} />
                <Resumo icon={<TrendingUp size={14} />} label="Maior preço" valor={fmtBRL(maior)} tone="danger" />
              </div>
            )}
          </div>

          <DataTable<PrecoPraticado>
            columns={cols}
            rows={resultado}
            rowKey={(r) => `${r.idCompra}-${r.codigoUasg}-${r.nomeFornecedor}`}
            empty={
              <EmptyState
                icon={Coins}
                title="Nenhum preço encontrado"
                subtitle={
                  real
                    ? 'Sem histórico de compra pra esse item no período consultado.'
                    : 'A API de preços praticados está indisponível no momento.'
                }
              />
            }
            footer={<span>Registros encontrados: {resultado.length}</span>}
          />
        </>
      )}
    </div>
  )
}

function Resumo({
  icon,
  label,
  valor,
  tone,
}: {
  icon: React.ReactNode
  label: string
  valor: string
  tone?: 'success' | 'danger'
}) {
  return (
    <div
      className={`rounded-[var(--radius-control)] border px-4 py-2 text-center ${
        tone === 'success'
          ? 'border-[#a9d9c1] bg-[#eefaf3]'
          : tone === 'danger'
            ? 'border-[#f0c2c8] bg-[#fbeff1]'
            : 'border-[#bcd0ee] bg-[var(--color-primary-soft)]'
      }`}
    >
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
        {icon} {label}
      </p>
      <p
        className={`text-sm font-extrabold ${
          tone === 'success'
            ? 'text-[var(--color-success)]'
            : tone === 'danger'
              ? 'text-[var(--color-danger)]'
              : 'text-[#183263]'
        }`}
      >
        R$ {valor}
      </p>
    </div>
  )
}
