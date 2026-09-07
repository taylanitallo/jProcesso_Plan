import { useState } from 'react'
import {
  AlertTriangle,
  CircleUserRound,
  Download,
  FileText,
  History,
  ListChecks,
  Save,
  Search,
  Send,
  Upload,
  UploadCloud,
  UserPlus,
  X,
} from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { FormularioModal } from './FormularioModal'
import { OnlyOfficeEditorModal } from '../../components/common/OnlyOfficeEditorModal'
import { PROCESSO_ARTEFATOS, PROCESSOS, USUARIOS_NOMES } from '../../mocks'

const ACOES = [
  'Upload',
  'Solicitar envio',
  'Preencher Informações',
  'Gerar Artefato com IA',
  'Gerar por Arquivo',
] as const

type Sub = null | 'form' | 'solicitar' | 'arquivo' | 'gerar' | 'upload'

const USUARIO_ATUAL = 'ALEF MATHEUS TEIXEIRA DE SOUSA'

/** Sobe o anexo pro dev-server; devolve a URL que o OnlyOffice consegue baixar. */
async function enviarAnexo(file: File): Promise<string | null> {
  try {
    const res = await fetch('/__upload', {
      method: 'POST',
      headers: { 'x-file-name': encodeURIComponent(file.name) },
      body: file,
    })
    if (!res.ok) return null
    const json = (await res.json()) as { url?: string }
    return json.url ?? null
  } catch {
    return null
  }
}

type HistItem = {
  evento: string
  data: string
  tipoEnvio: string
  usuario: string
  detalhe: string
}

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
  /** URL do documento anexado (via /__upload). Vazio = usa o modelo de exemplo. */
  const [docUrl, setDocUrl] = useState('')
  const [arquivoGerar, setArquivoGerar] = useState<File | null>(null)
  const [revisaoOpen, setRevisaoOpen] = useState(false)
  const [historico, setHistorico] = useState<HistItem[]>([
    {
      evento: 'Artefato enviado',
      data: '22/12/2025 às 00:22',
      tipoEnvio: 'Upload',
      usuario: USUARIO_ATUAL,
      detalhe: 'Envio inicial',
    },
  ])

  const registrar = (evento: string, tipoEnvio: string, detalhe: string) => {
    const agora = new Date()
    const data = agora.toLocaleDateString('pt-BR')
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setHistorico((prev) => [
      { evento, data: `${data} às ${hora}`, tipoEnvio, usuario: USUARIO_ATUAL, detalhe },
      ...prev,
    ])
  }

  const baixarDoc = () => {
    const href = docUrl || '/modelos/termo-referencia.docx'
    const a = document.createElement('a')
    a.href = href
    a.download = href.split('/').pop() || 'documento.docx'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  if (!artefato) return null

  const info = PROCESSO_ARTEFATOS.find((a) => a.completo === artefato)
  const temRevisao = Boolean(info?.revisao)
  const processo = PROCESSOS[0]

  const painel = (
    <div className="flex h-full flex-col">
      <div className="bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] px-4 py-4 text-white">
        <p className="flex items-center gap-2 font-display text-sm font-extrabold leading-tight">
          <FileText size={18} /> {artefato}
        </p>
        <p className="mt-1 text-xs text-white/85">{processo.nome}</p>
      </div>

      <div className="flex-1 space-y-4 p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Status Atual
          </p>
          <span className="mt-1 inline-block rounded-[var(--radius-pill)] bg-[#d7f5ea] px-3 py-1 text-xs font-bold text-[var(--color-success)]">
            {info?.enviado ? 'Enviado' : 'Pendente'}
          </span>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Detalhes
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Atualizado em {new Date().toLocaleDateString('pt-BR')},{' '}
            {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-[var(--color-line)] p-4">
        <button
          onClick={() => registrar('Artefato atualizado', 'Edição no editor', 'Alterações salvas')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white"
        >
          <Save size={15} /> Salvar alterações
        </button>
        {temRevisao && (
          <button
            onClick={() => setRevisaoOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-success)] py-2.5 text-sm font-semibold text-white"
          >
            <Send size={15} /> Enviar para Revisão
          </button>
        )}
      </div>
    </div>
  )

  const acaoClick: Record<string, () => void> = {
    Upload: () => setSub('upload'),
    'Preencher Informações': () => setSub('form'),
    'Solicitar envio': () => setSub('solicitar'),
    'Gerar Artefato com IA': () => setSub('gerar'),
    'Gerar por Arquivo': () => setSub('arquivo'),
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative my-4 max-h-[90vh] w-full max-w-[1320px] overflow-y-auto rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
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
          <h3 className="font-display text-base font-bold text-[color:var(--color-primary)] sm:text-lg">
            Artefato
          </h3>
        </div>
        <p className="mb-4 pl-4 text-xs text-[var(--color-muted)]">{artefato}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[#f8fafd] p-3">
          <CircleUserRound size={22} className="shrink-0 text-[var(--color-primary-strong)]" />
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
            <button
              onClick={baixarDoc}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-success)] px-5 py-2.5 text-sm font-semibold text-white"
            >
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

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
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
            <ul className="flex flex-col gap-2">
              {historico.map((h, i) => (
                <li
                  key={`${h.evento}-${h.data}-${i}`}
                  className="group relative flex items-center justify-between gap-2 rounded-[var(--radius-control)] px-1 py-0.5 hover:bg-[#f4f7fc]"
                >
                  <p className="text-xs text-[var(--color-muted)]">
                    {h.evento} - {h.data}
                  </p>
                  <button
                    aria-label="Baixar versão"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)]"
                  >
                    <Download size={13} />
                  </button>

                  <div className="pointer-events-none absolute left-full top-0 z-20 ml-2 hidden w-64 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white text-left shadow-[var(--shadow-pop)] group-hover:block">
                    <p className="rounded-t-[var(--radius-control)] bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] px-3 py-1.5 text-xs font-bold text-white">
                      Detalhes
                    </p>
                    <dl className="space-y-1 p-3 text-xs">
                      <div>
                        <dt className="inline font-bold text-[var(--color-ink)]">Tipo Envio: </dt>
                        <dd className="inline text-[var(--color-muted)]">{h.tipoEnvio}</dd>
                      </div>
                      <div>
                        <dt className="inline font-bold text-[var(--color-ink)]">Data: </dt>
                        <dd className="inline text-[var(--color-muted)]">{h.data}</dd>
                      </div>
                      <div>
                        <dt className="inline font-bold text-[var(--color-ink)]">Usuário: </dt>
                        <dd className="inline text-[var(--color-muted)]">{h.usuario}</dd>
                      </div>
                      <div>
                        <dt className="inline font-bold text-[var(--color-ink)]">Detalhes: </dt>
                        <dd className="inline text-[var(--color-muted)]">{h.detalhe}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              ))}
            </ul>
          </Secao>

          <Secao icon={<ListChecks size={15} />} titulo="Status">
            <p className="text-xs text-[var(--color-muted)]">
              Enviado - ALEF MATHEUS TEIXEIRA DE SOUSA - 22/12/2025 às 00:22
            </p>
          </Secao>
        </div>
      </div>

      <FormularioModal
        artefato={sub === 'form' ? artefato : null}
        onClose={() => setSub(null)}
        onSalvar={() =>
          registrar('Artefato atualizado', 'Preenchimento manual', 'Formulário preenchido')
        }
      />
      <OnlyOfficeEditorModal
        titulo={verDoc ? artefato : null}
        docUrl={docUrl ? `http://host.docker.internal:5175${docUrl}` : undefined}
        painel={painel}
        onClose={() => setVerDoc(false)}
      />

      {revisaoOpen && (
        <EnviarRevisaoModal
          onClose={() => setRevisaoOpen(false)}
          onEnviar={() => {
            registrar('Enviado para revisão', 'Revisão', 'Aguardando revisor')
            setRevisaoOpen(false)
          }}
        />
      )}

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
              onClick={() => {
                registrar('Solicitação de envio', 'Solicitação', email || 'Solicitação enviada')
                setSub(null)
              }}
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
              onClick={() => {
                registrar('Geração por IA iniciada', 'Gerar com IA', 'Processamento iniciado')
                setSub(null)
              }}
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
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#183263]">
            <UploadCloud size={18} className="text-[var(--color-primary-strong)]" /> Envio de Arquivos
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
            <UploadCloud size={16} /> {arquivoGerar ? arquivoGerar.name : 'Selecionar Arquivos'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setArquivoGerar(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
            (Formatos aceitos: .pdf,.doc ou .docx - Tamanho máximo: 800MB por arquivo - até 15
            arquivos)
          </p>

          <button
            onClick={async () => {
              if (arquivoGerar) {
                const url = await enviarAnexo(arquivoGerar)
                if (url) setDocUrl(url)
              }
              registrar('Artefato atualizado', 'Gerar por Arquivo', 'Arquivo registrado')
              setArquivoGerar(null)
              setSub(null)
            }}
            disabled={!arquivoGerar}
            className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </MiniDialog>
      )}

      {sub === 'upload' && (
        <UploadArtefatoDialog
          nome={artefato}
          onClose={() => setSub(null)}
          onEnviar={(url) => {
            if (url) setDocUrl(url)
            registrar('Artefato enviado', 'Upload', 'Arquivo enviado')
          }}
        />
      )}
    </div>
  )
}

function UploadArtefatoDialog({
  nome,
  onClose,
  onEnviar,
}: {
  nome: string
  onClose: () => void
  onEnviar: (url: string | null) => void
}) {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)

  return (
    <MiniDialog onClose={onClose}>
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#183263]">
        <Upload size={18} className="text-[var(--color-primary-strong)]" /> Upload do Artefato
      </h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{nome}</p>

      <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-control)] border-2 border-dashed border-[#c9d6ea] bg-[#f7f9fc] px-4 py-10 text-center">
        <UploadCloud size={28} className="text-[var(--color-muted)]" />
        <span className="text-sm font-semibold text-[var(--color-primary-strong)]">
          {arquivo ? arquivo.name : 'Clique para selecionar o arquivo'}
        </span>
        <span className="text-xs text-[var(--color-muted)]">.pdf, .doc ou .docx — até 800MB.</span>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)]"
        >
          Cancelar
        </button>
        <button
          onClick={async () => {
            if (!arquivo) return
            setEnviando(true)
            const url = await enviarAnexo(arquivo)
            setEnviando(false)
            onEnviar(url)
            onClose()
          }}
          disabled={!arquivo || enviando}
          className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </MiniDialog>
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

function EnviarRevisaoModal({
  onClose,
  onEnviar,
}: {
  onClose: () => void
  onEnviar: () => void
}) {
  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState<string[]>([])

  const toggle = (u: string) =>
    setSelecionados((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]))

  const usuarios = USUARIOS_NOMES.filter((u) => u.toLowerCase().includes(busca.toLowerCase()))
  const podeEnviar = selecionados.length > 0

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-[1320px] rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Send size={20} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Enviar para Revisão</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Escolha <strong>usuários</strong> e/ou <strong>setores</strong> que poderão concluir
              esta etapa. Basta que <strong>um</strong> deles finalize — os demais saem da fila
              automaticamente.
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar usuário ou setor por nome, login ou código..."
            className="gt-input !pl-9 font-normal normal-case"
          />
        </div>

        <button
          onClick={() => toggle(USUARIO_ATUAL)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]"
        >
          <UserPlus size={13} /> Incluir-me
        </button>

        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <CircleUserRound size={16} className="text-[var(--color-primary-strong)]" />
              <div>
                <p className="font-display text-sm font-bold text-[#183263]">Usuários</p>
                <p className="text-[11px] text-[var(--color-muted)]">
                  {USUARIOS_NOMES.length} disponíveis no contrato
                </p>
              </div>
            </div>
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {usuarios.map((u) => (
                <li key={u}>
                  <label className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-2.5 hover:bg-[#f8fafd]">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--color-ink)]">
                        {u}
                        {u === USUARIO_ATUAL && (
                          <span className="ml-1 rounded-[var(--radius-pill)] bg-[#d7f5ea] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
                            você
                          </span>
                        )}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selecionados.includes(u)}
                      onChange={() => toggle(u)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks size={16} className="text-[var(--color-primary-strong)]" />
              <div>
                <p className="font-display text-sm font-bold text-[#183263]">Setores</p>
                <p className="text-[11px] text-[var(--color-muted)]">0 setores cadastrados</p>
              </div>
            </div>
            <div className="rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-3 text-xs text-[var(--color-muted)]">
              Nenhum setor encontrado para o filtro informado.
            </div>
          </div>
        </div>

        {!podeEnviar && (
          <p className="mt-4 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs font-semibold text-[#8a6d1a]">
            Selecione ao menos um usuário ou setor para continuar.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-line)] py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]"
          >
            Cancelar
          </button>
          <button
            onClick={onEnviar}
            disabled={!podeEnviar}
            className="flex-[2] rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar para Revisão
          </button>
        </div>
      </div>
    </div>
  )
}
