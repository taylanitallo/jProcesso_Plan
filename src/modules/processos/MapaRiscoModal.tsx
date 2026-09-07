import { useState } from 'react'
import { ChevronDown, Plus, Search, Sparkles, Waypoints, X, XCircle } from 'lucide-react'

const TABS = ['Diretrizes de Risco', 'Registro de Risco', 'Planos de Ação', 'Mapa de Risco'] as const
type Tab = (typeof TABS)[number]

const ETAPA1 = [
  { item: 'ID dos Riscos', desc: 'Número de identificação do risco', ref: '' },
  {
    item: 'Risco',
    desc: 'Evento que existe a probabilidade de acontecer e gerar determinado impacto que cause prejuízos às atividades e objetivos da Empresa',
    ref: 'Perda dos dados da Empresa',
  },
  {
    item: 'Causas do Risco',
    desc: 'Causas que podem provocar o risco',
    ref: 'Servidor de dados antigo, sem a realização de backups',
  },
  {
    item: 'Consequência',
    desc: 'Descrição dos principais impactos ocasionados caso haja a materialização do risco. Serve de suporte para entender a graduação do impacto indicada pela equipe.',
    ref: 'Não conclusão de eventos, impossibilidade de prestação de contas da Empresa, não recuperação de dados históricos das atividades de suporte e administrativas da Empresa',
  },
  {
    item: 'Resposta ao Risco',
    desc: 'Refere-se à resposta da Empresa para cada risco identificado.',
    ref: 'As respostas aos riscos podem ser: a) Aceitar; b) Mitigar; c) Transferir; d) Evitar.',
  },
]

const ETAPAS = [
  'Etapa 1 - Identificação dos Riscos',
  'Etapa 2 - Avaliação do Risco',
  'Etapa 3 - Resposta ao Risco',
  'Etapa 4 - Planos de Ação',
]

export function MapaRiscoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('Diretrizes de Risco')
  const [etapa, setEtapa] = useState(0)
  const [erroIA, setErroIA] = useState(false)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
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

        <div className="mb-4 flex items-center justify-between gap-3 pr-8">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-[color:var(--color-primary)] sm:text-lg">
            <Waypoints size={19} className="text-[var(--color-primary-strong)]" /> Mapa de Risco
          </h3>
          <button
            onClick={() => setErroIA(true)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Sparkles size={13} /> Verificar riscos com IA
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 rounded-[var(--radius-card)] bg-[#f2f5fa] p-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold transition ${
                t === tab
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Diretrizes de Risco' && (
          <div className="space-y-2">
            {ETAPAS.map((nome, i) => (
              <div
                key={nome}
                className="overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-line)]"
              >
                <button
                  onClick={() => setEtapa(etapa === i ? -1 : i)}
                  className="flex w-full items-center justify-between bg-[linear-gradient(90deg,#dbe7fb_0%,#e4f4ec_100%)] px-4 py-3 text-left text-sm font-bold text-[var(--color-primary-strong)]"
                >
                  {nome}
                  <ChevronDown
                    size={16}
                    className={`transition ${etapa === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {etapa === i && i === 0 && (
                  <div className="overflow-x-auto p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#eef3fb] text-left text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                          <th className="w-40 px-4 py-2">Item da Coluna</th>
                          <th className="px-4 py-2">Descrição</th>
                          <th className="px-4 py-2">Referência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ETAPA1.map((r) => (
                          <tr key={r.item} className="border-t border-[var(--color-line)] align-top">
                            <td className="px-4 py-3 text-center font-semibold text-[var(--color-ink)]">
                              {r.item}
                            </td>
                            <td className="px-4 py-3 text-[var(--color-muted)]">{r.desc}</td>
                            <td className="px-4 py-3 text-[var(--color-muted)]">{r.ref}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {etapa === i && i > 0 && (
                  <p className="p-4 text-sm text-[var(--color-muted)]">
                    Diretrizes desta etapa aplicadas automaticamente ao registrar os riscos.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'Registro de Risco' && (
          <RegistroTab titulo="Novo Risco" vazio="Nenhum risco registrado." />
        )}
        {tab === 'Planos de Ação' && (
          <RegistroTab titulo="Novo Plano de Ação" vazio="Nenhum plano de ação registrado." />
        )}

        {tab === 'Mapa de Risco' && (
          <div className="rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] p-5 text-center text-sm text-[#8a6d1a]">
            <p className="font-bold">Nenhum risco cadastrado.</p>
            <p className="mt-1">
              Para gerar um mapa de risco, é necessário cadastrar ao menos um risco relacionado ao
              processo atual.
            </p>
          </div>
        )}
      </div>

      {erroIA && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setErroIA(false)}
        >
          <div className="absolute inset-0 bg-[rgba(9,21,44,0.35)]" />
          <div
            className="relative w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
          >
            <XCircle size={44} className="mx-auto text-[var(--color-danger)]" strokeWidth={1.5} />
            <p className="mt-3 font-display text-lg font-bold text-[#183263]">Oops...</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Para realizar a geração por IA, é necessário o upload dos documentos DFD e ETP nos
              artefatos do processo.
            </p>
            <button
              onClick={() => setErroIA(false)}
              className="mt-4 rounded-[var(--radius-control)] bg-[#7c6ff0] px-6 py-2 text-sm font-semibold text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RegistroTab({ titulo, vazio }: { titulo: string; vazio: string }) {
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-success)] px-3 py-1.5 text-xs font-semibold text-white">
          <Plus size={13} /> {titulo}
        </button>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[linear-gradient(90deg,#dbe7fb_0%,#e4f4ec_100%)] text-left text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-4 py-3 text-center">Código</th>
              <th className="px-4 py-3 text-center">Título</th>
              <th className="px-4 py-3 text-center">Descrição</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                <Search size={22} className="mx-auto mb-2 text-[var(--color-muted)]" />
                {vazio}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
