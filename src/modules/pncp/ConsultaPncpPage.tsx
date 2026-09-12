import { useState } from 'react'
import { FileStack, FileText, Landmark, ScrollText, Search } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/common/Badge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { useInstituicao } from '../../store/instituicao'
import {
  pncpConsultaService,
  MODALIDADES_CONTRATACAO,
  type FiltroPeriodoOrgao,
} from '../../services'
import type { AtaPncp, ContratacaoPncp, ContratoPncp } from '../../services/types'

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const hoje = () => new Date().toISOString().slice(0, 10)
const diasAtras = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

type Aba = 'contratacoes' | 'atas' | 'contratos'

const ABAS: { key: Aba; label: string; icon: typeof FileText }[] = [
  { key: 'contratacoes', label: 'Contratações', icon: FileText },
  { key: 'atas', label: 'Atas de Registro de Preço', icon: ScrollText },
  { key: 'contratos', label: 'Contratos/Empenhos', icon: FileStack },
]

export function ConsultaPncpPage() {
  useModuleLinks([{ key: 'consulta-pncp', label: 'Consulta PNCP', to: '/ConsultaPncp', icon: 'pncp' }])

  const cnpjInstituicao = useInstituicao((s) => s.instituicao.cnpj)
  const [aba, setAba] = useState<Aba>('contratacoes')

  return (
    <div>
      <PageHeader
        title="Consulta PNCP"
        subtitle="Busque contratações, atas de registro de preço e contratos publicados no PNCP por qualquer órgão do Brasil — dado oficial ao vivo."
      />

      <div className="mb-4 flex gap-2 border-b border-[var(--color-line)]">
        {ABAS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-bold transition ${
              aba === key
                ? 'border-[var(--color-primary)] text-[var(--color-primary-strong)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {aba === 'contratacoes' && <AbaContratacoes cnpjInstituicao={cnpjInstituicao} />}
      {aba === 'atas' && <AbaAtas cnpjInstituicao={cnpjInstituicao} />}
      {aba === 'contratos' && <AbaContratos cnpjInstituicao={cnpjInstituicao} />}
    </div>
  )
}

// --------------------------------------------------------------- Contratações

function AbaContratacoes({ cnpjInstituicao }: { cnpjInstituicao: string }) {
  const [dataInicial, setDataInicial] = useState(diasAtras(7))
  const [dataFinal, setDataFinal] = useState(hoje())
  const [modalidade, setModalidade] = useState(6)
  const [cnpj, setCnpj] = useState('')
  const [uf, setUf] = useState('')

  const [consultando, setConsultando] = useState(false)
  const [consultou, setConsultou] = useState(false)
  const [real, setReal] = useState(true)
  const [total, setTotal] = useState(0)
  const [itens, setItens] = useState<ContratacaoPncp[]>([])

  const consultar = async () => {
    setConsultando(true)
    setConsultou(false)
    const r = await pncpConsultaService.consultarContratacoes({
      dataInicial,
      dataFinal,
      codigoModalidadeContratacao: modalidade,
      cnpj,
      uf,
    })
    setItens(r.itens)
    setTotal(r.total)
    setReal(r.real)
    setConsultando(false)
    setConsultou(true)
  }

  const cols: Column<ContratacaoPncp>[] = [
    {
      key: 'objeto',
      header: 'Objeto',
      render: (r) => (
        <div>
          <p className="line-clamp-2 font-semibold text-[var(--color-ink)]">{r.objetoCompra || '—'}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {r.nomeOrgao} — {r.nomeUnidade || r.municipio} {r.uf && `(${r.uf})`}
          </p>
        </div>
      ),
    },
    { key: 'modalidade', header: 'Modalidade', render: (r) => r.modalidadeNome || '—' },
    {
      key: 'situacao',
      header: 'Situação',
      align: 'center',
      render: (r) => <Badge tone={r.situacaoCompraNome === 'Divulgada no PNCP' ? 'info' : 'neutral'}>{r.situacaoCompraNome || '—'}</Badge>,
    },
    {
      key: 'valor',
      header: 'Valor Estimado (R$)',
      align: 'right',
      render: (r) => fmtBRL(r.valorTotalEstimado),
    },
    { key: 'encerramento', header: 'Encerramento Proposta', align: 'center', render: (r) => r.dataEncerramentoProposta || '—' },
    { key: 'numero', header: 'Nº PNCP', render: (r) => r.numeroControlePNCP },
  ]

  return (
    <>
      <FiltrosBase
        dataInicial={dataInicial}
        setDataInicial={setDataInicial}
        dataFinal={dataFinal}
        setDataFinal={setDataFinal}
        cnpj={cnpj}
        setCnpj={setCnpj}
        cnpjInstituicao={cnpjInstituicao}
        consultando={consultando}
        onConsultar={consultar}
        extra={
          <>
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Modalidade
              <select
                value={modalidade}
                onChange={(e) => setModalidade(Number(e.target.value))}
                className="gt-input font-normal normal-case"
              >
                {MODALIDADES_CONTRATACAO.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              UF (opcional)
              <input
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="Ex.: CE"
                className="gt-input font-normal normal-case"
              />
            </label>
          </>
        }
      />

      {consultou && (
        <>
          <ResultadoHeader real={real} total={total} mostrando={itens.length} fonte="contratações" />
          <DataTable<ContratacaoPncp>
            columns={cols}
            rows={itens}
            rowKey={(r) => r.numeroControlePNCP}
            empty={
              <EmptyState
                icon={FileText}
                title="Nenhuma contratação encontrada"
                subtitle={
                  real
                    ? 'Sem contratações publicadas com esses filtros no período.'
                    : 'A API de consulta do PNCP está indisponível no momento.'
                }
              />
            }
          />
        </>
      )}
    </>
  )
}

// --------------------------------------------------------------------- Atas

function AbaAtas({ cnpjInstituicao }: { cnpjInstituicao: string }) {
  const [dataInicial, setDataInicial] = useState(diasAtras(30))
  const [dataFinal, setDataFinal] = useState(hoje())
  const [cnpj, setCnpj] = useState('')

  const [consultando, setConsultando] = useState(false)
  const [consultou, setConsultou] = useState(false)
  const [real, setReal] = useState(true)
  const [total, setTotal] = useState(0)
  const [itens, setItens] = useState<AtaPncp[]>([])

  const consultar = async () => {
    setConsultando(true)
    setConsultou(false)
    const f: FiltroPeriodoOrgao = { dataInicial, dataFinal, cnpj }
    const r = await pncpConsultaService.consultarAtas(f)
    setItens(r.itens)
    setTotal(r.total)
    setReal(r.real)
    setConsultando(false)
    setConsultou(true)
  }

  const cols: Column<AtaPncp>[] = [
    {
      key: 'objeto',
      header: 'Objeto da Contratação',
      render: (r) => (
        <div>
          <p className="line-clamp-2 font-semibold text-[var(--color-ink)]">{r.objetoContratacao || '—'}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {r.nomeOrgao} — {r.nomeUnidadeOrgao}
          </p>
        </div>
      ),
    },
    { key: 'ata', header: 'Nº Ata', render: (r) => `${r.numeroAtaRegistroPreco || '—'}/${r.anoAta || ''}` },
    {
      key: 'situacao',
      header: 'Situação',
      align: 'center',
      render: (r) => <Badge tone={r.cancelado ? 'danger' : 'success'}>{r.cancelado ? 'Cancelada' : 'Vigente'}</Badge>,
    },
    { key: 'vigencia', header: 'Vigência', align: 'center', render: (r) => `${r.vigenciaInicio} — ${r.vigenciaFim}` },
    { key: 'numero', header: 'Nº PNCP', render: (r) => r.numeroControlePNCPAta },
  ]

  return (
    <>
      <FiltrosBase
        dataInicial={dataInicial}
        setDataInicial={setDataInicial}
        dataFinal={dataFinal}
        setDataFinal={setDataFinal}
        cnpj={cnpj}
        setCnpj={setCnpj}
        cnpjInstituicao={cnpjInstituicao}
        consultando={consultando}
        onConsultar={consultar}
        labelData="Período de vigência"
      />

      {consultou && (
        <>
          <ResultadoHeader real={real} total={total} mostrando={itens.length} fonte="atas" />
          <DataTable<AtaPncp>
            columns={cols}
            rows={itens}
            rowKey={(r) => r.numeroControlePNCPAta}
            empty={
              <EmptyState
                icon={ScrollText}
                title="Nenhuma ata encontrada"
                subtitle={
                  real
                    ? 'Sem atas de registro de preço vigentes nesse período com esses filtros.'
                    : 'A API de consulta do PNCP está indisponível no momento.'
                }
              />
            }
          />
        </>
      )}
    </>
  )
}

// ---------------------------------------------------------------- Contratos

function AbaContratos({ cnpjInstituicao }: { cnpjInstituicao: string }) {
  const [dataInicial, setDataInicial] = useState(diasAtras(7))
  const [dataFinal, setDataFinal] = useState(hoje())
  const [cnpj, setCnpj] = useState('')

  const [consultando, setConsultando] = useState(false)
  const [consultou, setConsultou] = useState(false)
  const [real, setReal] = useState(true)
  const [total, setTotal] = useState(0)
  const [itens, setItens] = useState<ContratoPncp[]>([])

  const consultar = async () => {
    setConsultando(true)
    setConsultou(false)
    const f: FiltroPeriodoOrgao = { dataInicial, dataFinal, cnpj }
    const r = await pncpConsultaService.consultarContratos(f)
    setItens(r.itens)
    setTotal(r.total)
    setReal(r.real)
    setConsultando(false)
    setConsultou(true)
  }

  const cols: Column<ContratoPncp>[] = [
    {
      key: 'objeto',
      header: 'Objeto',
      render: (r) => (
        <div>
          <p className="line-clamp-2 font-semibold text-[var(--color-ink)]">{r.objetoContrato || '—'}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {r.nomeOrgao} — {r.nomeUnidade}
          </p>
        </div>
      ),
    },
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
    { key: 'tipo', header: 'Tipo', render: (r) => r.tipoContratoNome || '—' },
    { key: 'valor', header: 'Valor Global (R$)', align: 'right', render: (r) => fmtBRL(r.valorGlobal) },
    { key: 'vigencia', header: 'Vigência', align: 'center', render: (r) => `${r.dataVigenciaInicio} — ${r.dataVigenciaFim}` },
    { key: 'numero', header: 'Nº Contrato', render: (r) => r.numeroContratoEmpenho || '—' },
  ]

  return (
    <>
      <FiltrosBase
        dataInicial={dataInicial}
        setDataInicial={setDataInicial}
        dataFinal={dataFinal}
        setDataFinal={setDataFinal}
        cnpj={cnpj}
        setCnpj={setCnpj}
        cnpjInstituicao={cnpjInstituicao}
        consultando={consultando}
        onConsultar={consultar}
      />

      {consultou && (
        <>
          <ResultadoHeader real={real} total={total} mostrando={itens.length} fonte="contratos" />
          <DataTable<ContratoPncp>
            columns={cols}
            rows={itens}
            rowKey={(r) => r.numeroControlePNCP}
            empty={
              <EmptyState
                icon={FileStack}
                title="Nenhum contrato encontrado"
                subtitle={
                  real
                    ? 'Sem contratos/empenhos publicados com esses filtros no período.'
                    : 'A API de consulta do PNCP está indisponível no momento.'
                }
              />
            }
          />
        </>
      )}
    </>
  )
}

// ------------------------------------------------------------------- Comuns

function FiltrosBase({
  dataInicial,
  setDataInicial,
  dataFinal,
  setDataFinal,
  cnpj,
  setCnpj,
  cnpjInstituicao,
  consultando,
  onConsultar,
  extra,
  labelData = 'Período de publicação',
}: {
  dataInicial: string
  setDataInicial: (v: string) => void
  dataFinal: string
  setDataFinal: (v: string) => void
  cnpj: string
  setCnpj: (v: string) => void
  cnpjInstituicao: string
  consultando: boolean
  onConsultar: () => void
  extra?: React.ReactNode
  labelData?: string
}) {
  return (
    <div className="mb-4 flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          {labelData} — início
          <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} className="gt-input font-normal normal-case" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          {labelData} — fim
          <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className="gt-input font-normal normal-case" />
        </label>
        {extra}
        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          CNPJ do órgão (opcional)
          <input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder={cnpjInstituicao || 'Todos os órgãos'}
            className="gt-input font-normal normal-case"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        {cnpjInstituicao && !cnpj && (
          <button
            type="button"
            onClick={() => setCnpj(cnpjInstituicao)}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            Usar CNPJ da instituição ({cnpjInstituicao})
          </button>
        )}
        <button
          onClick={onConsultar}
          disabled={!dataInicial || !dataFinal || consultando}
          className="ml-auto inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search size={15} /> {consultando ? 'Consultando…' : 'Consultar'}
        </button>
      </div>
    </div>
  )
}

function ResultadoHeader({
  real,
  total,
  mostrando,
  fonte,
}: {
  real: boolean
  total: number
  mostrando: number
  fonte: string
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Badge tone={real ? 'success' : 'neutral'}>{real ? 'Dado real — PNCP' : 'PNCP indisponível no momento'}</Badge>
      {real && (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <Landmark size={13} /> {total.toLocaleString('pt-BR')} {fonte} no Brasil no período — mostrando os {mostrando} primeiros
        </span>
      )}
    </div>
  )
}
