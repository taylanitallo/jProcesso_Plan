import { useState } from 'react'
import { Filter, Plus, Search } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { DataTable, Pagination, type Column } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ArtefatoDetalheModal } from './ArtefatoDetalheModal'
import { MapaRiscoModal } from './MapaRiscoModal'

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

/** Só os primeiros artefatos (fluxo principal) têm processos gerais associados. */
const COM_PROCESSOS = 14

type LinhaProcesso = {
  numero: string
  nome: string
  responsavel: string
  prazo: string
  status: 'ENVIADO' | 'NÃO ENVIADO' | 'NÃO INICIADO'
}

const LINHAS: LinhaProcesso[] = [
  { numero: '1', nome: 'PERMANENTE', responsavel: 'Não definido', prazo: 'Sem prazo', status: 'NÃO ENVIADO' },
  { numero: 'teste', nome: 'OBRA 33', responsavel: 'Não definido', prazo: 'Sem prazo', status: 'NÃO INICIADO' },
]

const STATUS_TONE = {
  ENVIADO: 'success',
  'NÃO ENVIADO': 'info',
  'NÃO INICIADO': 'neutral',
} as const

export function StatusArtefatosPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const [sel, setSel] = useState(0)
  const [detalhe, setDetalhe] = useState<string | null>(null)
  const [mapaRisco, setMapaRisco] = useState(false)

  const artefatoSel = ARTEFATOS[sel]
  const linhas = sel < COM_PROCESSOS ? LINHAS : []

  const abrir = () => {
    if (artefatoSel === 'Mapa de Risco') setMapaRisco(true)
    else setDetalhe(artefatoSel)
  }

  const cols: Column<LinhaProcesso>[] = [
    { key: 'numero', header: 'Número do Processo', align: 'center' },
    {
      key: 'nome',
      header: 'Nome do Processo',
      render: (r) => (
        <span className="font-semibold text-[var(--color-primary-strong)]">{r.nome}</span>
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
      key: 'acoes',
      header: 'Ações',
      align: 'right',
      render: () => (
        <div className="flex justify-end">
          <button
            onClick={abrir}
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
        rowKey={(r) => r.numero}
        empty={
          <EmptyState
            icon={Plus}
            title="Nenhum processo encontrado"
            subtitle="Não há processos gerais registrados para este modelo."
          />
        }
        footer={
          <>
            <Pagination />
            <span>Registros encontrados: {linhas.length}</span>
          </>
        }
      />

      <ArtefatoDetalheModal artefato={detalhe} onClose={() => setDetalhe(null)} />
      <MapaRiscoModal open={mapaRisco} onClose={() => setMapaRisco(false)} />
    </div>
  )
}
