import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, FileText, HelpCircle, RotateCcw } from 'lucide-react'
import { OnlyOfficeEditorModal } from '../../components/common/OnlyOfficeEditorModal'
import { useRevisoes } from '../../store/revisoes'

export function RevisaoProcessoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const revisao = useRevisoes((s) => s.revisoes.find((v) => v.id === id))
  const concluir = useRevisoes((s) => s.concluir)

  const [confirmar, setConfirmar] = useState(false)
  const [enviada, setEnviada] = useState(false)

  if (!revisao) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="font-display text-lg font-bold text-[#183263]">Revisão não encontrada</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Esta revisão já foi concluída ou o link expirou.
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

  const revisado = revisao.status === 'Revisado'
  const docUrl = revisao.docUrl
    ? `http://host.docker.internal:5175${revisao.docUrl}`
    : undefined

  const painel = (
    <div className="flex h-full flex-col">
      <div className="bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] px-4 py-4 text-white">
        <p className="flex items-center gap-2 font-display text-sm font-extrabold leading-tight">
          <FileText size={18} /> {revisao.artefato}
        </p>
        <p className="mt-1 text-xs text-white/85">{revisao.processoNome}</p>
        <span className="mt-2 inline-block rounded-[var(--radius-pill)] bg-white/20 px-2 py-0.5 text-[11px] font-bold">
          #{revisao.numeroArtefato}
        </span>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Status Atual
          </p>
          <span
            className={`mt-1 inline-block rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-bold ${
              revisado
                ? 'bg-[#d7f5ea] text-[var(--color-success)]'
                : 'bg-[#fdf6e3] text-[#8a6d1a]'
            }`}
          >
            {revisao.status}
          </span>
        </section>

        <section>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Detalhes
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Enviado para revisão em<br />
            <span className="font-semibold text-[var(--color-ink)]">{revisao.enviadoEm}</span>
          </p>
          {revisado && revisao.revisadoEm && (
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Revisado em<br />
              <span className="font-semibold text-[var(--color-ink)]">{revisao.revisadoEm}</span>
            </p>
          )}
        </section>

        <section>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Destinatários por etapa
          </p>
          <div className="mt-2 rounded-[var(--radius-card)] border border-[var(--color-line)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#183263]">Revisão</span>
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
                {revisado ? 'Concluída' : 'Etapa ativa'}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Designados
            </p>
            <ul className="mt-1 space-y-1">
              {revisao.revisores.map((r) => (
                <li
                  key={r}
                  className="rounded-[var(--radius-control)] bg-[#f4f7fc] px-2 py-1.5 text-xs font-semibold text-[var(--color-ink)]"
                >
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="border-t border-[var(--color-line)] p-4">
        {revisado ? (
          <button
            onClick={() => navigate(`/Processo/${revisao.processoId}`)}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2.5 text-sm font-bold text-white"
          >
            Voltar para o Processo
          </button>
        ) : (
          <button
            onClick={() => setConfirmar(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f9d55_0%,#198754_100%)] py-2.5 text-sm font-bold text-white"
          >
            <RotateCcw size={15} /> Documento Revisado
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <OnlyOfficeEditorModal
        titulo={revisao.artefato}
        docUrl={docUrl}
        painel={painel}
        onClose={() => navigate('/processosinteligentes')}
      />

      {confirmar && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(9,21,44,0.5)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmar(false)
          }}
        >
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#bcd0ee] text-[var(--color-primary-strong)]">
              <HelpCircle size={26} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">
              Confirmar revisão do documento?
            </p>
            <div className="mt-3 space-y-1.5 text-left text-sm text-[var(--color-muted)]">
              <p>
                Ao <strong>enviar a revisão</strong>:
              </p>
              <p>• A revisão atual será <strong>salva e registrada</strong> no sistema.</p>
              <p>• Você <strong>perderá o acesso</strong> a este documento nesta etapa.</p>
              <p>
                • O artefato será <strong>reenviado ao responsável</strong> para validar os ajustes e
                dar <strong>continuidade ao processo</strong>.
              </p>
              <p className="pt-1 text-xs">Esta ação não pode ser desfeita nesta etapa.</p>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => setConfirmar(false)}
                className="rounded-[var(--radius-control)] bg-[#e6e9ef] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  concluir(revisao.id)
                  setConfirmar(false)
                  setEnviada(true)
                }}
                className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f9d55_0%,#198754_100%)] px-5 py-2 text-sm font-semibold text-white"
              >
                Enviar revisão
              </button>
            </div>
          </div>
        </div>
      )}

      {enviada && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(9,21,44,0.5)] p-4">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#bfe6cf] text-[var(--color-success)]">
              <CheckCircle2 size={28} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Revisão enviada!</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              O documento foi salvo e encaminhado ao responsável para validação dos ajustes e
              continuidade do processo.
            </p>
            <button
              onClick={() => navigate('/processosinteligentes')}
              className="mt-5 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#1f9d55_0%,#198754_100%)] px-6 py-2 text-sm font-semibold text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}
