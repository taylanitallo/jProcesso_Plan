import { useState } from 'react'
import {
  Download,
  FileText,
  History,
  ListChecks,
  Save,
  Upload,
  X,
} from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { FormularioModal } from './FormularioModal'
import { USUARIOS_NOMES } from '../../mocks'

const ACOES = [
  'Upload',
  'Solicitar envio',
  'Preencher Informações',
  'Gerar Artefato com IA',
  'Gerar por Arquivo',
]

/**
 * "Ver Detalhes" de um artefato — espelha o modal "Artefato" do SollAI
 * (seções Artefato / Histórico / Status).
 */
export function ArtefatoDetalheModal({
  artefato,
  onClose,
}: {
  artefato: string | null
  onClose: () => void
}) {
  const [responsavel, setResponsavel] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  if (!artefato) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative my-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="mb-1 flex items-center gap-2 border-l-4 border-[var(--color-success)] pl-3">
          <FileText size={20} className="text-[var(--color-primary-strong)]" />
          <h3 className="font-display text-lg font-extrabold text-[color:var(--color-primary)] sm:text-xl">
            Artefato
          </h3>
        </div>
        <p className="mb-4 pl-4 text-xs text-[var(--color-muted)]">{artefato}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-3">
          <div className="min-w-48 flex-1">
            <Combo
              value={responsavel}
              onChange={setResponsavel}
              options={USUARIOS_NOMES}
              placeholder="Selecione o responsável"
            />
          </div>
          <input type="date" className="gt-input w-40 font-normal normal-case" />
          <button
            aria-label="Salvar alterações"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-primary)] text-white"
          >
            <Save size={16} />
          </button>
        </div>

        <div className="mb-4 rounded-[var(--radius-control)] bg-[#eef3fb] p-4">
          <button className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-success)] py-2.5 text-sm font-semibold text-white">
            <Download size={15} /> Download Documento Original
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            {ACOES.map((a) => (
              <button
                key={a}
                onClick={a === 'Preencher Informações' ? () => setFormOpen(true) : undefined}
                className="rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-primary-soft)]"
              >
                {a === 'Upload' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Upload size={14} /> {a}
                  </span>
                ) : (
                  a
                )}
              </button>
            ))}
          </div>

          <Secao icon={<History size={15} />} titulo="Histórico">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[var(--color-muted)]">
                Artefato enviado - 22/12/2025 às 00:22
              </p>
              <button
                aria-label="Baixar versão"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)]"
              >
                <Download size={13} />
              </button>
            </div>
          </Secao>

          <Secao icon={<ListChecks size={15} />} titulo="Status">
            <p className="text-xs text-[var(--color-muted)]">
              Enviado - ALEF MATHEUS TEIXEIRA DE SOUSA - 22/12/2025 às 00:22
            </p>
          </Secao>
        </div>
      </div>

      <FormularioModal artefato={formOpen ? artefato : null} onClose={() => setFormOpen(false)} />
    </div>
  )
}

function Secao({
  icon,
  titulo,
  children,
}: {
  icon: React.ReactNode
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] p-4">
      <div className="mb-2 flex items-center gap-2 border-l-4 border-[var(--color-primary)] pl-2">
        <span className="text-[var(--color-primary-strong)]">{icon}</span>
        <h4 className="font-display text-sm font-bold text-[#183263]">{titulo}</h4>
      </div>
      {children}
    </div>
  )
}
