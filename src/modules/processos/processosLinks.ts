import type { ModuleLink } from '../../store/ui'

/** Ícones de contexto do módulo Processos Inteligentes (TopBar). */
export const PROCESSOS_MODULE_LINKS: ModuleLink[] = [
  { key: 'proc', label: 'Processos Inteligentes', to: '/processosinteligentes', icon: 'list' },
  { key: 'fluxo', label: 'Fluxo de Trabalho', to: '/ProcessosWorkflow', icon: 'workflow' },
  { key: 'modelos', label: 'Modelos Personalizados', to: '/ModeloPersonalizado', icon: 'modelo' },
  { key: 'normativa', label: 'Normativa', to: '/Normativa', icon: 'normativa' },
]
