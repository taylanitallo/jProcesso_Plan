import { AlertTriangle, Building2, Lock, Package, Send, X } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { usePca } from '../../store/pca'
import { useInstituicao, instituicaoConfigurada } from '../../store/instituicao'

const brl = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * Visão do administrador geral: consolida os PCAs de todas as Unidades
 * Orçamentárias que já estão "Pronto para Envio" e transmitiria todos ao PNCP
 * de uma vez. A transmissão real exige a credencial do administrador junto ao
 * PNCP — não disponível nesta versão, então o botão fica desabilitado.
 */
export function TransmitirPncpModal({ onClose }: { onClose: () => void }) {
  const pcas = usePca((s) => s.pcas)
  const instituicao = useInstituicao((s) => s.instituicao)
  const prontos = pcas.filter((p) => p.status === 'PRONTO_PARA_ENVIO')

  const totalItens = prontos.reduce((s, p) => s + p.itens.length, 0)
  const valorGeral = prontos.reduce(
    (s, p) => s + p.itens.reduce((si, i) => si + i.valorTotalEstimado, 0),
    0,
  )
  const unidades = new Set(prontos.map((p) => p.unidadeId || p.unidadeNome)).size

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-[1100px] rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#ede9fe] text-[#7c3aed]">
            <Send size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Transmitir PCAs ao PNCP</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Consolidação do administrador geral — todos os PCAs "Pronto para Envio" das Unidades
              Orçamentárias, transmitidos de uma vez só.
            </p>
            {instituicaoConfigurada(instituicao) && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary-strong)]">
                <Building2 size={12} /> {instituicao.nome} — CNPJ {instituicao.cnpj}
              </p>
            )}
          </div>
        </div>

        {prontos.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Package}
              title="Nenhum PCA pronto para envio"
              subtitle="Cada Unidade Orçamentária precisa marcar o seu PCA como 'Pronto para Envio' na listagem antes da transmissão consolidada."
            />
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Resumo icon={<Building2 size={14} />} rotulo="Unidades prontas" valor={String(unidades)} />
              <Resumo icon={<Package size={14} />} rotulo="Itens no total" valor={String(totalItens)} />
              <Resumo
                icon={<span className="text-[var(--color-success)]">$</span>}
                rotulo="Valor total geral"
                valor={brl(valorGeral)}
                destaque
              />
            </div>

            <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
              <table className="w-full text-sm">
                <thead className="bg-[#eef3fb] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  <tr>
                    <th className="px-3 py-2">Unidade Orçamentária</th>
                    <th className="px-3 py-2">PCA</th>
                    <th className="px-3 py-2 text-center">Ano</th>
                    <th className="px-3 py-2 text-center">Itens</th>
                    <th className="px-3 py-2 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {prontos.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--color-line)]">
                      <td className="px-3 py-2 font-semibold text-[var(--color-ink)]">{p.unidadeNome}</td>
                      <td className="px-3 py-2 text-[var(--color-muted)]">{p.nome}</td>
                      <td className="px-3 py-2 text-center">{p.anoPca}</td>
                      <td className="px-3 py-2 text-center">{p.itens.length}</td>
                      <td className="px-3 py-2 text-right">
                        {brl(p.itens.reduce((s, i) => s + i.valorTotalEstimado, 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs text-[#8a6d1a]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            A transmissão consolidada ao PNCP exige a credencial oficial do administrador geral do
            órgão junto ao Portal de Compras Públicas. A SollAI ainda não está integrada a essa
            credencial — os PCAs ficam salvos localmente até essa integração existir.
          </span>
        </div>

        <button
          disabled
          className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[#c9d6ea] bg-white py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--color-muted)] opacity-70"
        >
          <Lock size={15} /> Transmitir Todos ao PNCP
          {prontos.length > 0 ? ` (${prontos.length})` : ''}
        </button>
      </div>
    </div>
  )
}

function Resumo({
  icon,
  rotulo,
  valor,
  destaque,
}: {
  icon: React.ReactNode
  rotulo: string
  valor: string
  destaque?: boolean
}) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-4 py-3 text-center">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
        {icon} {rotulo}
      </p>
      <p
        className={`mt-0.5 text-lg font-extrabold ${
          destaque ? 'text-[var(--color-success)]' : 'text-[#183263]'
        }`}
      >
        {valor}
      </p>
    </div>
  )
}
