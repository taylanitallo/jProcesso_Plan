import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import JSZip from 'jszip'
import {
  AlertTriangle,
  Check,
  Clock,
  Database,
  FileDown,
  FileText,
  Lock,
  MoreVertical,
  Package,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  SquarePen,
  UserRound,
  X,
} from 'lucide-react'
import { AiBubble } from '../chat/ChatShell'
import { Combo } from '../../components/common/Combo'
import { useModuleLinks } from '../../components/shell/useModuleLinks'
import { PROCESSOS_MODULE_LINKS } from './processosLinks'
import { ArtefatoDetalheModal } from './ArtefatoDetalheModal'
import { MapaRiscoModal } from './MapaRiscoModal'
import { CadastroItensModal } from './CadastroItensModal'
import { NormativasProcessoModal } from './NormativasProcessoModal'
import { PermissoesProcessoModal } from './PermissoesProcessoModal'
import { useProcessos, type ProcessoArtefato } from '../../store/processos'
import { useSolicitacoes, statusSolicitacaoLabel } from '../../store/solicitacoes'
import { Badge } from '../../components/common/Badge'

const EDIT_VAZIO = { nome: '', numero: '', loteUnico: 'Não' as 'Sim' | 'Não', descricao: '' }

export function ProcessoDetailPage() {
  useModuleLinks(PROCESSOS_MODULE_LINKS)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const proc = useProcessos((s) => s.processos.find((p) => p.id === id))
  const atualizar = useProcessos((s) => s.atualizar)
  const finalizar = useProcessos((s) => s.finalizar)
  const solicitacoes = useSolicitacoes((s) => s.solicitacoes)
  const solicitacoesProc = solicitacoes.filter((x) => x.processoId === id)

  const [value, setValue] = useState('')
  const [artefato, setArtefato] = useState<string | null>(null)
  const [mapaRisco, setMapaRisco] = useState(false)
  const [itensOpen, setItensOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EDIT_VAZIO)

  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [normativasOpen, setNormativasOpen] = useState(false)
  const [permOpen, setPermOpen] = useState(false)
  const [pdfConfirm, setPdfConfirm] = useState(false)
  const [finalizarConfirm, setFinalizarConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  if (!proc) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="font-display text-lg font-bold text-[#183263]">Processo não encontrado</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Ele pode ter sido excluído ou o link está incorreto.
          </p>
          <button
            onClick={() => navigate('/processosinteligentes')}
            className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Voltar para Processos
          </button>
        </div>
      </div>
    )
  }

  const numero = proc.numero
  const nome = proc.nome
  const tipo = proc.tipo
  const finalizado = proc.status === 'FINALIZADO'

  const abrirEdicao = () => {
    setEditForm({
      nome: proc.nome,
      numero: proc.numero,
      loteUnico: proc.loteUnico,
      descricao: proc.descricao,
    })
    setEditOpen(true)
  }

  const abrirArtefato = (a: ProcessoArtefato) => {
    if (a.nome === 'Mapa de Risco') setMapaRisco(true)
    else setArtefato(a.completo)
  }

  const baixarDocumentos = async () => {
    const enviados = proc.artefatos.filter((a) => a.enviado)
    if (enviados.length === 0) {
      showToast('Nenhum documento enviado para compactar.')
      return
    }
    const zip = new JSZip()
    const pasta = zip.folder(`Processo_${numero}_Documentos`)!
    for (const a of enviados) {
      const arquivo = a.nome.replace(/[\\/]/g, '-').replace(/\s+/g, '_')
      pasta.file(
        `${arquivo}.txt`,
        `${a.completo}\nProcesso N.º ${numero}\nStatus: Enviado\n`,
      )
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Processo_${numero}_Documentos.zip`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('Download iniciado.')
  }

  const gerarDocumentosPdf = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const margin = 20
    const largura = doc.internal.pageSize.getWidth() - margin * 2

    doc.setFontSize(16)
    doc.text(`Processo N.º ${numero}`, margin, margin)
    doc.setFontSize(11)
    doc.text(`${nome} — ${tipo}`, margin, margin + 8)

    proc.artefatos.forEach((a, i) => {
      doc.addPage()
      doc.setFontSize(14)
      doc.text(`${i + 1}. ${a.nome}`, margin, margin)
      doc.setFontSize(11)
      const linhas = doc.splitTextToSize(a.completo, largura)
      doc.text(linhas, margin, margin + 10)
      doc.setFontSize(10)
      doc.text(`Status: ${a.enviado ? 'Enviado' : 'Não designado'}`, margin, margin + 22)
    })

    doc.save(`Processo_${numero}_Unificado.pdf`)
  }

  const MAIS_OPCOES = [
    {
      key: 'editar',
      label: 'Editar',
      icon: <SquarePen size={16} />,
      onClick: () => {
        setMenuOpen(false)
        abrirEdicao()
      },
    },
    {
      key: 'normativas',
      label: 'Normativas',
      icon: <Database size={16} />,
      onClick: () => {
        setMenuOpen(false)
        setNormativasOpen(true)
      },
    },
    {
      key: 'baixar',
      label: 'Baixar Documentos Compactados',
      icon: <FileDown size={16} />,
      onClick: () => {
        setMenuOpen(false)
        baixarDocumentos()
      },
    },
    {
      key: 'pdf',
      label: 'Gerar Documentos em PDF',
      icon: <FileText size={16} />,
      onClick: () => {
        setMenuOpen(false)
        setPdfConfirm(true)
      },
    },
    {
      key: 'permissoes',
      label: 'Permissões',
      icon: <Lock size={16} />,
      onClick: () => {
        setMenuOpen(false)
        setPermOpen(true)
      },
    },
    {
      key: 'finalizar',
      label: 'Finalizar',
      icon: <ShieldCheck size={16} />,
      onClick: () => {
        setMenuOpen(false)
        setFinalizarConfirm(true)
      },
    },
  ] as const

  const total = proc.artefatos.length
  const feitos = proc.artefatos.filter((a) => a.enviado).length
  const pct = total === 0 ? 0 : Math.round((feitos / total) * 100)

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho do processo */}
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
        <h3 className="border-l-4 border-[var(--color-primary)] pl-2 font-display text-sm font-bold text-[#183263]">
          Processo N.º <span className="text-base">{numero}</span>
        </h3>
        <span className="text-xs font-semibold text-[var(--color-ink)]">{nome}</span>
        <span className="rounded-[var(--radius-pill)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary-strong)]">
          {proc.legislacao}
        </span>
        <span className="rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[#f1f4f9] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-muted)]">
          {tipo}
        </span>
        {finalizado && (
          <span className="rounded-[var(--radius-pill)] border border-[#a9d9c1] bg-[#eefaf3] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-success)]">
            Finalizado
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Sparkles size={13} /> Analisar com IA
          </button>
          <button
            onClick={() => setItensOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Package size={13} /> Itens
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Mais opções"
              className="grid h-7 w-7 place-items-center rounded-[var(--radius-control)] border border-[var(--color-line)] text-[var(--color-muted)]"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 shadow-[var(--shadow-pop)]">
                {MAIS_OPCOES.map((op) => (
                  <button
                    key={op.key}
                    onClick={op.onClick}
                    className="flex w-full items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--color-primary-strong)] transition hover:bg-[var(--color-primary-soft)]"
                  >
                    {op.icon} {op.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trilha de artefatos — timeline vertical */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
        <div className="bg-[linear-gradient(135deg,#12203f_0%,#1b2f57_100%)] px-5 py-3 text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">Artefatos do Processo</h2>
            <span className="rounded-[var(--radius-pill)] bg-white/15 px-2 py-0.5 text-[11px] font-bold">
              {feitos}/{total}
            </span>
          </div>
          <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[var(--color-success)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-white/70">{pct}% concluído</p>
        </div>

        <ol className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {proc.artefatos.map((a) => (
            <li key={a.completo}>
              <button
                onClick={() => abrirArtefato(a)}
                title={a.completo}
                className={`flex w-full flex-col gap-1.5 rounded-[14px] border p-3 text-left transition hover:shadow-[var(--shadow-card)] ${
                  a.enviado ? 'border-[#a9d9c1] bg-[#eefaf3]' : 'border-[#eccb87] bg-[#fdf6e6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${
                      a.enviado ? 'bg-[var(--color-success)]' : 'bg-[#d9a441]'
                    }`}
                  >
                    {a.enviado ? <Check size={12} /> : <X size={12} />}
                  </span>
                  <p
                    className={`font-display text-[12.5px] font-bold leading-tight ${
                      a.enviado ? 'text-[var(--color-success)]' : 'text-[#a3720c]'
                    }`}
                  >
                    {a.nome}
                  </p>
                </div>
                <p className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
                  <UserRound size={10} /> {a.responsavel || 'Não designado'}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
                  <Clock size={10} /> {a.prazo || 'Sem Prazo Definido'}
                </p>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {solicitacoesProc.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-line)] px-4 py-3">
            <h2 className="font-display text-sm font-bold">Solicitações de preenchimento</h2>
            <p className="text-xs text-[var(--color-muted)]">
              Pedidos enviados aos setores. Responda em Registro de Necessidades › Solicitações de
              Preenchimento.
            </p>
          </div>
          <ul className="divide-y divide-[var(--color-line)]">
            {solicitacoesProc.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-ink)]">{s.setor}</p>
                  {s.descricao && (
                    <p className="truncate text-xs text-[var(--color-muted)]">{s.descricao}</p>
                  )}
                </div>
                <Badge tone={s.status === 'RESPONDIDA' ? 'success' : 'warning'}>
                  {statusSolicitacaoLabel(s.status)}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {artefato && (
        <ArtefatoDetalheModal
          key={artefato}
          artefato={artefato}
          processo={proc}
          onClose={() => setArtefato(null)}
        />
      )}
      <MapaRiscoModal open={mapaRisco} onClose={() => setMapaRisco(false)} />
      <CadastroItensModal open={itensOpen} onClose={() => setItensOpen(false)} />

      {/* Editar processo */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.4)] p-4 sm:p-8"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="my-4 w-full max-w-2xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                <SquarePen size={20} />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[#183263]">Edição de Processo</h3>
                <p className="text-xs text-[var(--color-muted)]">
                  Atualize os dados principais do processo com poucos cliques.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Nome do Processo
                <input
                  value={editForm.nome}
                  onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                  className="gt-input font-normal normal-case"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Número do Processo
                  <input
                    value={editForm.numero}
                    onChange={(e) => setEditForm((f) => ({ ...f, numero: e.target.value }))}
                    className="gt-input font-normal normal-case"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Lote Único
                  <Combo
                    value={editForm.loteUnico}
                    onChange={(v) => setEditForm((f) => ({ ...f, loteUnico: v as 'Sim' | 'Não' }))}
                    options={['Sim', 'Não']}
                    placeholder="Selecione"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Descrição do Processo
                <textarea
                  rows={4}
                  maxLength={500}
                  value={editForm.descricao}
                  onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="gt-input resize-y font-normal normal-case"
                />
              </label>
            </div>

            <button
              onClick={() => {
                atualizar(proc.id, {
                  nome: editForm.nome.trim(),
                  numero: editForm.numero.trim(),
                  loteUnico: editForm.loteUnico,
                  descricao: editForm.descricao,
                })
                setEditOpen(false)
                showToast('Processo atualizado.')
              }}
              className="mt-5 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Normativas do processo */}
      {normativasOpen && (
        <NormativasProcessoModal
          onClose={() => setNormativasOpen(false)}
          onSave={() => showToast('Normativas salvas com sucesso.')}
        />
      )}

      {/* Permissões */}
      {permOpen && (
        <PermissoesProcessoModal
          nomeProcesso={nome}
          onClose={() => setPermOpen(false)}
          onSave={() => showToast('Permissão salva.')}
        />
      )}

      {/* Confirmações simples */}
      {pdfConfirm && (
        <ConfirmDialog
          titulo="Gerar Documentos em PDF?"
          descricao="Um único PDF será gerado, com os artefatos na sequência do processo."
          confirmLabel="Gerar Documentos"
          onCancel={() => setPdfConfirm(false)}
          onConfirm={() => {
            setPdfConfirm(false)
            gerarDocumentosPdf()
            showToast('PDF gerado com sucesso.')
          }}
        />
      )}
      {finalizarConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4"
          onClick={() => setFinalizarConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c26b] text-[#d39a16]">
              <AlertTriangle size={26} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">
              Deseja finalizar este processo?
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Ao finalizar, este processo será <strong>definitivamente encerrado</strong> e as
              seguintes ações serão bloqueadas:
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-left text-sm text-[var(--color-muted)]">
              <li>Não será possível editar os itens do processo;</li>
              <li>Não será permitido realizar upload ou alteração de artefatos;</li>
            </ul>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Após a finalização, o processo ficará disponível apenas para{' '}
              <strong>visualização e download</strong>.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => {
                  setFinalizarConfirm(false)
                  finalizar(proc.id)
                  showToast('Processo finalizado.')
                }}
                className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-4 py-2 text-sm font-semibold text-white"
              >
                Sim, finalizar processo
              </button>
              <button
                onClick={() => setFinalizarConfirm(false)}
                className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] rounded-[var(--radius-control)] bg-[#183263] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-pop)]">
          {toast}
        </div>
      )}

      {/* Drawer de análise com IA */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[rgba(9,21,44,0.4)]" onClick={() => setChatOpen(false)} />
          <div className="relative flex w-full max-w-md flex-col bg-white shadow-[var(--shadow-pop)]">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#22b8a6_0%,#3b5bd0_60%,#7b3ff0_100%)] text-white">
                  <Sparkles size={15} />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-[#183263]">Analisar com IA</p>
                  <p className="text-[11px] text-[var(--color-muted)]">Processo N.º {numero}</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full text-[var(--color-muted)] hover:bg-[#f4f7fc]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#eef3fb] p-5">
              <AiBubble>Como posso ajudá-lo a analisar este processo hoje?</AiBubble>
            </div>

            <div className="border-t border-[var(--color-line)] p-4">
              <div className="rounded-[16px] border border-[var(--color-line)] bg-white p-3">
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  rows={3}
                  placeholder="Digite sua pergunta aqui..."
                  className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none"
                />
                <div className="flex justify-end">
                  <button
                    disabled={!value.trim()}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SendHorizontal size={16} />
                    Enviar Pergunta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ConfirmDialog({
  titulo,
  descricao,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  titulo: string
  descricao: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(9,21,44,0.4)] p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-base font-bold text-[#183263]">{titulo}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{descricao}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

