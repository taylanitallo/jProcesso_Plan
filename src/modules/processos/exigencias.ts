import type { ProcessoLocal } from '../../store/processos'
import type { Workflow } from '../../store/workflows'

export type Exigencia = { aprovacao: boolean; assinatura: boolean }

/**
 * Mapeia, para cada artefato do processo, se o fluxo de trabalho escolhido
 * exige aprovação e/ou assinatura. A ligação é pelo nome do fluxo
 * (`proc.fluxo === workflow.nome`) e pelo nome do artefato/nó.
 * Processo sem fluxo definido (ou fluxo inexistente/inativo) → mapa vazio.
 */
export function exigenciasDoProcesso(
  proc: ProcessoLocal,
  workflows: Workflow[],
): Map<string, Exigencia> {
  const mapa = new Map<string, Exigencia>()
  if (!proc.fluxo) return mapa

  const wf = workflows.find((w) => w.ativo && w.nome === proc.fluxo)
  if (!wf) return mapa

  for (const no of wf.nos) {
    if (!no.config.aprovacao && !no.config.assinatura) continue
    const artefato = proc.artefatos.find(
      (a) => a.nome === no.nome || a.completo === no.nome,
    )
    if (!artefato) continue
    mapa.set(artefato.completo, {
      aprovacao: no.config.aprovacao,
      assinatura: no.config.assinatura,
    })
  }
  return mapa
}
