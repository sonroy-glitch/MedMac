type IconProps = { className?: string }

/** Authored icon set: 1.5px stroke, square caps, 24 grid. */
export function Arrow({ direction = 'right', className = '' }: IconProps & { direction?: 'right' | 'down' | 'up-right' }) {
  const rotate = direction === 'down' ? 90 : direction === 'up-right' ? -45 : 0
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <g transform={`rotate(${rotate} 12 12)`}>
        <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </g>
    </svg>
  )
}

export function Check({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function Close({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function Flip({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 9h13l-3-3M20 15H7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function Replay({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12a7 7 0 1 0 2.1-5M5 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}
