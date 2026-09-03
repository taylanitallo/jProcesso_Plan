import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/common/Badge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { PROCESSOS } from '../../mocks'

/** 27 artefatos típicos do fluxo da Lei 14.133/2021. */
const ARTEFATOS = [
  'Documento de Formalização da Demanda (DFD)',
  'Estudo Técnico Preliminar (ETP)',
  'Mapa de Riscos',
  'Termo de Referência (TR)',
  'Projeto Básico',
  'Projeto Executivo',
  'Pesquisa de Preços',
  'Mapa Comparativo de Preços',
  'Justificativa de Preço',
  'Anteprojeto',
  'Matriz de Riscos Contratual',
  'Edital de Licitação',
  'Minuta de Contrato',
  'Minuta de Ata de Registro de Preços',
  'Parecer Jurídico',
  'Parecer Técnico',
  'Despacho de Autorização',
  'Autorização da Autoridade Competente',
  'Portaria de Designação de Fiscal',
  'Nota Técnica',
  'Relatório de Fiscalização',
  'Termo de Recebimento Provisório',
  'Termo de Recebimento Definitivo',
  'Ordem de Serviço / Fornecimento',
  'Ata de Reunião',
  'Checklist de Instrução Processual',
  'Relatório Final da Contratação',
]

const cols: Column<(typeof PROCESSOS)[number]>[] = [
  { key: 'numero', header: 'Número' },
  { key: 'tipo', header: 'Tipo' },
  { key: 'nome', header: 'Nome' },
  { key: 'inclusao', header: 'Inclusão' },
  { key: 'status', header: 'Status', render: (r) => <Badge tone="neutral">{r.status}</Badge> },
]

export function StatusArtefatosPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const [page, setPage] = useState(0)
  const perPage = 6
  const pages = Math.ceil(ARTEFATOS.length / perPage)
  const slice = ARTEFATOS.slice(page * perPage, page * perPage + perPage)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Status Individual de Cada Artefato"
        subtitle="Acompanhe a situação de cada um dos 27 artefatos por processo"
      />

      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#183263]">Tipos de artefato</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="grid h-8 w-8 place-items-center rounded-[10px] border border-[var(--color-line)] text-[var(--color-muted)] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              className="grid h-8 w-8 place-items-center rounded-[10px] border border-[var(--color-line)] text-[var(--color-muted)] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slice.map((a) => (
            <div
              key={a}
              className="flex items-start gap-3 rounded-[12px] border border-[var(--color-line)] bg-[#f8fafd] p-3"
            >
              <FileText size={18} className="mt-0.5 shrink-0 text-[var(--color-primary-strong)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{a}</p>
                <Badge tone="neutral">Aguardando Envio</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={PROCESSOS}
        rowKey={(r) => String(r.id)}
        footer={<span>Registros encontrados: {PROCESSOS.length}</span>}
      />
    </div>
  )
}
