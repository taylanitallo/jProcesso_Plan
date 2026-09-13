/**
 * Paleta de cores de destaque compartilhada — usada pra colorir cards,
 * seções de formulário e badges por "categoria" em vez de tudo na mesma cor
 * primária. Ver tokens em `src/index.css` (@theme).
 *
 * `hoverBg` fica pré-montado (não construído com template string em quem
 * consome) porque o Tailwind só gera a classe se o texto literal aparecer
 * no código-fonte — `hover:${a.bg}` não é enxergado pelo scanner.
 */
export type Accent = 'blue' | 'teal' | 'violet' | 'pink' | 'amber' | 'green' | 'indigo'

export const ACCENTS: Record<Accent, { bg: string; hoverBg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-[var(--color-primary-soft)]',
    hoverBg: 'hover:bg-[var(--color-primary-soft)]',
    text: 'text-[var(--color-primary-strong)]',
    border: 'border-[var(--color-primary)]',
  },
  teal: {
    bg: 'bg-[var(--color-teal-soft)]',
    hoverBg: 'hover:bg-[var(--color-teal-soft)]',
    text: 'text-[var(--color-teal)]',
    border: 'border-[var(--color-teal)]',
  },
  violet: {
    bg: 'bg-[var(--color-violet-soft)]',
    hoverBg: 'hover:bg-[var(--color-violet-soft)]',
    text: 'text-[var(--color-violet)]',
    border: 'border-[var(--color-violet)]',
  },
  pink: {
    bg: 'bg-[var(--color-pink-soft)]',
    hoverBg: 'hover:bg-[var(--color-pink-soft)]',
    text: 'text-[var(--color-pink)]',
    border: 'border-[var(--color-pink)]',
  },
  amber: {
    bg: 'bg-[var(--color-amber-soft)]',
    hoverBg: 'hover:bg-[var(--color-amber-soft)]',
    text: 'text-[var(--color-amber)]',
    border: 'border-[var(--color-amber)]',
  },
  green: {
    bg: 'bg-[var(--color-success-soft)]',
    hoverBg: 'hover:bg-[var(--color-success-soft)]',
    text: 'text-[var(--color-success)]',
    border: 'border-[var(--color-success)]',
  },
  indigo: {
    bg: 'bg-[var(--color-indigo-soft)]',
    hoverBg: 'hover:bg-[var(--color-indigo-soft)]',
    text: 'text-[var(--color-indigo)]',
    border: 'border-[var(--color-indigo)]',
  },
}
