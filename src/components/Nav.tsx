import { useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { site } from '../data/site'
import { dur, ease, gsap, media, ScrollTrigger, useGSAP } from '../lib/motion'
import { TransitionLink, useTransition } from './Transition'

/** One segment of the nav's pill: the current page's segment is lit, the other dims until hovered. */
function Segment({ to, label, current, children, ...rest }: { to: string; label: string; current: boolean; children: ReactNode; 'aria-label'?: string }) {
  return (
    <TransitionLink
      to={to}
      label={label}
      aria-current={current ? 'page' : undefined}
      {...rest}
      className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-300 ${
        current ? 'bg-fg text-night shadow-[0_2px_10px_-2px_rgb(0_0_0/0.6)]' : 'text-fg-dim hover:bg-fg/[0.06] hover:text-fg'
      }`}
    >
      {children}
    </TransitionLink>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="-ml-1.5 h-6 w-6 shrink-0">
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#000" stroke="rgb(255 255 255 / 0.14)" />
      <path d="M5 17h5.5l2.5-6 4 12 3-9 1.8 3H27" fill="none" stroke="var(--color-ember)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Minimal fixed nav. Slides away while scrolling down, returns on the way up. */
export function Nav() {
  const ref = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const { ready } = useTransition()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        if (!ready) {
          gsap.set(el.children, { yPercent: -120, autoAlpha: 0 })
          return
        }
        gsap.to(el.children, { yPercent: 0, autoAlpha: 1, duration: dur.lg, ease: ease.out, stagger: 0.08, delay: 0.2 })
        let hidden = false
        const st = ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate(self) {
            const hide = self.direction === 1 && self.scroll() > 240
            if (hide === hidden) return
            hidden = hide
            gsap.to(el, { yPercent: hide ? -110 : 0, duration: dur.md, ease: ease.out, overwrite: true })
          },
        })
        return () => {
          st.kill()
          gsap.set(el, { yPercent: 0 })
        }
      })
      return () => mm.revert()
    },
    { dependencies: [ready], revertOnUpdate: true },
  )

  return (
    <header ref={ref} className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center gutter py-4">
      {/* One segmented pill: the brand (home) and Team. */}
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-raised/85 p-1 shadow-[0_12px_32px_-16px_rgb(0_0_0/0.9)] backdrop-blur-md"
      >
        <Segment to="/" label={site.name} aria-label={`${site.name}, home`} current={pathname === '/'}>
          <Logo />
          <span className="font-display text-[1rem] font-bold tracking-[-0.03em]">{site.name}</span>
        </Segment>
        <Segment to="/team" label="Team" current={pathname === '/team'}>
          Team
        </Segment>
      </nav>
    </header>
  )
}
