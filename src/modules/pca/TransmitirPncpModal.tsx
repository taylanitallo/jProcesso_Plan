import { useState } from 'react'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  KeyRound,
  Package,
  Send,
  ShieldAlert,
  X,
} from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import { usePca, itensDoPca, valorPca, type PcaLocal } from '../../store/pca'
import { useInstituicao, instituicaoConfigurada } from '../../store/instituicao'
import { useOrganizacao } from '../../store/organizacao'
import {
  autenticarPncp,
  prepararEnvioPca,
  enviarPca,
  type AmbientePncp,
  type ItemParaEnvio,
  type ItemPreparado,
} from '../../services'

const brl = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** dd/mm/aaaa → aaaa-mm-dd (DTO do PNCP exige formato ISO de data). */
const brParaIso = (s: string) => {
  const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

type EstadoEnvio =
  | { fase: 'idle' }
  | { fase: 'preparando' }
  | { fase: 'bloqueado'; itens: ItemPreparado[] }
  | { fase: 'enviando' }
  | { fase: 'enviado'; numeroControlePNCP: string }
  | { fase: 'erro'; mensagem: string }

/**
 * Visão do administrador geral: consolida os PCAs de todas as Unidades
 * Orçamentárias que já estão "Pronto para Envio" e transmite cada um ao PNCP
 * de verdade — autenticação de plataforma (login/senha do PNCP, nunca
 * persistidos) + `POST /v1/orgaos/{cnpj}/pca`. Por padrão mira o ambiente de
 * Homologação (dados de teste); Produção fica atrás de confirmação explícita
 * porque publica um registro público real e irreversível.
 */
export function TransmitirPncpModal({ onClose }: { onClose: () => void }) {
  const pcas = usePca((s) => s.pcas)
  const registrarTransmissao = usePca((s) => s.registrarTransmissao)
  const instituicao = useInstituicao((s) => s.instituicao)
  const unidades = useOrganizacao((s) => s.unidades)
  const prontos = pcas.filter((p) => p.status === 'PRONTO_PARA_ENVIO')
  const transmitidos = pcas.filter((p) => p.status === 'TRANSMITIDO')

  const [ambiente, setAmbiente] = useState<AmbientePncp>('homologacao')
  const [confirmaProducao, setConfirmaProducao] = useState(false)
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [autenticando, setAutenticando] = useState(false)
  const [erroAuth, setErroAuth] = useState('')
  const [envios, setEnvios] = useState<Record<string, EstadoEnvio>>({})
  const [enviandoTodos, setEnviandoTodos] = useState(false)

  const totalItens = prontos.reduce((s, p) => s + itensDoPca(p).length, 0)
  const valorGeral = prontos.reduce((s, p) => s + valorPca(p), 0)
  const totalUnidades = new Set(prontos.map((p) => p.unidadeId || p.unidadeNome)).size

  const autenticar = async () => {
    setAutenticando(true)
    setErroAuth('')
    const r = await autenticarPncp({ ambiente, login, senha })
    if (r.ok) {
      setToken(r.token)
    } else {
      setToken(null)
      setErroAuth(r.erro)
    }
    setAutenticando(false)
  }

  const itensParaEnvio = (p: PcaLocal): ItemParaEnvio[] =>
    p.dfds.flatMap((d) =>
      d.itens.map((it) => ({
        numeroItem: it.numeroItem,
        materialOuServico: it.materialOuServico,
        categoriaItemId: it.categoriaItemId,
        codigoItemCatalogo: it.codigoItemCatalogo,
        descricao: it.descricao,
        unidadeFornecimento: it.unidadeFornecimento,
        quantidade: it.quantidadeEstimada,
        valorUnitario: it.valorUnitarioEstimado,
        valorTotal: it.valorTotalEstimado,
        dataDesejadaIso: brParaIso(d.dataDesejada),
      })),
    )

  const enviarUm = async (p: PcaLocal) => {
    if (!token) return
    const unidade = unidades.find((u) => u.id === p.unidadeId)
    if (!unidade?.codigo.trim()) {
      setEnvios((s) => ({
        ...s,
        [p.id]: {
          fase: 'erro',
          mensagem: `Unidade "${p.unidadeNome}" sem código PNCP cadastrado (Gerenciar Unidade/Setor).`,
        },
      }))
      return
    }
    setEnvios((s) => ({ ...s, [p.id]: { fase: 'preparando' } }))
    const preparo = await prepararEnvioPca({
      codigoUnidade: unidade.codigo.trim(),
      anoPca: p.anoPca,
      itens: itensParaEnvio(p),
    })
    if (!preparo.prontosParaEnvio || !preparo.payload) {
      setEnvios((s) => ({ ...s, [p.id]: { fase: 'bloqueado', itens: preparo.itens } }))
      return
    }
    setEnvios((s) => ({ ...s, [p.id]: { fase: 'enviando' } }))
    const r = await enviarPca({ ambiente }, token, p.cnpjOrgao, preparo.payload)
    if (r.ok) {
      registrarTransmissao(p.id, { numeroControlePNCP: r.numeroControlePNCP, ambiente })
      setEnvios((s) => ({ ...s, [p.id]: { fase: 'enviado', numeroControlePNCP: r.numeroControlePNCP } }))
    } else {
      const detalhe = r.detalhes?.map((d) => d.mensagem).join(' — ')
      setEnvios((s) => ({ ...s, [p.id]: { fase: 'erro', mensagem: detalhe ? `${r.erro} ${detalhe}` : r.erro } }))
    }
  }

  const enviarTodos = async () => {
    setEnviandoTodos(true)
    for (const p of prontos) {
      // eslint-disable-next-line no-await-in-loop -- transmissão sequencial de propósito, não em paralelo
      await enviarUm(p)
    }
    setEnviandoTodos(false)
  }

  const podeAutenticar = login.trim() && senha.trim() && !autenticando
  const bloqueadoProducao = ambiente === 'producao' && !confirmaProducao

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
              Orçamentárias, um `POST` real por PCA (cabeçalho + itens).
            </p>
            {instituicaoConfigurada(instituicao) && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary-strong)]">
                <Building2 size={12} /> {instituicao.nome} — CNPJ {instituicao.cnpj}
              </p>
            )}
          </div>
        </div>

        {/* --- Ambiente + credencial --- */}
        <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[#f9fafc] p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Ambiente</span>
              <div className="flex rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white p-1">
                {(['homologacao', 'producao'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setAmbiente(a)
                      setToken(null)
                      setConfirmaProducao(false)
                    }}
                    className={`rounded-[8px] px-3 py-1.5 text-xs font-semibold transition ${
                      ambiente === a
                        ? a === 'producao'
                          ? 'bg-[var(--color-danger)] text-white'
                          : 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-muted)]'
                    }`}
                  >
                    {a === 'homologacao' ? 'Homologação (teste)' : 'Produção (real)'}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Login PNCP
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="login da plataforma"
                className="gt-input font-normal normal-case disabled:cursor-not-allowed disabled:bg-[#f1f4f9] disabled:text-[var(--color-muted)]"
                disabled={Boolean(token)}
              />
            </label>
            <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Senha PNCP
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="senha da plataforma"
                className="gt-input font-normal normal-case disabled:cursor-not-allowed disabled:bg-[#f1f4f9] disabled:text-[var(--color-muted)]"
                disabled={Boolean(token)}
              />
            </label>
            {token ? (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[#eefaf3] px-3 py-2 text-xs font-bold text-[var(--color-success)]">
                <CheckCircle2 size={14} /> Autenticado
              </span>
            ) : (
              <button
                onClick={autenticar}
                disabled={!podeAutenticar || bloqueadoProducao}
                className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[#183263] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <KeyRound size={14} /> {autenticando ? 'Autenticando…' : 'Autenticar'}
              </button>
            )}
          </div>

          {ambiente === 'producao' && !token && (
            <label className="mt-3 flex items-start gap-2 text-xs text-[#8a1f2b]">
              <input
                type="checkbox"
                checked={confirmaProducao}
                onChange={(e) => setConfirmaProducao(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Entendo que o ambiente de Produção publica um registro público real e{' '}
                <strong>irreversível</strong> no PNCP, e exige credenciamento oficial da plataforma
                junto ao Ministério da Gestão.
              </span>
            </label>
          )}

          <p className="mt-2 flex items-start gap-1.5 text-[11px] text-[var(--color-muted)]">
            <ShieldAlert size={13} className="mt-0.5 shrink-0" />
            Login e senha não são salvos — ficam só nesta sessão do navegador, apagados ao fechar.
          </p>
          {erroAuth && (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-[var(--color-danger)]">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {erroAuth}
            </p>
          )}
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
              <Resumo icon={<Building2 size={14} />} rotulo="Unidades prontas" valor={String(totalUnidades)} />
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
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {prontos.map((p) => {
                    const estado = envios[p.id] ?? { fase: 'idle' as const }
                    return (
                      <tr key={p.id} className="border-t border-[var(--color-line)] align-top">
                        <td className="px-3 py-2 font-semibold text-[var(--color-ink)]">{p.unidadeNome}</td>
                        <td className="px-3 py-2 text-[var(--color-muted)]">{p.nome}</td>
                        <td className="px-3 py-2 text-center">{p.anoPca}</td>
                        <td className="px-3 py-2 text-center">{itensDoPca(p).length}</td>
                        <td className="px-3 py-2 text-right">{brl(valorPca(p))}</td>
                        <td className="px-3 py-2">
                          <EstadoCelula estado={estado} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => enviarUm(p)}
                            disabled={
                              !token ||
                              estado.fase === 'preparando' ||
                              estado.fase === 'enviando' ||
                              estado.fase === 'enviado' ||
                              enviandoTodos
                            }
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[#7c3aed] px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Send size={12} /> Enviar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {transmitidos.length > 0 && (
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            {transmitidos.length} PCA(s) já transmitido(s) nesta base — ver coluna Status na listagem.
          </p>
        )}

        <button
          onClick={enviarTodos}
          disabled={!token || prontos.length === 0 || enviandoTodos}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#7c3aed_0%,#5b21b6_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={15} /> {enviandoTodos ? 'Transmitindo…' : 'Transmitir Todos ao PNCP'}
          {prontos.length > 0 ? ` (${prontos.length})` : ''}
        </button>
      </div>
    </div>
  )
}

function EstadoCelula({ estado }: { estado: EstadoEnvio }) {
  switch (estado.fase) {
    case 'idle':
      return <span className="text-xs text-[var(--color-muted)]">—</span>
    case 'preparando':
      return <span className="text-xs font-semibold text-[var(--color-primary)]">Conferindo itens no CatMat/CatSer…</span>
    case 'enviando':
      return <span className="text-xs font-semibold text-[var(--color-primary)]">Enviando…</span>
    case 'enviado':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-success)]">
          <CheckCircle2 size={13} /> Transmitido
        </span>
      )
    case 'bloqueado':
      return (
        <div className="max-w-[280px] text-xs text-[var(--color-danger)]">
          <p className="font-bold">{estado.itens.filter((i) => !i.ok).length} item(ns) sem classificação real:</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
            {estado.itens
              .filter((i) => !i.ok)
              .slice(0, 3)
              .map((i) => (
                <li key={i.numeroItem}>
                  #{i.numeroItem} {i.descricao} — {i.erro}
                </li>
              ))}
          </ul>
        </div>
      )
    case 'erro':
      return <span className="text-xs font-semibold text-[var(--color-danger)]">{estado.mensagem}</span>
  }
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
