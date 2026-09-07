import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CadastroCertificado = {
  email: string
  nome: string
  cpf: string
  rg: string
  nascimento: string
  pais: string
  estado: string
  cidade: string
}

export type Certificado = CadastroCertificado & {
  status: 'ATIVO' | 'REVOGADO'
  criadoPor: string
  criadoEm: string
}

type State = {
  cadastros: Record<string, CadastroCertificado>
  certificados: Record<string, Certificado>
  salvarCadastro: (pessoaId: string, dados: CadastroCertificado) => void
  gerar: (pessoaId: string, criadoPor: string) => void
  revogar: (pessoaId: string) => void
}

const agora = () =>
  `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

export const useCertificados = create<State>()(
  persist(
    (set, get) => ({
      cadastros: {},
      certificados: {},
      salvarCadastro: (pessoaId, dados) =>
        set((s) => ({ cadastros: { ...s.cadastros, [pessoaId]: dados } })),
      gerar: (pessoaId, criadoPor) => {
        const cadastro = get().cadastros[pessoaId]
        if (!cadastro) return
        set((s) => ({
          certificados: {
            ...s.certificados,
            [pessoaId]: { ...cadastro, status: 'ATIVO', criadoPor, criadoEm: agora() },
          },
        }))
      },
      revogar: (pessoaId) =>
        set((s) => {
          const rest = { ...s.certificados }
          delete rest[pessoaId]
          return { certificados: rest }
        }),
    }),
    { name: 'sollai-certificados' },
  ),
)

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]
