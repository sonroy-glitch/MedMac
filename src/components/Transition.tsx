import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router'
import { dur, ease, gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion'
import { pauseScroll, scrollToTarget } from '../lib/scroll'
import { preloadRoute } from '../lib/routes'

type TransitionState = {
  /** True once the page is uncovered (after the intro or a page transition). Entrance reveals wait for it. */
  ready: boolean
  setReady: (v: boolean) => void
  go: (to: string, label: string) => void
}

const Ctx = createContext<TransitionState | null>(null)

export function useTransition() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTransition outside TransitionProvider')
  return ctx
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [ready, setReady] = useState(false)
  const [label, setLabel] = useState('')
  const panel = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const pendingPath = useRef<string | null>(null)

  const go = useCallback(
    (to: string, nextLabel: string) => {
      if (busy.current) return
      if (to === pathname) {
        scrollToTarget(0)
        return
      }
      // The next page's code loads while the panel covers the screen.
      const loaded = preloadRoute(to).catch(() => {})
      if (prefersReducedMotion() || !panel.current) {
        void loaded.then(() => {
          navigate(to)
          window.scrollTo(0, 0)
        })
        return
      }
      busy.current = true
      setLabel(nextLabel)
      pauseScroll(true)
      const el = panel.current
      const word = el.querySelector('[data-word]')
      const line = el.querySelector('[data-line]')
      gsap
        .timeline({
          onComplete: () => {
            void loaded.then(() => {
              pendingPath.current = to
              setReady(false)
              navigate(to)
            })
          },
        })
        .set(el, { visibility: 'visible' })
        .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur.md, ease: ease.inOut })
        .fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: dur.md, ease: ease.out }, '-=0.45')
        .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: dur.md, ease: ease.out }, '<')
    },
    [navigate, pathname],
  )

  // Uncover once the new route has rendered.
  useEffect(() => {
    if (pendingPath.current !== pathname || !panel.current) return
    pendingPath.current = null
    window.scrollTo(0, 0)
    scrollToTarget(0, true)
    const el = panel.current
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      gsap
        .timeline({
          onComplete: () => {
            busy.current = false
            gsap.set(el, { visibility: 'hidden' })
            pauseScroll(false)
            document.getElementById('main')?.focus({ preventScroll: true })
          },
        })
        .to(el.querySelector('[data-word]'), { yPercent: -110, duration: dur.sm, ease: ease.inOut })
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: dur.md, ease: ease.inOut }, '-=0.2')
        .add(() => setReady(true), '-=0.55')
    })
  }, [pathname])

  return (
    <Ctx.Provider value={{ ready, setReady, go }}>
      {children}
      <div
        ref={panel}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[80] flex flex-col items-start justify-end bg-ground gutter pb-[8vh] theme-dark"
        style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      >
        <span data-line className="mb-6 block h-px w-full origin-left bg-ember" />
        <span className="mask-line">
          <span data-word className="display block text-[clamp(3.5rem,13vw,12rem)]">
            {label}
          </span>
        </span>
      </div>
    </Ctx.Provider>
  )
}

type TLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; label: string }

/** A router link that plays the page transition. */
export function TransitionLink({ to, label, onClick, children, ...rest }: TLinkProps) {
  const { go } = useTransition()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    go(to, label)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
