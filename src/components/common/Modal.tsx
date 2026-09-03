import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  size?: 'md' | 'lg' | 'full'
  children: ReactNode
}

const sizes = {
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  full: 'max-w-6xl',
}

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.70)] p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className={`my-auto w-full ${sizes[size]} overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-pop)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-5 py-4">
          <h3 className="text-[0.98rem] font-bold text-[#183263]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary-strong)]"
          >
            <X size={18} />
          </button>
        </header>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
