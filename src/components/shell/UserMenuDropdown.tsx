import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  FileSignature,
  Headset,
  KeyRound,
  LogOut,
  Moon,
  Network,
  Users,
  UserCog,
  Workflow,
} from 'lucide-react'
import { useAuth } from '../../store/auth'
import { useUi } from '../../store/ui'

const SUPPORT_URL = 'https://gnp.negociospublicos.net.br/np/suporte'

export function UserMenuDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const setUserModal = useUi((s) => s.setUserModal)
  const theme = useUi((s) => s.theme)
  const toggleTheme = useUi((s) => s.toggleTheme)

  const openModal = (m: 'perfil' | 'instituicao' | 'senha' | 'metodo') => {
    onClose()
    setUserModal(m)
  }
  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  return (
    <div className="absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-pop)]">
      <div className="border-b border-[var(--color-line)] px-4 py-3">
        <p className="truncate text-sm font-bold text-[#183263]">{user?.name}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
      </div>
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-2.5">
        <span className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
          <Moon size={16} className="text-[var(--color-muted)]" />
          Tema escuro
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label="Tema escuro"
          onClick={toggleTheme}
          className={`relative h-5 w-9 shrink-0 rounded-full transition ${
            theme === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-[#cdd6e4]'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
              theme === 'dark' ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
      <div className="py-1">
        <Item icon={UserCog} label="Dados" onClick={() => openModal('perfil')} />
        <Item icon={Building2} label="Dados da Instituição" onClick={() => openModal('instituicao')} />
        <Item icon={KeyRound} label="Mudar senha" onClick={() => openModal('senha')} />
        <Item icon={Workflow} label="Método de trabalho" onClick={() => openModal('metodo')} />
        <Divider />
        <Item icon={Users} label="Gerenciar Usuários" onClick={() => go('/GerenciarUsuarios')} />
        <Item
          icon={FileSignature}
          label="Gerenciar Envolvidos em Assinaturas"
          onClick={() => go('/TipoEnvolvidoAssinatura')}
        />
        <Item icon={Network} label="Gerenciar Unidade/Setor" onClick={() => go('/GerenciarUnidadeSetor')} />
        <Item icon={BarChart3} label="Relatório de Uso" onClick={() => go('/RelatorioUso')} />
        <Divider />
        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)]"
        >
          <Headset size={16} className="text-[var(--color-muted)]" />
          Falar com o suporte
        </a>
      </div>
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

function Item({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Users
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)]"
    >
      <Icon size={16} className="shrink-0 text-[var(--color-muted)]" />
      {label}
    </button>
  )
}

function Divider() {
  return <div className="my-1 border-t border-[var(--color-line)]" />
}
