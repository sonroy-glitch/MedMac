import { useRef, type ElementType, type ReactNode } from 'react'
import { dur, ease, gsap, media, SplitText, stagger, useGSAP } from '../lib/motion'
import { useTransition } from './Transition'

type Props = {
  as?: ElementType
  children: ReactNode
  className?: string
  /** chars: masked per-character slide-up. lines: masked per-line slide-up. */
  by?: 'chars' | 'lines'
  /** ready: plays once the page is uncovered. scroll: plays when it enters the viewport. */
  trigger?: 'ready' | 'scroll'
  delay?: number
  id?: string
}

/**
 * Masked slide-up text reveal using GSAP SplitText, fully static under
 * reduced motion. The text stays readable to assistive tech: line wrappers
 * leave it intact, a split heading is labelled with its text, and split
 * characters anywhere else are hidden behind a visually hidden copy (an
 * aria-label is not allowed on a plain span or paragraph).
 */
export function SplitReveal({
  as: Tag = 'div',
  children,
  className = '',
  by = 'lines',
  trigger = 'scroll',
  delay = 0,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const { ready } = useTransition()
  const heading = typeof Tag === 'string' && /^h[1-6]$/.test(Tag)
  const copy = by === 'chars' && !heading

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        if (trigger === 'ready' && !ready) {
          gsap.set(el, { autoAlpha: 0 })
          return
        }
        gsap.set(el, { autoAlpha: 1 })
        const split = SplitText.create(el, {
          type: by === 'chars' ? 'lines,chars' : 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          aria: by === 'lines' ? 'none' : heading ? 'auto' : 'hidden',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(by === 'chars' ? self.chars : self.lines, {
              yPercent: 115,
              rotate: by === 'chars' ? 4 : 0,
              duration: by === 'chars' ? dur.lg : dur.lg,
              ease: ease.out,
              stagger: by === 'chars' ? stagger.char : stagger.line,
              delay,
              scrollTrigger:
                trigger === 'scroll' ? { trigger: el, start: 'top 88%', once: true } : undefined,
            })
          },
        })
        return () => split.revert()
      })
      return () => mm.revert()
    },
    { dependencies: [ready, by, trigger, delay], revertOnUpdate: true },
  )

  const el = (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  )
  if (!copy) return el
  return (
    <>
      <span className="sr-only">{children}</span>
      {el}
    </>
  )
}
