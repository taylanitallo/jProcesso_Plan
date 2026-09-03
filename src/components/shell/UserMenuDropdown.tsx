import { useNavigate } from 'react-router-dom'
import { Building2, FileSignature, LogOut, Users, Network, BarChart3, UserCog } from 'lucide-react'
import { useAuth } from '../../store/auth'

const ITEMS = [
  { icon: UserCog, label: 'Meus dados', to: '/usuario/dados' },
  { icon: Building2, label: 'Dados da instituição', to: '/usuario/instituicao' },
  { icon: Users, label: 'Gerenciar usuários', to: '/usuario/usuarios' },
  { icon: FileSignature, label: 'Envolvidos em assinaturas', to: '/usuario/envolvidos' },
  { icon: Network, label: 'Unidades / Setores', to: '/usuario/unidades' },
  { icon: BarChart3, label: 'Relatório de uso', to: '/usuario/relatorio' },
]

export function UserMenuDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  return (
    <div className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-pop)]">
      <div className="border-b border-[var(--color-line)] px-4 py-3">
        <p className="truncate text-sm font-bold text-[#183263]">{user?.name}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
      </div>
      <ul className="py-1">
        {ITEMS.map(({ icon: Icon, label, to }) => (
          <li key={to}>
            <button
              onClick={() => go(to)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)]"
            >
              <Icon size={16} className="text-[var(--color-muted)]" />
              {label}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          logout()
          navigate('/login')
        }}
        className="flex w-full items-center gap-3 border-t border-[var(--color-line)] px-4 py-2.5 text-left text-sm font-semibold text-[var(--color-danger)] hover:bg-[#fbe4e7]"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  )
}
