import { useLayoutEffect, useRef } from 'react'
import { site } from '../data/site'
import { ease, gsap, media, useGSAP } from '../lib/motion'
import { TransitionLink } from './Transition'

/** Big typographic footer: the wordmark rises out of the floor as you arrive. */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const mark = useRef<HTMLParagraphElement>(null)

  // Size the wordmark to the footer's width, whatever the product name is.
  useLayoutEffect(() => {
    const el = mark.current!
    const fit = () => {
      el.style.fontSize = '100px'
      const w = el.parentElement!.clientWidth * 0.97
      el.style.fontSize = `${(w / el.scrollWidth) * 100}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement!)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        gsap.fromTo(
          mark.current,
          { yPercent: 38, scaleY: 1.12 },
          {
            yPercent: 0,
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
          },
        )
        gsap.from('[data-foot]', {
          y: 24,
          autoAlpha: 0,
          duration: 1,
          ease: ease.out,
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <footer ref={ref} className="theme-dark relative overflow-hidden pt-24">
      <div className="gutter grid gap-12 md:grid-cols-12">
        <div data-foot className="md:col-span-5">
          <p className="max-w-[22ch] font-display text-[clamp(1.6rem,3vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            Bring {site.name} to your outpatient floor.
          </p>
        </div>
        <div data-foot className="md:col-span-2 md:col-start-11">
          <p className="label mb-3">Pages</p>
          <ul className="space-y-1 text-fg">
            <li>
              <TransitionLink to="/" label="Product" className="hover:text-accent">
                Product
              </TransitionLink>
            </li>
            <li>
              <TransitionLink to="/team" label="Team" className="hover:text-accent">
                Team
              </TransitionLink>
            </li>
          </ul>
        </div>
      </div>

      <div data-foot className="gutter mt-20 flex flex-wrap items-center justify-between gap-4 border-t hairline py-5 text-sm text-fg-dim">
        <p className="numeric">© {new Date().getFullYear()} {site.name}.</p>
      </div>

      <p
        ref={mark}
        aria-hidden="true"
        className="display pointer-events-none mx-auto w-max origin-bottom select-none whitespace-nowrap text-center leading-[0.74] text-fg"
        style={{ marginBottom: '-0.06em' }}
      >
        {site.name}
      </p>
    </footer>
  )
}
