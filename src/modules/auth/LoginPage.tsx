import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { useAuth } from '../../store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuth((s) => s.login)
  const [email, setEmail] = useState('alef.sousa@negociospublicos.com.br')
  const [password, setPassword] = useState('')
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
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              E-mail
              <input
                type="email"
                className="gt-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              Senha
              <input
                type="password"
                className="gt-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error && <p className="text-xs font-medium text-[var(--color-danger)]">{error}</p>}

            <Button type="submit" fullWidth>
              Entrar
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs">
            <button
              onClick={() => setModal('forgot')}
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Esqueceu a senha?
            </button>
            <button
              onClick={() => setModal('request')}
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Solicitar conta
            </button>
          </div>
        </div>
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

      <Modal open={modal === 'request'} onClose={() => setModal('none')} title="Solicitar conta">
        <p className="text-sm text-[var(--color-muted)]">
          Preencha os dados e um administrador liberará seu acesso.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <input className="gt-input" placeholder="Nome completo" />
          <input className="gt-input" placeholder="E-mail institucional" />
          <input className="gt-input" placeholder="Órgão / Instituição" />
        </div>
        <Button className="mt-4" fullWidth onClick={() => setModal('none')}>
          Enviar solicitação
        </Button>
      </Modal>
    </div>
  )
}
