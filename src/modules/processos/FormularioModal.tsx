import { useMemo, useState } from 'react'
import { FileSignature, Search, Sparkles, X } from 'lucide-react'
import { DfdManualFormulario } from './DfdManualFormulario'

type Secao = { titulo: string; perguntas: { n: number; texto: string; obrigatoria?: boolean }[] }

/** Formulário do DFD — seções e perguntas conforme o SollAI real. */
const DFD_SECOES: Secao[] = [
  {
    titulo: 'I - Justificativa da Necessidade da Contratação',
    perguntas: [
      { n: 1, texto: 'Qual a necessidade ou problema que será atendido com esta contratação?', obrigatoria: true },
      {
        n: 2,
        texto: 'Como essa necessidade está alinhada aos objetivos estratégicos do órgão ou entidade?',
        obrigatoria: true,
      },
    ],
  },
  {
    titulo: 'II - Descrição Sucinta do Objeto',
    perguntas: [{ n: 3, texto: 'Qual o objeto da contratação?', obrigatoria: true }],
  },
  {
    titulo: 'III - Quantidade a Ser Contratada',
    perguntas: [
      { n: 4, texto: 'Qual a quantidade estimada a ser contratada?', obrigatoria: true },
      { n: 5, texto: 'Qual foi o método utilizado para calcular a quantidade necessária?', obrigatoria: true },
    ],
  },
  {
    titulo: 'IV - Estimativa Preliminar do Valor',
    perguntas: [
      { n: 6, texto: 'Qual a estimativa preliminar do valor da contratação?', obrigatoria: true },
      { n: 7, texto: 'Quais fontes foram consultadas para estimar o valor?', obrigatoria: true },
    ],
  },
  {
    titulo: 'V - Data Pretendida para Conclusão',
    perguntas: [
      { n: 8, texto: 'Qual é a data pretendida para a conclusão da contratação?', obrigatoria: true },
      { n: 9, texto: 'Existe urgência na contratação?', obrigatoria: true },
    ],
  },
  {
    titulo: 'VI - Grau de Prioridade',
    perguntas: [
      { n: 10, texto: 'Qual o grau de prioridade desta contratação', obrigatoria: true },
      { n: 11, texto: 'Justifique o grau de prioridade atribuído.', obrigatoria: true },
    ],
  },
  {
    titulo: 'VII - Vinculação ou Dependência',
    perguntas: [
      {
        n: 12,
        texto: 'Esta contratação está vinculada ou depende de outro DFD para sua execução?',
        obrigatoria: true,
      },
      { n: 13, texto: 'Qual a sequência necessária para a execução das contratações vinculadas?', obrigatoria: true },
    ],
  },
  {
    titulo: 'VIII - Área Requisitante',
    perguntas: [
      { n: 14, texto: 'Qual é a área requisitante ou técnica responsável por esta solicitação?', obrigatoria: true },
      { n: 15, texto: 'Quem é o responsável técnico pela demanda?', obrigatoria: true },
    ],
  },
  {
    titulo:
      'IX - Demonstrativo dos resultados pretendidos, em termos de economicidade e de melhor aproveitamento dos recursos humanos, materiais e financeiros disponíveis;',
    perguntas: [
      { n: 16, texto: 'Quais resultados o órgão espera alcançar com essa contratação?' },
      {
        n: 17,
        texto: 'Como a contratação resolverá o problema ou atenderá à necessidade identificada no tópico I?',
      },
    ],
  },
]

export function FormularioModal({
  artefato,
  processoId,
  onClose,
  onSalvar,
}: {
  artefato: string | null
  processoId: string
  onClose: () => void
  onSalvar?: () => void
}) {
  const [step, setStep] = useState(0)
  const secoes = useMemo(() => DFD_SECOES, [])

  if (!artefato) return null

  const ehDfd = /DFD/i.test(artefato)
  const secao = secoes[step]
  const last = step === secoes.length - 1

  if (ehDfd) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
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

          <div className="mb-4 flex items-start gap-3 pr-8">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
              <FileSignature size={22} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">
                DFD — Documento de Formalização da Demanda
              </h3>
              <p className="text-xs text-[var(--color-muted)]">
                Preencha os dados da demanda — Secretaria, Setor, responsáveis, objeto e itens.
              </p>
            </div>
          </div>

          <DfdManualFormulario
            chave={`${processoId}::${artefato}`}
            onClose={onClose}
            onSalvar={onSalvar}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
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

        <h3 className="font-display text-base font-bold text-[#183263] sm:text-lg">Formulário</h3>
        <p className="mt-0.5 text-sm font-semibold text-[var(--color-primary-strong)]">{artefato}</p>
        <p className="text-xs text-[var(--color-muted)]">
          Preencha os dados do formulário para melhorar minha precisão ao elaborar seu documento.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-strong)]">
            <Search size={13} /> Buscar no PNCP
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-strong)]">
            <Sparkles size={13} /> Preencher com IA
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {secoes.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition ${
                i === step
                  ? 'bg-[var(--color-primary)] text-white'
                  : i < step
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                    : 'border border-[var(--color-line)] text-[var(--color-muted)]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-display text-sm font-bold text-[#183263]">{secao.titulo}</h4>
          <div className="mt-3 flex flex-col gap-4">
            {secao.perguntas.map((p) => (
              <label key={p.n} className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
                <span>
                  {p.n} - {p.texto}{' '}
                  {p.obrigatoria && <span className="text-[var(--color-danger)]">*</span>}
                </span>
                <textarea rows={3} className="gt-input resize-y font-normal normal-case" />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-40"
          >
            Anterior
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSalvar?.()
                onClose()
              }}
              className="rounded-[var(--radius-control)] border border-[#bcd0ee] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary-strong)]"
            >
              Salvar Formulário
            </button>
            {!last && (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold text-white"
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
