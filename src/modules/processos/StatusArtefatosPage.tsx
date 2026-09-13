import { useState } from 'react'
import { FileSignature, Filter, Plus, Search } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ArtefatoDetalheModal } from './ArtefatoDetalheModal'
import { MapaRiscoModal } from './MapaRiscoModal'
import { useProcessos, type ProcessoLocal } from '../../store/processos'
import { useWorkflows } from '../../store/workflows'
import { exigenciasDoProcesso } from './exigencias'

/** Artefatos do fluxo 14.133 — ordem e rótulos conforme o SollAI real. */
const ARTEFATOS = [
  'Documento de Formalização de Demanda (DFD)',
  'Estudo Técnico Preliminar (ETP)',
  'Mapa de Risco',
  'Termo de Referência',
  'Edital',
  'Proposta Vencedora',
  'Anteprojeto',
  'Projeto Básico',
  'Parecer Parametrizado',
  'Minuta do Contrato',
  'Disponibilidade Orçamentária',
  'Pesquisa de Preços',
  'Autorização do Ordenador de Despesas',
  'Aviso de Dispensa',
  'Ata de Registro de Preços',
  'Despacho de Adesão',
  'Checklist de Adesão',
  'Autorização da Alta Administração',
  'Parecer da Assessoria Jurídica',
  'Autorização Definitiva da Alta Administração',
  'Formalização da Contratação',
  'Justificativa de Inexigibilidade',
  'Parecer de Adequação da Modalidade',
  'Checklist de Habilitação e Qualificação',
  'Autorização e Ratificação da Contratação',
  'Designação de Gestor e Fiscal do Contrato',
  'Razão da escolha do contratado',
  'Termo de Homologação e Adjudicação',
  'Parecer de Controle Interno',
  'Termo de Homologação',
]

type EtapaExig = 'ok' | 'pendente' | 'na'

type LinhaProcesso = {
  proc: ProcessoLocal
  responsavel: string
  prazo: string
  status: 'ENVIADO' | 'NÃO ENVIADO' | 'NÃO INICIADO'
  aprov: EtapaExig
  assin: EtapaExig
}

const STATUS_TONE = {
  ENVIADO: 'success',
  'NÃO ENVIADO': 'info',
  'NÃO INICIADO': 'neutral',
} as const

export function StatusArtefatosPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const processos = useProcessos((s) => s.processos)
  const workflows = useWorkflows((s) => s.workflows)
  const [sel, setSel] = useState(0)
  const [detalhe, setDetalhe] = useState<string | null>(null)
  const [detalheProc, setDetalheProc] = useState<ProcessoLocal | null>(null)
  const [mapaRisco, setMapaRisco] = useState(false)

  const artefatoSel = ARTEFATOS[sel]

  const linhas: LinhaProcesso[] = processos.map((p) => {
    const a = p.artefatos.find((x) => x.completo === artefatoSel || x.nome === artefatoSel)
    const exig = a ? exigenciasDoProcesso(p, workflows).get(a.completo) : undefined
    const marca = (exige: boolean, feito: string): EtapaExig =>
      !exige ? 'na' : feito ? 'ok' : 'pendente'
    return {
      proc: p,
      responsavel: a?.responsavel || 'Não definido',
      prazo: a?.prazo || 'Sem prazo',
      status: !a ? 'NÃO INICIADO' : a.enviado ? 'ENVIADO' : 'NÃO ENVIADO',
      aprov: marca(Boolean(exig?.aprovacao), a?.aprovadoEm ?? ''),
      assin: marca(Boolean(exig?.assinatura), a?.assinadoEm ?? ''),
    }
  })

  const abrir = (proc: ProcessoLocal) => {
    if (artefatoSel === 'Mapa de Risco') setMapaRisco(true)
    else {
      setDetalheProc(proc)
      setDetalhe(artefatoSel)
    }
  }

  const cols: Column<LinhaProcesso>[] = [
    { key: 'numero', header: 'Número do Processo', align: 'center', render: (r) => r.proc.numero },
    {
      key: 'nome',
      header: 'Nome do Processo',
      render: (r) => (
        <span className="font-semibold text-[var(--color-primary-strong)]">{r.proc.nome}</span>
      ),
    },
    { key: 'responsavel', header: 'Responsável', align: 'center' },
    { key: 'prazo', header: 'Prazo', align: 'center' },
    {
      key: 'status',
      header: 'Status Atual',
      align: 'center',
      render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>,
    },
    {
      key: 'exig',
      header: 'Aprov./Assin.',
      align: 'center',
      render: (r) => {
        if (r.aprov === 'na' && r.assin === 'na')
          return <span className="text-xs text-[var(--color-muted)]">—</span>
        return (
          <span className="inline-flex justify-center gap-1">
            {r.aprov !== 'na' && (
              <span
                title={r.aprov === 'ok' ? 'Aprovado' : 'Aprovação pendente'}
                className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                  r.aprov === 'ok'
                    ? 'bg-[#e4f4ec] text-[var(--color-success)]'
                    : 'bg-[#eef2f8] text-[var(--color-muted)]'
                }`}
              >
                A
              </span>
            )}
            {r.assin !== 'na' && (
              <span
                title={r.assin === 'ok' ? 'Assinado' : 'Assinatura pendente'}
                className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                  r.assin === 'ok' ? 'bg-[#ede9fe] text-[#7c3aed]' : 'bg-[#eef2f8] text-[var(--color-muted)]'
                }`}
              >
                S
              </span>
            )}
          </span>
        )
      },
    },
    {
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end">
          <button
            onClick={() => abrir(r.proc)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Search size={13} /> Detalhes
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Status Individual de Cada Artefato"
        subtitle="Acompanhe, por tipo de artefato, o andamento em todos os processos."
        icon={FileSignature}
        accent="amber"
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {ARTEFATOS.map((a, i) => (
          <button
            key={a}
            onClick={() => setSel(i)}
            className={`flex min-w-[180px] max-w-[180px] shrink-0 items-center gap-2 rounded-[var(--radius-card)] border px-3 py-3 text-left text-xs font-semibold transition ${
              i === sel
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-[#bcd0ee] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] hover:bg-white'
            }`}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                i === sel ? 'bg-white/20' : 'bg-white'
              }`}
            >
              <Search size={15} />
            </span>
            <span className="leading-tight">{a}</span>
          </button>
        ))}
      </div>

      <div className="flex items-start justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white px-5 py-4 shadow-[var(--shadow-card)]">
        <div>
          <h3 className="font-display text-base font-bold text-[#183263]">Processos gerais</h3>
          <p className="text-xs text-[var(--color-muted)]">{artefatoSel}</p>
        </div>
        <button
          aria-label="Filtrar resultados"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]"
        >
          <Filter size={15} />
        </button>
      </div>

      <DataTable<LinhaProcesso>
        columns={cols}
        rows={linhas}
        rowKey={(r) => r.proc.id}
        empty={
          <EmptyState
            icon={Plus}
            title="Nenhum processo encontrado"
            subtitle="Crie um processo em Processos Inteligentes para acompanhar os artefatos."
          />
        }
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {linhas.length}</span>
          </>
        }
      />

      <ArtefatoDetalheModal
        artefato={detalheProc ? detalhe : null}
        processo={detalheProc ?? processos[0]}
        onClose={() => {
          setDetalhe(null)
          setDetalheProc(null)
        }}
      />
      <MapaRiscoModal open={mapaRisco} onClose={() => setMapaRisco(false)} />
    </div>
  )
}
