import { useMemo, useState } from 'react'
import { Info, Plus, Search, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { useCatalogo } from '../../store/catalogo'

/** Base fictícia CatMat/CatSer — sem serviço real, itens de exemplo. */
const BASE = [
  {
    origem: 'CatMat' as const,
    grupo: '75 - Instrumentos de escritório',
    classe: '7510 - Material de escritório',
    pdm: 'Papel',
    codigo: 'BR0279233',
    nome: 'Papel A4 75g branco - resma 500 folhas',
    especificacao: 'Papel sulfite branco, alcalino, formato A4 (210x297mm), gramatura 75g/m².',
    unidade: 'Resma (RES)',
    tipo: 'Material',
  },
  {
    origem: 'CatMat' as const,
    grupo: '71 - Móveis',
    classe: '7110 - Móveis de escritório',
    pdm: 'Cadeira',
    codigo: 'BR0341882',
    nome: 'Cadeira giratória ergonômica com braços',
    especificacao: 'Cadeira giratória com encosto em tela, regulagem de altura a gás e apoio lombar.',
    unidade: 'Unidade (Un)',
    tipo: 'Material',
  },
  {
    origem: 'CatMat' as const,
    grupo: '70 - Equipamentos de informática',
    classe: '7010 - Sistemas de computação',
    pdm: 'Notebook',
    codigo: 'BR0450127',
    nome: 'Notebook 15.6" Core i5, 16GB RAM, SSD 512GB',
    especificacao: 'Notebook com processador Intel Core i5 12ª geração, 16GB RAM, SSD NVMe 512GB, tela 15.6" Full HD.',
    unidade: 'Unidade (Un)',
    tipo: 'Material',
  },
  {
    origem: 'CatMat' as const,
    grupo: '60 - Fios, cabos e conectores',
    classe: '6145 - Fios e cabos elétricos',
    pdm: 'Cabo de rede',
    codigo: 'BR0388541',
    nome: 'Cabo de rede CAT6 U/UTP - metro',
    especificacao: 'Cabo par trançado CAT6, U/UTP, 4 pares, condutor de cobre 23AWG.',
    unidade: 'Metro (m)',
    tipo: 'Material',
  },
  {
    origem: 'CatSer' as const,
    secao: 'F - Construção',
    divisao: '43 - Serviços especializados de construção',
    grupo: '439 - Outros serviços especializados',
    classe: '4390 - Serviços de manutenção predial',
    subclasse: '4390-1 - Manutenção de climatização',
    codigo: 'BS0018842',
    nome: 'Serviço de manutenção preventiva de ar-condicionado split',
    especificacao: 'Manutenção preventiva e corretiva de aparelhos split, com limpeza, higienização e recarga de gás.',
    unidade: 'Serviço (SV)',
    tipo: 'Serviço',
  },
  {
    origem: 'CatSer' as const,
    secao: 'M - Atividades profissionais',
    divisao: '71 - Serviços de arquitetura e engenharia',
    grupo: '711 - Serviços de engenharia',
    classe: '7112 - Consultoria em engenharia',
    subclasse: '7112-1 - Consultoria técnica especializada',
    codigo: 'BS0027713',
    nome: 'Consultoria técnica especializada em obras públicas',
    especificacao: 'Assessoria técnica para elaboração e revisão de projetos, orçamentos e cronogramas de obras.',
    unidade: 'Hora (h)',
    tipo: 'Serviço',
  },
  {
    origem: 'CatSer' as const,
    secao: 'N - Atividades administrativas',
    divisao: '81 - Serviços para edifícios',
    grupo: '812 - Atividades de limpeza',
    classe: '8121 - Limpeza em prédios',
    subclasse: '8121-4 - Limpeza e conservação predial',
    codigo: 'BS0009120',
    nome: 'Serviço continuado de limpeza e conservação predial',
    especificacao: 'Prestação de serviço de limpeza, asseio e conservação, com fornecimento de mão de obra e insumos.',
    unidade: 'Posto de Trabalho (PT)',
    tipo: 'Serviço',
  },
]

type Tipo = 'base' | 'grupo' | 'codigo'

export function ImportarCatMatModal({ onClose }: { onClose: () => void }) {
  const adicionar = useCatalogo((s) => s.adicionar)

  const [tipo, setTipo] = useState<Tipo>('base')
  const [origem, setOrigem] = useState<'CatMat' | 'CatSer'>('CatMat')
  const [grupo, setGrupo] = useState('')
  const [classe, setClasse] = useState('')
  const [pdm, setPdm] = useState('')
  const [busca, setBusca] = useState('')

  const opcoes = (campo: 'grupo' | 'classe' | 'pdm' | 'secao' | 'divisao' | 'subclasse') =>
    [...new Set(BASE.filter((b) => b.origem === origem).map((b) => (b as unknown as Record<string, string>)[campo]).filter(Boolean))]

  const selecionados = useMemo(() => {
    if (tipo === 'base') return BASE
    if (tipo === 'codigo') {
      const q = busca.trim().toLowerCase()
      if (q.length < 4) return []
      return BASE.filter((b) => b.nome.toLowerCase().includes(q) || b.codigo.toLowerCase().includes(q))
    }
    // por grupo
    return BASE.filter((b) => {
      if (b.origem !== origem) return false
      const r = b as unknown as Record<string, string>
      if (grupo && r.grupo !== grupo) return false
      if (classe && r.classe !== classe) return false
      if (pdm && r.pdm !== pdm) return false
      return true
    })
  }, [tipo, origem, grupo, classe, pdm, busca])

  const importar = () => {
    selecionados.forEach((b) =>
      adicionar({
        nome: b.nome,
        especificacao: b.especificacao,
        unidade: b.unidade,
        tipo: b.tipo,
        codigo: b.codigo,
        origem: 'CATMAT/CATSER',
      }),
    )
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-2xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <Plus size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Importar do CatMat / CatSer</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Escolha o tipo e refine pelos níveis (grupo, classe, etc.) para importar os itens.
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          Tipo de importação
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(
            [
              ['base', 'Base inteira (CatMat + CatSer)'],
              ['grupo', 'Por grupo de material/serviço'],
              ['codigo', 'Código específico'],
            ] as [Tipo, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTipo(k)}
              className={`rounded-[var(--radius-control)] px-3 py-2.5 text-xs font-semibold transition ${
                tipo === k
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-line)] bg-white text-[var(--color-muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tipo === 'grupo' && (
          <>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
              Origem da importação
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(['CatMat', 'CatSer'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    setOrigem(o)
                    setGrupo('')
                    setClasse('')
                    setPdm('')
                  }}
                  className={`rounded-[var(--radius-control)] px-3 py-2.5 text-xs font-semibold transition ${
                    origem === o
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'border border-[var(--color-line)] bg-white text-[var(--color-muted)]'
                  }`}
                >
                  {o === 'CatMat' ? 'CatMat - Materiais' : 'CatSer - Serviços'}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-[var(--radius-card)] border border-[#bcd0ee] p-4">
              <p className="mb-3 font-display text-sm font-bold text-[#183263]">
                {origem === 'CatMat' ? 'Filtros de Materiais (CatMat)' : 'Filtros de Serviços (CatSer)'}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Rot label="Grupo">
                  <Combo value={grupo} onChange={setGrupo} options={opcoes('grupo')} placeholder="Selecione ou digite…" filterable />
                </Rot>
                <Rot label="Classe">
                  <Combo value={classe} onChange={setClasse} options={opcoes('classe')} placeholder="Selecione ou digite…" filterable />
                </Rot>
                <Rot label={origem === 'CatMat' ? 'PDM' : 'Subclasse'}>
                  <Combo
                    value={pdm}
                    onChange={setPdm}
                    options={origem === 'CatMat' ? opcoes('pdm') : opcoes('subclasse')}
                    placeholder="Selecione ou digite…"
                    filterable
                  />
                </Rot>
              </div>
            </div>
          </>
        )}

        {tipo === 'codigo' && (
          <Rot label="Buscar item/serviço (mín. 4 caracteres)" className="mt-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite ao menos 4 caracteres…"
                className="gt-input !pl-9 font-normal normal-case"
              />
            </div>
          </Rot>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] px-3 py-2 text-xs text-[var(--color-primary-strong)]">
          <Info size={14} className="shrink-0" />
          <span>
            <strong>Dica:</strong> importar por nível. Ex: selecionar só o grupo já importa todos os
            itens daquele grupo. {selecionados.length} item(ns) serão importados.
          </span>
        </div>

        <button
          onClick={importar}
          disabled={selecionados.length === 0}
          className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Importar Itens Selecionados
        </button>
      </div>
    </div>
  )
}

function Rot({
  label,
  className = '',
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] ${className}`}>
      {label}
      {children}
    </div>
  )
}
