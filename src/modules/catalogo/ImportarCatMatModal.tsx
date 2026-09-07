import { useEffect, useState } from 'react'
import { Info, Plus, Search, X } from 'lucide-react'
import { Combo } from '../../components/common/Combo'
import { useCatalogo } from '../../store/catalogo'
import {
  catalogoService,
  type CatalogoItemRef,
  type MaterialOuServico,
  type NivelOpcao,
} from '../../services'

type Tipo = 'base' | 'grupo' | 'codigo'

const ROTULOS: Record<MaterialOuServico, [string, string, string]> = {
  MATERIAL: ['Grupo', 'Classe', 'PDM'],
  SERVICO: ['Seção', 'Divisão', 'Grupo'],
}

export function ImportarCatMatModal({ onClose }: { onClose: () => void }) {
  const adicionar = useCatalogo((s) => s.adicionar)

  const [tipo, setTipo] = useState<Tipo>('base')
  const [origem, setOrigem] = useState<MaterialOuServico>('MATERIAL')
  const [nivel1, setNivel1] = useState<NivelOpcao | null>(null)
  const [nivel2, setNivel2] = useState<NivelOpcao | null>(null)
  const [nivel3, setNivel3] = useState<NivelOpcao | null>(null)
  const [busca, setBusca] = useState('')

  const [opcoes1, setOpcoes1] = useState<NivelOpcao[]>([])
  const [opcoes2, setOpcoes2] = useState<NivelOpcao[]>([])
  const [opcoes3, setOpcoes3] = useState<NivelOpcao[]>([])
  const [resultado, setResultado] = useState<CatalogoItemRef[]>([])
  const [totalApi, setTotalApi] = useState(0)
  const [carregando, setCarregando] = useState(false)

  const [rot1, rot2, rot3] = ROTULOS[origem]

  useEffect(() => {
    void catalogoService.consultarNivel1(origem).then(setOpcoes1)
  }, [origem])
  useEffect(() => {
    if (!nivel1) {
      setOpcoes2([])
      return
    }
    void catalogoService.consultarNivel2(origem, nivel1.codigo).then(setOpcoes2)
  }, [origem, nivel1])
  useEffect(() => {
    if (!nivel1 || !nivel2) {
      setOpcoes3([])
      return
    }
    void catalogoService.consultarNivel3(origem, nivel1.codigo, nivel2.codigo).then(setOpcoes3)
  }, [origem, nivel1, nivel2])

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    const run = async () => {
      if (tipo === 'base') {
        const r = await catalogoService.consultarBaseInteira()
        if (!cancelado) {
          setResultado(r)
          setTotalApi(0)
        }
        return
      }
      if (tipo === 'codigo') {
        const q = busca.trim()
        if (q.length < 3) {
          if (!cancelado) setResultado([])
          return
        }
        const r = await catalogoService.consultarPorCodigo(q)
        if (!cancelado) {
          setResultado(r)
          setTotalApi(0)
        }
        return
      }
      // exige ao menos o 1º nível — sem filtro a API devolve a base inteira (300k+ itens)
      if (!nivel1) {
        if (!cancelado) {
          setResultado([])
          setTotalApi(0)
        }
        return
      }
      const filtro =
        origem === 'MATERIAL'
          ? {
              materialOuServico: 'MATERIAL' as const,
              codigoGrupo: nivel1.codigo,
              codigoClasse: nivel2?.codigo,
              codigoPdm: nivel3?.codigo,
            }
          : {
              materialOuServico: 'SERVICO' as const,
              codigoSecao: nivel1.codigo,
              codigoDivisao: nivel2?.codigo,
              codigoGrupo: nivel3?.codigo,
            }
      const r = await catalogoService.consultarItens(filtro)
      if (!cancelado) {
        setResultado(r.itens)
        setTotalApi(r.total)
      }
    }
    void run().finally(() => !cancelado && setCarregando(false))
    return () => {
      cancelado = true
    }
  }, [tipo, origem, nivel1, nivel2, nivel3, busca])

  const importar = () => {
    resultado.forEach((b) =>
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
              Fonte: dados abertos compras.gov.br.
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
                    setNivel1(null)
                    setNivel2(null)
                    setNivel3(null)
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
                <Rot label={rot1}>
                  <Combo
                    value={nivel1?.nome ?? ''}
                    onChange={(nome) => {
                      const opt = opcoes1.find((o) => o.nome === nome) ?? null
                      setNivel1(opt)
                      setNivel2(null)
                      setNivel3(null)
                    }}
                    options={opcoes1.map((o) => o.nome)}
                    placeholder="Selecione…"
                    filterable
                  />
                </Rot>
                <Rot label={rot2}>
                  <Combo
                    value={nivel2?.nome ?? ''}
                    onChange={(nome) => {
                      setNivel2(opcoes2.find((o) => o.nome === nome) ?? null)
                      setNivel3(null)
                    }}
                    options={opcoes2.map((o) => o.nome)}
                    placeholder={nivel1 ? 'Selecione…' : 'Selecione o nível anterior'}
                    disabled={!nivel1}
                    filterable
                  />
                </Rot>
                <Rot label={rot3}>
                  <Combo
                    value={nivel3?.nome ?? ''}
                    onChange={(nome) => setNivel3(opcoes3.find((o) => o.nome === nome) ?? null)}
                    options={opcoes3.map((o) => o.nome)}
                    placeholder={nivel2 ? 'Selecione…' : 'Selecione o nível anterior'}
                    disabled={!nivel2}
                    filterable
                  />
                </Rot>
              </div>
            </div>
          </>
        )}

        {tipo === 'codigo' && (
          <Rot label="Buscar por código (CatMat/CatSer, mín. 3 dígitos)" className="mt-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o código do item…"
                className="gt-input !pl-9 font-normal normal-case"
              />
            </div>
          </Rot>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] px-3 py-2 text-xs text-[var(--color-primary-strong)]">
          <Info size={14} className="shrink-0" />
          <span>
            {carregando
              ? 'Consultando dados abertos compras.gov.br…'
              : tipo === 'base'
                ? `Amostra de exemplo — a base completa tem centenas de milhares de itens; use Grupo/Classe/PDM ou Código para importar um recorte real. ${resultado.length} item(ns) serão importados.`
                : tipo === 'grupo' && !nivel1
                  ? `Selecione ao menos o ${rot1.toLowerCase()} para carregar os itens.`
                  : totalApi > resultado.length
                    ? `${resultado.length} de ${totalApi} item(ns) encontrados no filtro — refine mais para um recorte menor. ${resultado.length} item(ns) serão importados.`
                    : `${resultado.length} item(ns) serão importados.`}
          </span>
        </div>

        <button
          onClick={importar}
          disabled={resultado.length === 0 || carregando}
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
