import { useState } from 'react'
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react'
import { useNecessidades } from '../../store/necessidades'

type Campo =
  | 'nome'
  | 'descricao'
  | 'codigo'
  | 'tipo'
  | 'origem'
  | 'referencia'
  | 'quantidade'
  | 'unidade'

const CAMPOS: { key: Campo; label: string; obrigatorio: boolean }[] = [
  { key: 'nome', label: 'Nome do Item', obrigatorio: true },
  { key: 'descricao', label: 'Descrição do Item', obrigatorio: false },
  { key: 'codigo', label: 'Código do Item', obrigatorio: true },
  { key: 'tipo', label: 'Tipo do Item', obrigatorio: true },
  { key: 'origem', label: 'Origem do Item', obrigatorio: true },
  { key: 'referencia', label: 'Código de Referência', obrigatorio: false },
  { key: 'quantidade', label: 'Quantidade', obrigatorio: false },
  { key: 'unidade', label: 'Unidade de Medida', obrigatorio: true },
]

const MODELO_CSV =
  'Nome do Item;Descrição do Item;Código do Item;Tipo do Item;Origem do Item;Unidade de Medida;Quantidade\r\n' +
  'Cimento CP-II 50kg;Saco de cimento Portland composto;CIM-001;Material;INTERNO;Saco (SC);100\r\n'

function parseCsv(texto: string) {
  const brutas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const split = (l: string) => l.split(/[;,]/).map((c) => c.replace(/^"|"$/g, '').trim())
  return { headers: split(brutas[0] || ''), linhas: brutas.slice(1).map(split) }
}

export function ImportarExcelRegistroModal({ onClose }: { onClose: () => void }) {
  const adicionar = useNecessidades((s) => s.adicionar)

  const [etapa, setEtapa] = useState<1 | 2>(1)
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [linhas, setLinhas] = useState<string[][]>([])
  const [erro, setErro] = useState('')
  const [mapa, setMapa] = useState<Partial<Record<Campo, string>>>({})

  const baixarModelo = () => {
    const blob = new Blob(['﻿' + MODELO_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo-registro-necessidade.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const receber = async (file: File) => {
    setErro('')
    try {
      const { headers: h, linhas: l } = parseCsv(await file.text())
      if (h.length === 0 || l.length === 0) {
        setErro('Planilha vazia ou sem itens após o cabeçalho.')
        return
      }
      const auto = (...t: string[]) => h.find((c) => t.some((x) => c.toLowerCase().includes(x))) ?? ''
      setNomeArquivo(file.name)
      setHeaders(h)
      setLinhas(l)
      setMapa({
        nome: auto('nome'),
        descricao: auto('descri'),
        codigo: auto('código do', 'codigo do', 'código', 'codigo'),
        tipo: auto('tipo'),
        origem: auto('origem'),
        quantidade: auto('quant', 'qtd'),
        unidade: auto('unidade'),
      })
      setEtapa(2)
    } catch {
      setErro('Não foi possível ler o arquivo. Envie um .csv.')
    }
  }

  const ok = CAMPOS.filter((c) => c.obrigatorio).every((c) => mapa[c.key])

  const confirmar = () => {
    if (!ok) return
    adicionar({
      nome: `Importação (${nomeArquivo})`,
      descricao: `${linhas.length} item(ns) importado(s) da planilha.`,
      itens: linhas.length,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-4xl rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
              <FileSpreadsheet size={22} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#183263]">
                Importação de Registro de Necessidades
              </h3>
              <p className="text-xs text-[var(--color-muted)]">
                Faça o upload da planilha, mapeie os campos obrigatórios e finalize a importação em
                duas etapas guiadas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className={etapa === 1 ? 'text-[var(--color-primary)]' : 'text-[var(--color-success)]'}>
              1 PREPARAR
            </span>
            <span className="h-px w-6 bg-[var(--color-line)]" />
            <span className={etapa === 2 ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}>
              2 MAPEAR
            </span>
          </div>
        </div>

        {etapa === 1 && (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
                Passo 1
              </p>
              <h4 className="font-display text-sm font-bold text-[#183263]">Prepare sua planilha</h4>
              <div className="mt-2 rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Campos obrigatórios
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {['Nome do Item', 'Código do Item', 'Tipo do Item', 'Origem do Item', 'Unidade de Medida', 'Quantidade'].map((c) => (
                    <span key={c} className="rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-2 py-0.5 text-[11px] font-semibold text-white">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={baixarModelo}
                className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[#bcd0ee] bg-[var(--color-primary-soft)] px-3 py-2 text-xs font-bold text-[var(--color-primary-strong)]"
              >
                <Download size={13} /> Baixar modelo
              </button>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-success)]">
                Upload
              </p>
              <h4 className="font-display text-sm font-bold text-[#183263]">Envie sua planilha</h4>
              <label className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-control)] border-2 border-dashed border-[#c9d6ea] bg-[#f7f9fc] px-4 py-12 text-center">
                <Upload size={28} className="text-[var(--color-muted)]" />
                <span className="text-sm font-semibold text-[var(--color-primary-strong)]">
                  {nomeArquivo || 'Arraste o arquivo aqui ou clique para escolher'}
                </span>
                <span className="text-xs text-[var(--color-muted)]">Formato aceito: .csv</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void receber(f)
                  }}
                />
              </label>
              {erro && <p className="mt-2 text-xs font-semibold text-[var(--color-danger)]">{erro}</p>}
            </div>
          </div>
        )}

        {etapa === 2 && (
          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
              Passo 2
            </p>
            <h4 className="font-display text-sm font-bold text-[#183263]">Mapeie os campos</h4>
            <p className="mb-3 text-xs text-[var(--color-muted)]">
              Aponte cada campo para uma coluna da planilha “{nomeArquivo}”.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAMPOS.map((c) => (
                <label
                  key={c.key}
                  className="flex flex-col gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-line)] p-3 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]"
                >
                  <span>
                    {c.label}{' '}
                    <span className={c.obrigatorio ? 'text-[var(--color-danger)]' : 'text-[var(--color-muted)]'}>
                      {c.obrigatorio ? 'OBRIGATÓRIO' : 'OPCIONAL'}
                    </span>
                  </span>
                  <select
                    value={mapa[c.key] ?? ''}
                    onChange={(e) => setMapa((m) => ({ ...m, [c.key]: e.target.value }))}
                    className="gt-input font-normal normal-case"
                  >
                    <option value="">— não mapear —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEtapa(1)}
                className="rounded-[var(--radius-control)] border border-[var(--color-line)] px-5 py-2 text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]"
              >
                Voltar
              </button>
              <button
                onClick={confirmar}
                disabled={!ok}
                className="rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar e Importar ({linhas.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
