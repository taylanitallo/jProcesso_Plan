import { useEffect, useMemo, useState } from 'react'
import { Info, Plus, Search, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { useCatalogo } from '../../store/catalogo'
import { catalogoService, type CatalogoItemRef, type MaterialOuServico } from '../../services'

type Tipo = 'base' | 'grupo' | 'codigo'

export function ImportarCatMatModal({ onClose }: { onClose: () => void }) {
  const adicionar = useCatalogo((s) => s.adicionar)

  const [tipo, setTipo] = useState<Tipo>('base')
  const [origem, setOrigem] = useState<MaterialOuServico>('MATERIAL')
  const [grupo, setGrupo] = useState('')
  const [classe, setClasse] = useState('')
  const [pdm, setPdm] = useState('')
  const [busca, setBusca] = useState('')

  const [grupos, setGrupos] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [pdms, setPdms] = useState<string[]>([])
  const [resultado, setResultado] = useState<CatalogoItemRef[]>([])

  // carrega as opções de classificação do serviço conforme a seleção
  useEffect(() => {
    void catalogoService.consultarGrupos(origem).then(setGrupos)
  }, [origem])
  useEffect(() => {
    void catalogoService.consultarClasses(origem, grupo || undefined).then(setClasses)
  }, [origem, grupo])
  useEffect(() => {
    if (origem === 'MATERIAL') {
      void catalogoService.consultarPdms(grupo || undefined, classe || undefined).then(setPdms)
    } else {
      void catalogoService.consultarSubclasses(classe || undefined).then(setPdms)
    }
  }, [origem, grupo, classe])

  // busca os itens conforme o tipo de importação
  useEffect(() => {
    let cancelado = false
    const run = async () => {
      if (tipo === 'base') {
        const r = await catalogoService.consultarBaseInteira()
        if (!cancelado) setResultado(r)
        return
      }
      if (tipo === 'codigo') {
        const q = busca.trim()
        if (q.length < 4) {
          setResultado([])
          return
        }
        const [mat, serv] = await Promise.all([
          catalogoService.consultarItens({ materialOuServico: 'MATERIAL', texto: q }),
          catalogoService.consultarItens({ materialOuServico: 'SERVICO', texto: q }),
        ])
        if (!cancelado) setResultado([...mat, ...serv])
        return
      }
      const r = await catalogoService.consultarItens({
        materialOuServico: origem,
        grupo: grupo || undefined,
        classe: classe || undefined,
        pdm: origem === 'MATERIAL' ? pdm || undefined : undefined,
        subclasse: origem === 'SERVICO' ? pdm || undefined : undefined,
      })
      if (!cancelado) setResultado(r)
    }
    void run()
    return () => {
      cancelado = true
    }
  }, [tipo, origem, grupo, classe, pdm, busca])

  const selecionados = useMemo(() => resultado, [resultado])

  const importar = () => {
    selecionados.forEach((b) =>
      adicionar({
        nome: b.descricaoItem,
        especificacao: b.informacaoComplementar ?? '',
        unidade: b.unidadeFornecimento,
        tipo: b.materialOuServico === 'MATERIAL' ? 'Material' : 'Serviço',
        codigo: b.codigoItemCatalogo,
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
              {(['MATERIAL', 'SERVICO'] as const).map((o) => (
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
                  {o === 'MATERIAL' ? 'CatMat - Materiais' : 'CatSer - Serviços'}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-[var(--radius-card)] border border-[#bcd0ee] p-4">
              <p className="mb-3 font-display text-sm font-bold text-[#183263]">
                {origem === 'MATERIAL'
                  ? 'Filtros de Materiais (CatMat)'
                  : 'Filtros de Serviços (CatSer)'}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Rot label="Grupo">
                  <Combo value={grupo} onChange={setGrupo} options={grupos} placeholder="Selecione ou digite…" filterable />
                </Rot>
                <Rot label="Classe">
                  <Combo value={classe} onChange={setClasse} options={classes} placeholder="Selecione ou digite…" filterable />
                </Rot>
                <Rot label={origem === 'MATERIAL' ? 'PDM' : 'Subclasse'}>
                  <Combo
                    value={pdm}
                    onChange={setPdm}
                    options={pdms}
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
