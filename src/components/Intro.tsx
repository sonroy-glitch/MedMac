import { useLayoutEffect, useRef, useState } from 'react'
import { dur, ease, gsap, prefersReducedMotion } from '../lib/motion'
import { pauseScroll } from '../lib/scroll'
import { useTransition } from './Transition'
import { site } from '../data/site'

const KEY = 'medmac:intro-seen'

/** First-visit intro: one heartbeat draws across the dark, then the page is uncovered. */
export function Intro() {
  const { setReady } = useTransition()
  const root = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useLayoutEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(KEY) === '1'
    } catch {
      /* storage blocked: play the intro */
    }
    if (seen || prefersReducedMotion() || !root.current) {
      setDone(true)
      setReady(true)
      return
    }
    const el = root.current
    const path = el.querySelector<SVGPathElement>('path')!
    const len = path.getTotalLength()
    pauseScroll(true)
    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem(KEY, '1')
        } catch {
          /* ignore */
        }
        pauseScroll(false)
        setDone(true)
      },
    })
    tl.set(path, { strokeDasharray: len, strokeDashoffset: len })
      .to(path, { strokeDashoffset: 0, duration: dur.lg, ease: 'power2.inOut' })
      .to(el.querySelector('[data-glow]'), { opacity: 1, scale: 1, duration: dur.md, ease: ease.out }, '-=0.75')
      .fromTo(el.querySelector('[data-name]'), { yPercent: 110 }, { yPercent: 0, duration: dur.md, ease: ease.out }, '<')
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: dur.lg, ease: ease.inOut }, '+=0.1')
      .add(() => setReady(true), '-=0.85')
    return () => {
      tl.kill()
      pauseScroll(false)
    }
  }, [setReady])

  if (done) return null

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="theme-dark fixed inset-0 z-[90] bg-ground"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <div
        data-glow
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46vmin] w-[46vmin] rounded-full opacity-0"
        style={{
          background: 'radial-gradient(closest-side, rgb(233 164 64 / 0.2), transparent)',
          transform: 'translate(-50%, -50%) scale(0.6)',
        }}
      />
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-1/2 h-[22vh] w-full -translate-y-1/2"
      >
        <path
          d="M0 100 H470 L500 100 L520 72 L540 100 L560 100 L580 18 L610 182 L630 100 L660 100 L680 86 L700 100 H1200"
          fill="none"
          stroke="var(--color-ember)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <span className="mask-line absolute bottom-[10vh] left-1/2 -translate-x-1/2">
        <span data-name className="display block text-xl tracking-[-0.02em] text-fg">
          {site.name}
        </span>
      </span>
    </div>
  )
}
