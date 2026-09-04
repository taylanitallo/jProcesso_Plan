import { useState } from 'react'
import {
  AlertTriangle,
  Download,
  FileText,
  History,
  ListChecks,
  Save,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { FormularioModal } from './FormularioModal'
import { ControleArtefatoModal } from './ControleArtefatoModal'
import { USUARIOS_NOMES } from '../../mocks'

const ACOES = [
  'Upload',
  'Solicitar envio',
  'Preencher Informações',
  'Gerar Artefato com IA',
  'Gerar por Arquivo',
] as const

type Sub = null | 'form' | 'solicitar' | 'arquivo' | 'gerar'

/**
 * "Ver Detalhes" de um artefato — espelha o modal "Artefato" do SollAI
 * (seções Artefato / Histórico / Status) e as ações do lado esquerdo.
 */
export function ArtefatoDetalheModal({
  artefato,
  onClose,
}: {
  artefato: string | null
  onClose: () => void
}) {
  const [responsavel, setResponsavel] = useState('')
  const [sub, setSub] = useState<Sub>(null)
  const [email, setEmail] = useState('')
  const [verDoc, setVerDoc] = useState(false)

  if (!artefato) return null

  const acaoClick: Record<string, () => void> = {
    'Preencher Informações': () => setSub('form'),
    'Solicitar envio': () => setSub('solicitar'),
    'Gerar Artefato com IA': () => setSub('gerar'),
    'Gerar por Arquivo': () => setSub('arquivo'),
  }

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
          <div className="flex flex-wrap justify-center gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-success)] px-5 py-2.5 text-sm font-semibold text-white">
              <Download size={15} /> Download Documento Original
            </button>
            <button
              onClick={() => setVerDoc(true)}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <FileText size={15} /> Ver Documento
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
            Clique em "Ver Documento" para acessar o documento e dar continuidade ao fluxo configurado
            no fluxo de trabalho.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            {ACOES.map((a) => (
              <button
                key={a}
                onClick={acaoClick[a]}
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

      <FormularioModal artefato={sub === 'form' ? artefato : null} onClose={() => setSub(null)} />
      <ControleArtefatoModal artefato={verDoc ? artefato : null} onClose={() => setVerDoc(false)} />

      {sub === 'solicitar' && (
        <MiniDialog onClose={() => setSub(null)}>
          <p className="text-center font-display text-lg font-bold text-[#183263]">
            Qual o email que deseja enviar a solicitação?
          </p>
          <input
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="gt-input mt-4 w-full font-normal normal-case"
          />
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setSub(null)}
              className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
            >
              Cancelar
            </button>
            <button
              onClick={() => setSub(null)}
              className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white"
            >
              Enviar
            </button>
          </div>
        </MiniDialog>
      )}

      {sub === 'gerar' && (
        <MiniDialog onClose={() => setSub(null)}>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c26b] text-[#d39a16]">
            <AlertTriangle size={24} />
          </span>
          <p className="mt-3 text-center font-display text-lg font-bold text-[#183263]">
            Gerar Artefato?
          </p>
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
            Antes de prosseguir, <strong>recomendamos que você confira se o dados do formulário
            estão corretamente preenchidos.</strong>
          </p>
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
            Essa ação iniciará o processamento do seu Artefato.
          </p>
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">Deseja continuar?</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setSub(null)}
              className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Sim, Gerar Artefato
            </button>
            <button
              onClick={() => setSub(null)}
              className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
            >
              Cancelar
            </button>
          </div>
        </MiniDialog>
      )}

      {sub === 'arquivo' && (
        <MiniDialog wide onClose={() => setSub(null)}>
          <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#183263]">
            <UploadCloud size={20} className="text-[var(--color-primary-strong)]" /> Envio de Arquivos
            para Processamento
          </h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Envie até 15 arquivos para Processamento
          </p>

          <div className="mt-3 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] p-4 text-[13px] text-[#8a6d1a]">
            <p className="flex items-center gap-2 font-bold">
              <AlertTriangle size={15} /> Aviso sobre envio de documentos
            </p>
            <p className="mt-1">Para melhor funcionamento da análise na SollAI, não envie documentos:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>Digitalizados (em formato de imagem/PDF escaneado)</li>
              <li>Bloqueados para cópia ou edição</li>
              <li>Com imagens muito grandes que possam comprometer o processamento</li>
            </ul>
            <p className="mt-1 font-semibold">Dê preferência a arquivos em formato .docx, .pdf editável.</p>
          </div>

          <label className="mx-auto mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f9d55_0%,#198754_100%)] px-4 py-2.5 text-sm font-semibold text-white">
            <UploadCloud size={16} /> Selecionar Arquivos
            <input type="file" multiple className="hidden" />
          </label>
          <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
            (Formatos aceitos: .pdf,.doc ou .docx - Tamanho máximo: 800MB por arquivo - até 15
            arquivos)
          </p>

          <button
            onClick={() => setSub(null)}
            className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold text-white"
          >
            Enviar
          </button>
        </MiniDialog>
      )}
    </div>
  )
}

function MiniDialog({
  children,
  onClose,
  wide,
}: {
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(9,21,44,0.35)]" />
      <div
        className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-[16px] bg-white p-6 shadow-[var(--shadow-pop)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
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
