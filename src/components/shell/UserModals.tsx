import { UploadCloud } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useAuth } from '../../store/auth'
import { useUi } from '../../store/ui'

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
      {label}
      <input className="gt-input" {...rest} />
    </label>
  )
}

export function UserModals() {
  const modal = useUi((s) => s.userModal)
  const close = () => useUi.getState().setUserModal(null)
  const user = useAuth((s) => s.user)

  return (
    <>
      <Modal open={modal === 'perfil'} onClose={close} title="Atualize seu perfil" size="lg">
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Mantenha suas informações sempre atualizadas para garantir a melhor experiência.
        </p>
        <div className="mb-4 sm:max-w-xs">
          <UploadBox label="Foto de perfil" hint="Formatos recomendados: JPG ou PNG até 5MB." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" defaultValue={user?.name} />
          <Field label="E-mail" defaultValue={user?.email} />
          <Field label="Telefone" placeholder="(00) 0000-0000" />
          <Field label="Celular" placeholder="(00) 00000-0000" />
          <Field label="Data de Nascimento" type="date" />
        </div>
        <Button className="mt-5" onClick={close}>
          Salvar atualizações
        </Button>
      </Modal>

      <Modal
        open={modal === 'instituicao'}
        onClose={close}
        title="Atualize os dados da sua instituição"
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <UploadBox label="Clique para enviar o logo" hint="PNG ou JPG, até 5MB" />
          <UploadBox label="Logo do sistema (SollAI)" hint="PNG ou JPG, até 5MB" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="CNPJ" placeholder="00.000.000/0000-00" />
          <Field label="Razão Social" placeholder="Nome da instituição" />
        </div>
        <Button className="mt-5" onClick={close}>
          Salvar atualizações
        </Button>
      </Modal>

      <Modal open={modal === 'senha'} onClose={close} title="Redefina sua senha">
        <div className="flex flex-col gap-4">
          <Field label="Senha atual" type="password" />
          <Field label="Nova senha" type="password" />
          <Field label="Confirme a nova senha" type="password" />
        </div>
        <ul className="mt-4 space-y-1 text-xs text-[var(--color-muted)]">
          <li>Use ao menos 8 caracteres com letras e números.</li>
          <li>Evite dados pessoais ou senhas reutilizadas.</li>
          <li>Atualize periodicamente para maior proteção.</li>
        </ul>
        <Button className="mt-4" onClick={close}>
          Salvar alterações
        </Button>
      </Modal>

      <Modal open={modal === 'metodo'} onClose={close} title="Método de trabalho.">
        <p className="text-sm text-[var(--color-muted)]">
          Consulte o guia completo de utilização da plataforma.
        </p>
        <a
          href="#"
          className="mt-3 inline-block font-semibold text-[var(--color-primary)] hover:underline"
        >
          Manual do Usuário.
        </a>
      </Modal>
    </>
  )
}

function UploadBox({ label, hint }: { label: string; hint: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-[var(--radius-control)] border-2 border-dashed border-[#c9d6ea] bg-[#f7f9fc] px-4 py-6 text-center">
      <UploadCloud size={22} className="text-[var(--color-muted)]" />
      <span className="text-xs font-semibold text-[var(--color-primary-strong)]">{label}</span>
      <span className="text-[11px] text-[var(--color-muted)]">{hint}</span>
      <input type="file" className="hidden" />
    </label>
  )
}
