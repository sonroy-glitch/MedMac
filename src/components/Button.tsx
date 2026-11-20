import type { ReactNode } from 'react'
import { Magnetic } from './Magnetic'
import { TransitionLink } from './Transition'
import { Arrow } from './Icons'

type Base = {
  children: string
  variant?: 'solid' | 'ghost'
  icon?: 'down' | 'right' | 'none'
  className?: string
}

type Props =
  | (Base & { kind: 'button'; onClick: () => void; type?: 'button' | 'submit' })
  | (Base & { kind: 'href'; href: string })
  | (Base & { kind: 'route'; to: string; label: string })

const styles = {
  solid: 'bg-ember text-ink shadow-[0_10px_30px_-12px_rgb(184_116_28/0.7)] hover:bg-fg hover:text-ground',
  ghost: 'border border-line text-fg hover:border-fg',
}

function Inner({ children, icon }: { children: string; icon: Base['icon'] }): ReactNode {
  return (
    <>
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
        >
          {children}
        </span>
      </span>
      {icon !== 'none' && (
        <Arrow
          direction={icon === 'down' ? 'down' : 'right'}
          className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5"
        />
      )}
    </>
  )
}

/** Pill button with a rolling label and a magnetic pull. */
export function Button(props: Props) {
  const { children, variant = 'solid', icon = 'right', className = '' } = props
  const cls = `group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[0.95rem] font-medium tracking-[-0.01em] transition-colors duration-300 ${styles[variant]} ${className}`
  const inner = <Inner icon={icon}>{children}</Inner>

  return (
    <Magnetic>
      {props.kind === 'button' ? (
        <button type={props.type ?? 'button'} onClick={props.onClick} className={cls}>
          {inner}
        </button>
      ) : props.kind === 'href' ? (
        <a href={props.href} className={cls}>
          {inner}
        </a>
      ) : (
        <TransitionLink to={props.to} label={props.label} className={cls}>
          {inner}
        </TransitionLink>
      )}
    </Magnetic>
  )
}
