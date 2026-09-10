import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { LABEL_CAPABILITY, usePode, type Capability } from './permissoes'

/** Envolve uma rota que exige uma capacidade de perfil. Sem permissão → aviso. */
export function RequireCapability({
  cap,
  children,
}: {
  cap: Capability
  children: ReactNode
}) {
  const permitido = usePode(cap)
  if (permitido) return <>{children}</>

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white px-6 py-12 text-center shadow-[var(--shadow-card)]">
      <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c2c8] text-[var(--color-danger)]">
        <ShieldAlert size={26} />
      </span>
      <h1 className="font-display text-lg font-bold text-[#183263]">Sem acesso</h1>
      <p className="text-sm text-[var(--color-muted)]">
        Seu perfil não tem permissão para {LABEL_CAPABILITY[cap]}. Fale com o Administrador Geral.
      </p>
      <Link
        to="/Home"
        className="mt-1 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] px-5 py-2 text-sm font-semibold text-white"
      >
        Voltar para o início
      </Link>
    </div>
  )
}
