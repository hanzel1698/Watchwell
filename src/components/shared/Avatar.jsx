import { pastelBackgroundFor } from '../../lib/avatarColors'

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-11 h-11 text-lg',
}

// Letter avatar for a channel or the kid's profile. `variant="brand"` (the
// default, used throughout the kid app) is a red-tinted circle; `variant="pastel"`
// (used for channels in the admin dashboard) picks a deterministic pastel color.
export default function Avatar({ label, variant = 'brand', size = 'md' }) {
  const letter = label?.charAt(0)?.toUpperCase() ?? '?'
  const style =
    variant === 'pastel'
      ? { backgroundColor: pastelBackgroundFor(label ?? ''), color: 'var(--color-text)' }
      : undefined

  return (
    <div
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full font-heading font-bold ${
        variant === 'brand' ? 'bg-brand-tint text-brand' : ''
      } ${SIZE_CLASSES[size]}`}
    >
      {letter}
    </div>
  )
}
