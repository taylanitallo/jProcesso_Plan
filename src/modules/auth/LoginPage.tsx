import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { useAuth } from '../../store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuth((s) => s.login)
  const [email, setEmail] = useState('alef.sousa@negociospublicos.com.br')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'none' | 'forgot' | 'request'>('none')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(email, password)) {
      navigate('/')
    } else {
      setError('Informe um e-mail válido e uma senha com ao menos 3 caracteres.')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-[16px] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] font-display text-2xl font-extrabold text-white">
            S
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#183263]">SollAI</h1>
            <p className="text-sm text-[var(--color-muted)]">Inteligência para compras públicas</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl font-bold text-[#183263]">Bem vindo!</h2>
          <p className="mb-4 text-sm text-[var(--color-muted)]">Acesse sua conta para continuar.</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              Email
              <input
                type="text"
                className="gt-input"
                placeholder="Digite seu Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-pass" className="text-sm font-medium text-[var(--color-ink)]">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setModal('forgot')}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  esqueceu sua senha ?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-pass"
                  type={showPass ? 'text' : 'password'}
                  className="gt-input pr-10"
                  placeholder="Digite sua Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs font-medium text-[var(--color-danger)]">{error}</p>}

            <Button type="submit" fullWidth className="mt-2">
              Entrar
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          Se você ainda não possui uma conta, por favor, solicite uma agora.{' '}
          <button
            onClick={() => setModal('request')}
            className="font-semibold text-[var(--color-primary)] hover:underline"
          >
            Solicite!
          </button>
        </p>
      </div>

      <Modal open={modal === 'forgot'} onClose={() => setModal('none')} title="Recuperar senha">
        <p className="text-sm text-[var(--color-muted)]">
          Informe seu e-mail e enviaremos um link de redefinição.
        </p>
        <input className="gt-input mt-3" placeholder="seu@email.com" />
        <Button className="mt-4" fullWidth onClick={() => setModal('none')}>
          Enviar link
        </Button>
      </Modal>

      <Modal open={modal === 'request'} onClose={() => setModal('none')} title="Solicitar acesso">
        <p className="text-sm text-[var(--color-muted)]">
          Preencha os dados e nossa equipe entrará em contato.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <input className="gt-input" placeholder="Nome Completo" />
          <input className="gt-input" placeholder="Empresa/Instituição" />
          <input className="gt-input" placeholder="CNPJ" />
          <input className="gt-input" placeholder="Telefone" />
          <input className="gt-input" placeholder="Email" />
        </div>
        <Button className="mt-4" fullWidth onClick={() => setModal('none')}>
          Enviar
        </Button>
      </Modal>
    </div>
  )
}
