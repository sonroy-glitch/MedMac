import { useRef } from 'react'
import { languages } from '../../data/site'
import { gsap, media, ScrollTrigger, useGSAP, whileVisible } from '../../lib/motion'

/**
 * Slow loop of the languages, each written in its own script. Scrolling
 * nudges the speed (and direction) for a moment, then it settles back.
 */
export function LanguageMarquee() {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        const loop = gsap.to(track.current, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 })
        // The track only gets its own layer while it is on screen and moving.
        // Runs only once the strip is actually on screen: it sits just under the fold.
        const stop = whileVisible(ref.current, loop, {
          margin: '0px',
          onToggle: (on) => track.current && (track.current.style.willChange = on ? 'transform' : ''),
        })
        let settle: gsap.core.Tween | null = null
        const st = ScrollTrigger.create({
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate(self) {
            const v = self.getVelocity() / 260
            const target = gsap.utils.clamp(-6, 6, 1 + v)
            settle?.kill()
            loop.timeScale(target)
            settle = gsap.to(loop, { timeScale: 1, duration: 1.4, ease: 'power3.out' })
          },
        })
        return () => {
          stop()
          st.kill()
          settle?.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {languages.map((l) => (
        <li key={l.name} className="flex items-center">
          <span className="font-script px-[clamp(1.25rem,3vw,3rem)] text-[clamp(2.4rem,6.5vw,6.5rem)] font-medium leading-[1.25] text-fg">
            {l.native}
          </span>
          <span aria-hidden="true" className="h-[0.6rem] w-[0.6rem] rotate-45 border border-accent" />
        </li>
      ))}
    </ul>
  )

  return (
    <section ref={ref} aria-label={`Speaks ${languages.length} languages`} className="theme-dark relative py-[clamp(1.5rem,4vh,3rem)]">
      <div className="gutter mb-4 flex items-baseline justify-between">
        <p className="text-sm text-fg-dim">The patient speaks. The kiosk listens in:</p>
        <p className="numeric text-sm text-fg-dim">{languages.length} languages</p>
      </div>
      <div className="overflow-hidden">
        <div ref={track} className="flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
      <p className="sr-only">{languages.map((l) => l.name).join(', ')}</p>
    </section>
  )
}
