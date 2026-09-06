import { useState } from 'react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckCircle2,
  FileText,
  Italic,
  List,
  ListOrdered,
  MessageSquare,
  Redo2,
  Save,
  Search,
  Strikethrough,
  Underline,
  Undo2,
  Upload,
  X,
} from 'lucide-react'

const RIBBON = [
  'Imagem',
  'Mesa',
  'Ligação',
  'Marca páginas',
  'Índice',
  'Cabeçalho',
  'Rodapé',
  'Configurações da página',
  'Número de página',
  'Pausa',
  'Inserir nota de rodapé',
  'Inserir nota final',
  'Encontrar',
  'Comentários',
  'Alterações percebidas',
]

const PARAGRAFOS = [
  'Ao Agente de Contratação da Secretaria da Administração - Sead',
  'Prefeitura Municipal de Morada Nova/CE',
  'Ref.: Aviso de Dispensa Eletrônica nº DE-0408.01.2026 – Processo Administrativo nº 00015.20260610/0001-42',
  'Pelo presente instrumento, a empresa JEOS SISTEMAS E ASSESSORIAS LTDA, CNPJ nº 63.586.274/0001-24, com sede na Rua 21 de Junho, 636, Centro, Irauçuba/CE, através de seu representante legal infra-assinado, declara que:',
  '1) Declaramos, para os fins do disposto no art. 68, inciso VI, e no art. 63, §1º, inciso IV, da Lei nº 14.133/2021, que não emprega menor de 18 (dezoito) anos em trabalho noturno, perigoso ou insalubre e não emprega menor de 16 (dezesseis) anos, salvo menor, a partir de 14 (quatorze) anos, na condição de aprendiz.',
  '2) Declaramos, sob as penas da lei, que inexistem fatos impeditivos para a habilitação da empresa na presente Dispensa Eletrônica, ciente da obrigatoriedade de declarar ocorrências posteriores.',
  '3) Declaramos que cumprimos os requisitos estabelecidos no art. 3º da Lei Complementar nº 123/2006, estando aptos a usufruir do tratamento favorecido estabelecido em seus arts. 42 a 49.',
]

export function ControleArtefatoModal({
  artefato,
  onClose,
}: {
  artefato: string | null
  onClose: () => void
}) {
  const [alteracoes, setAlteracoes] = useState(false)

  if (!artefato) return null

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-[#f1f3f7]">
      {/* Ribbon */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-muted)]">
        <ToolBtn icon={Undo2} label="Desfazer" />
        <ToolBtn icon={Redo2} label="Refazer" />
        <span className="mx-1 h-8 w-px bg-[var(--color-line)]" />
        {RIBBON.map((r) => (
          <button
            key={r}
            onClick={r === 'Alterações percebidas' ? () => setAlteracoes((v) => !v) : undefined}
            className={`shrink-0 rounded px-2 py-1 text-[11px] font-medium hover:bg-[#f4f7fc] ${
              r === 'Alterações percebidas' && alteracoes ? 'bg-[var(--color-primary-soft)]' : ''
            }`}
          >
            {r === 'Comentários' ? (
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={12} /> {r}
              </span>
            ) : r === 'Encontrar' ? (
              <span className="inline-flex items-center gap-1">
                <Search size={12} /> {r}
              </span>
            ) : (
              r
            )}
          </button>
        ))}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-[#f4f7fc]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Documento */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[780px] rounded-[4px] bg-white p-14 text-[13px] leading-relaxed text-[var(--color-ink)] shadow-[var(--shadow-card)]">
            <p className="mb-6 text-center font-bold">DECLARAÇÕES</p>
            {PARAGRAFOS.map((p, i) => (
              <p key={i} className="mb-3">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Painel de formatação */}
        <aside className="hidden w-56 shrink-0 flex-col gap-3 border-l border-[var(--color-line)] bg-white p-3 sm:flex">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">Texto</p>
          <div className="flex gap-1">
            <select className="h-7 flex-1 rounded border border-[var(--color-line)] px-1 text-xs">
              <option>Calibri</option>
            </select>
            <select className="h-7 w-12 rounded border border-[var(--color-line)] px-1 text-xs">
              <option>11</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1 text-[var(--color-muted)]">
            <FmtBtn icon={Bold} />
            <FmtBtn icon={Italic} />
            <FmtBtn icon={Underline} />
            <FmtBtn icon={Strikethrough} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
            Parágrafo
          </p>
          <select className="h-7 rounded border border-[var(--color-line)] px-1 text-xs">
            <option>Normal</option>
          </select>
          <div className="flex flex-wrap gap-1 text-[var(--color-muted)]">
            <FmtBtn icon={AlignLeft} />
            <FmtBtn icon={AlignCenter} />
            <FmtBtn icon={AlignRight} />
            <FmtBtn icon={AlignJustify} />
            <FmtBtn icon={List} />
            <FmtBtn icon={ListOrdered} />
          </div>
        </aside>

        {/* Painel de status / ações */}
        <aside className="flex w-72 shrink-0 flex-col gap-4 border-l border-[var(--color-line)] bg-white p-4">
          <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(135deg,#22b8a6_0%,#1f8fbf_100%)] px-3 py-4 text-white">
            <FileText size={22} />
            <div>
              <p className="font-display text-sm font-extrabold leading-tight">{artefato}</p>
              <p className="text-[11px] text-white/80">OBRA 33</p>
              <span className="mt-1 inline-block rounded-[var(--radius-pill)] bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                #teste
              </span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Status Atual
            </p>
            <span className="mt-1 inline-block rounded-[var(--radius-pill)] bg-[linear-gradient(90deg,#22b8a6_0%,#1f6fd0_100%)] px-4 py-1 text-xs font-bold text-white">
              Enviado
            </span>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Detalhes
            </p>
            <p className="mt-1 text-[11px] text-[var(--color-muted)]">Atualizado em</p>
            <p className="text-sm font-semibold text-[var(--color-ink)]">04/09/2026, 01:11:10</p>
          </div>

          <div className="mt-auto space-y-2">
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-semibold text-white"
            >
              <Save size={15} /> Salvar alterações
            </button>
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-success)] py-2.5 text-sm font-semibold text-white"
            >
              <Upload size={15} /> Finalizar
            </button>
          </div>
        </aside>

        {/* Painel Alterações (controle de mudanças) */}
        {alteracoes && (
          <aside className="w-72 shrink-0 border-l border-[var(--color-line)] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Alterar
              </p>
              <button onClick={() => setAlteracoes(false)} aria-label="Fechar">
                <X size={14} className="text-[var(--color-muted)]" />
              </button>
            </div>
            {['JJ', 'NNN'].map((t, i) => (
              <div key={t} className="mb-2 rounded-[var(--radius-control)] border border-[var(--color-line)] p-2">
                <p className="text-[11px] font-semibold text-[var(--color-ink)]">
                  ALEF MATHEUS TEIXEIRA DE SOUSA ·{' '}
                  <span className="text-[var(--color-muted)]">Responsável</span>
                </p>
                <p className="text-[10px] text-[var(--color-muted)]">4 de setembro de 2026 01:11</p>
                <p className="my-1 text-sm">{t}</p>
                <div className="flex gap-2">
                  <button className="rounded bg-[var(--color-success)] px-2 py-1 text-[11px] font-semibold text-white">
                    Aceitar
                  </button>
                  <button className="rounded border border-[#f0c2c8] px-2 py-1 text-[11px] font-semibold text-[var(--color-danger)]">
                    Rejeitar
                  </button>
                  <span className="ml-auto text-[10px] text-[var(--color-muted)]">
                    Alterar {i + 1} de 2
                  </span>
                </div>
              </div>
            ))}
          </aside>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-line)] bg-white px-4 py-1.5 text-[11px] text-[var(--color-muted)]">
        <span>Página 1 de 1</span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 size={12} className="text-[var(--color-success)]" /> 100%
        </span>
      </div>
    </div>
  )
}

function ToolBtn({ icon: Icon, label }: { icon: typeof Bold; label: string }) {
  return (
    <button className="flex shrink-0 flex-col items-center rounded px-2 py-1 text-[10px] hover:bg-[#f4f7fc]">
      <Icon size={14} />
      {label}
    </button>
  )
}

function FmtBtn({ icon: Icon }: { icon: typeof Bold }) {
  return (
    <button className="grid h-7 w-7 place-items-center rounded border border-[var(--color-line)] hover:bg-[#f4f7fc]">
      <Icon size={13} />
    </button>
  )
}
