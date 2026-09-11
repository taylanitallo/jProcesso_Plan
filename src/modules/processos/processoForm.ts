import type { NovoProcesso } from '../../store/processos'

/** Shape do formulário compartilhado pelos 3 modos de criação de processo. */
export type ProcessoFormValue = {
  numero: string
  legislacao: string
  tipo: string
  fluxo: string
  nome: string
  lote: string
  descricao: string
  unidadeId: string
  unidadeNome: string
}

export const PROCESSO_FORM_VAZIO: ProcessoFormValue = {
  numero: '',
  legislacao: '',
  tipo: '',
  fluxo: '',
  nome: '',
  lote: 'Não',
  descricao: '',
  unidadeId: '',
  unidadeNome: '',
}

/** ProcessoFormValue → parte comum de NovoProcesso. */
export function toNovoProcesso(v: ProcessoFormValue): NovoProcesso {
  return {
    numero: v.numero.trim(),
    nome: v.nome.trim(),
    tipo: v.tipo,
    legislacao: v.legislacao || '14.133',
    fluxo: v.fluxo,
    loteUnico: v.lote === 'Sim' ? 'Sim' : 'Não',
    descricao: v.descricao,
    unidadeId: v.unidadeId,
    unidadeNome: v.unidadeNome,
  }
}
