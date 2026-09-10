import {
  AlertTriangle,
  FileText,
  Fingerprint,
  Megaphone,
  PencilLine,
  Search,
  Settings2,
  Star,
} from 'lucide-react'

/** Ícones disponíveis para representar um artefato/nó de fluxo. */
export const ICONES = [
  { key: 'Documento', Icon: FileText },
  { key: 'Pesquisa', Icon: Search },
  { key: 'Ocorrência', Icon: AlertTriangle },
  { key: 'Identificação', Icon: Fingerprint },
  { key: 'Comunicação', Icon: Megaphone },
  { key: 'Destaque', Icon: Star },
  { key: 'Edição', Icon: PencilLine },
  { key: 'Configuração', Icon: Settings2 },
]

/** Componente do ícone pela key; cai em FileText se não achar. */
export const iconeDoArtefato = (key: string) =>
  ICONES.find((i) => i.key === key)?.Icon ?? FileText
