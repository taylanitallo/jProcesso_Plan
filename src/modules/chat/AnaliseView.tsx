import { useState } from 'react'
import { ChevronLeft, Download, FileText, Trash2 } from 'lucide-react'
import { AiBubble } from './ChatShell'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { useAnalises, type Analise } from '../../store/analises'

/** Exibe um relatório salvo (Análise / Research) em modo leitura. */
export function AnaliseView({ analise, onBack }: { analise: Analise; onBack: () => void }) {
  const remover = useAnalises((s) => s.remover)
  const [excluirOpen, setExcluirOpen] = useState(false)

  const baixar = () => {
    const blob = new Blob([analise.corpo], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${analise.titulo.replace(/[^\wÀ-ſ-]+/g, '_')}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
        >
          <ChevronLeft size={15} /> Voltar
        </button>
        <button
          onClick={() => setExcluirOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[#f0c2c8] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)]"
        >
          <Trash2 size={13} /> Excluir
        </button>
      </div>

      <AiBubble>
        <p className="font-bold text-[#183263]">{analise.titulo}</p>
        <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">{analise.criadoEm}</p>
        <pre className="mt-3 max-h-[52vh] overflow-y-auto whitespace-pre-wrap rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-3 text-[12px] leading-relaxed text-[var(--color-ink)]">
          {analise.corpo}
        </pre>
        <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3 py-2">
          <FileText size={18} className="text-[var(--color-primary-strong)]" />
          <span className="line-clamp-1 text-[13px] font-semibold text-[var(--color-ink)]">
            {analise.titulo}.md
          </span>
          <button
            onClick={baixar}
            className="ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Download size={13} /> Baixar
          </button>
        </div>
      </AiBubble>

      <ConfirmDialog
        open={excluirOpen}
        title="Excluir relatório?"
        message={
          <>
            <strong>{analise.titulo}</strong> será removido. Esta ação não pode ser desfeita.
          </>
        }
        onCancel={() => setExcluirOpen(false)}
        onConfirm={() => {
          remover(analise.id)
          setExcluirOpen(false)
          onBack()
        }}
      />
    </div>
  )
}
