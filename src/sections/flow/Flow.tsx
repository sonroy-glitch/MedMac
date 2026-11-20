import { useRef } from 'react'
import { beats, flow } from '../../data/site'
import { dur, ease, gsap, ScrollTrigger, useGSAP } from '../../lib/motion'
import { useMedia } from '../../hooks/useMedia'
import { SplitReveal } from '../../components/SplitReveal'
import { visuals } from './visuals'

const PIN_QUERY = '(min-width: 900px) and (prefers-reduced-motion: no-preference)'
const pad = (n: number) => String(n).padStart(2, '0')

function Intro() {
  return (
    <div className="gutter grid gap-8 pb-[clamp(3rem,8vh,6rem)] pt-section md:grid-cols-12">
      <SplitReveal as="h2" id="how-title" by="lines" className="display text-[clamp(2.4rem,6vw,6.2rem)] md:col-span-8">
        Six beats. One stop. No paper.
      </SplitReveal>
      <SplitReveal
        as="p"
        by="lines"
        delay={0.15}
        className="max-w-[40ch] self-end text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-fg-dim md:col-span-4"
      >
        A patient walks up unsure where to go. A few minutes later they are measured, heard, matched, paid up and in the right
        doctor’s queue.
      </SplitReveal>
    </div>
  )
}

/** Desktop: one pinned stage. The steps are a deck of cards; each scroll beat quickly tosses the top card away. */
function Pinned() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = ref.current!
      const words = gsap.utils.toArray<HTMLElement>('[data-word]', root)
      const copies = gsap.utils.toArray<HTMLElement>('[data-copy]', root)
      const stages = gsap.utils.toArray<HTMLElement>('[data-stage]', root)
      const shades = gsap.utils.toArray<HTMLElement>('[data-shade]', root)
      const counts = gsap.utils.toArray<HTMLElement>('[data-count]', root)
      const marks = gsap.utils.toArray<HTMLElement>('[data-beat]', root)
      const n = flow.length

      gsap.set(words.slice(1), { yPercent: 105 })
      gsap.set(copies.slice(1), { autoAlpha: 0, y: 30 })
      gsap.set(counts.slice(1), { yPercent: 100 })
      // A card d places back in the deck peeks out above the one in front, smaller and in shadow.
      const depth = (d: number) => ({ y: -d * 24, scale: 1 - d * 0.06, autoAlpha: d > 3 ? 0 : 1 })
      const shade = (d: number) => ({ opacity: Math.min(0.8, d * 0.32) })
      stages.forEach((el, i) => gsap.set(el, { ...depth(i), zIndex: n - i, transformOrigin: '50% 0%' }))
      shades.forEach((el, i) => gsap.set(el, shade(i)))

      // The deck is not scrubbed: a short scroll into the next beat plays the whole swap at
      // its own quick pace, forwards or back. The timeline below is one unit per beat.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      let step = 0
      let swap: gsap.core.Tween | null = null
      const go = (to: number) => {
        if (to === step) return
        const far = Math.abs(to - step)
        step = to
        marks.forEach((m, i) => m.classList.toggle('is-lit', i <= to))
        swap?.kill()
        // Beat k has fully landed at k + 0.05 (its last tween ends there).
        swap = tl.tweenTo(to === 0 ? 0 : to + 0.05, { duration: Math.min(1.1, 0.55 + (far - 1) * 0.15), ease: 'power1.inOut' })
      }
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: `+=${(n - 1) * 70}%`,
        pin: true,
        // A beat takes over once you are a quarter of the way into its stretch of scroll.
        onUpdate: (self) => go(Math.min(n - 1, Math.floor(self.progress * (n - 1) + 0.75))),
        onRefresh: (self) => go(Math.min(n - 1, Math.floor(self.progress * (n - 1) + 0.75))),
      })

      tl.fromTo('[data-rail]', { scaleX: 0.2 / (n - 1) }, { scaleX: 1, duration: n - 1 }, 0)

      for (let i = 1; i < n; i++) {
        const at = i - 1
        tl.to(words[i - 1], { yPercent: -105, duration: 0.6, ease: 'power2.in' }, at)
          .to(words[i], { yPercent: 0, duration: 0.6, ease: 'power3.out' }, at + 0.35)
          .to(counts[i - 1], { yPercent: -100, duration: 0.5 }, at + 0.1)
          .to(counts[i], { yPercent: 0, duration: 0.5 }, at + 0.4)
          .to(copies[i - 1], { autoAlpha: 0, y: -30, duration: 0.4 }, at)
          .to(copies[i], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, at + 0.45)
          .to(stages[i - 1], { xPercent: 75, yPercent: -6, rotate: 14, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, at)
        for (let k = i; k < n; k++) {
          tl.to(stages[k], { ...depth(k - i), duration: 0.8, ease: 'power3.inOut' }, at + 0.25).to(
            shades[k],
            { ...shade(k - i), duration: 0.8 },
            at + 0.25,
          )
        }
      }
      tl.to({}, { duration: 0.15 })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="relative flex h-[100svh] flex-col overflow-hidden pb-10 pt-24">
      {/* progress rail */}
      <div className="gutter">
        <div className="relative">
          <div className="h-px w-full bg-line" />
          <div data-rail className="absolute inset-0 h-px origin-left bg-ember" />
        </div>
        <ol className="mt-3 grid grid-cols-6 text-xs" aria-label="The six beats">
          {beats.map((b, i) => (
            <li
              key={b}
              data-beat
              className={`flex items-center gap-2 text-fg-dim transition-colors duration-300 [&.is-lit]:text-fg ${i === 0 ? 'is-lit' : ''}`}
            >
              <span className="numeric">{pad(i + 1)}</span>
              {b}
            </li>
          ))}
        </ol>
      </div>

      <div className="gutter grid min-h-0 flex-1 grid-cols-12 gap-x-8 pt-[6vh]">
        <div className="relative col-span-5 flex flex-col">
          <div className="numeric flex items-baseline gap-2 text-sm text-fg-dim">
            <span className="relative inline-block h-[1.2em] w-[2ch] overflow-hidden text-fg">
              {flow.map((s, i) => (
                <span key={s.id} data-count className="absolute inset-0">
                  {pad(i + 1)}
                </span>
              ))}
            </span>
            <span>/ {pad(beats.length)}</span>
          </div>

          <div className="relative mt-6 h-[clamp(4.5rem,8.4vw,9rem)] overflow-hidden">
            {flow.map((s) => (
              <h3
                key={s.id}
                data-word
                className={`display absolute inset-0 whitespace-nowrap leading-[1.05] ${
                  s.word.length > 8 ? 'text-[clamp(2.6rem,5vw,5.6rem)]' : 'text-[clamp(3.5rem,7.6vw,8.2rem)]'
                }`}
              >
                {s.word}
              </h3>
            ))}
          </div>

          <div className="relative mt-auto min-h-[12rem]">
            {flow.map((s) => (
              <div key={s.id} data-copy className="absolute inset-x-0 bottom-0">
                <p className="font-display text-[clamp(1.4rem,2vw,2rem)] font-medium tracking-[-0.03em]">{s.title}</p>
                <p className="mt-3 max-w-[38ch] leading-relaxed text-fg-dim">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative col-span-6 col-start-7 mt-[4.5rem] min-h-0">
          {flow.map((s) => {
            const V = visuals[s.id as keyof typeof visuals]
            return (
              <div
                key={s.id}
                data-stage
                className="absolute inset-0 overflow-hidden rounded-[28px] border hairline bg-[linear-gradient(165deg,#15181e,#0c0d10)] p-[clamp(1.5rem,3vw,3rem)] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.07)]"
              >
                <V />
                <div data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 bg-night opacity-0" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Mobile and reduced motion: the same six steps, stacked. */
function Stacked() {
  const ref = useRef<HTMLOListElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Each step's card is dealt onto the table: it lands from below, turning flat.
        gsap.utils.toArray<HTMLElement>('[data-stage]').forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: 120, rotate: i % 2 ? 5 : -5, scale: 0.94, autoAlpha: 0 },
            {
              y: 0,
              rotate: 0,
              scale: 1,
              autoAlpha: 1,
              duration: dur.lg,
              ease: ease.out,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <ol ref={ref} className="gutter grid gap-[clamp(4rem,10vh,7rem)] pb-section">
      {flow.map((s, i) => {
        const V = visuals[s.id as keyof typeof visuals]
        return (
          <li key={s.id} className="grid gap-6 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5">
              <p className="numeric text-sm text-fg-dim">
                <span className="text-fg">{pad(i + 1)}</span> / {pad(beats.length)}
              </p>
              <SplitReveal as="h3" by="lines" className="display mt-3 text-[clamp(3rem,13vw,7rem)] leading-[1.02]">
                {s.word}
              </SplitReveal>
              <p className="mt-5 font-display text-[1.35rem] font-medium tracking-[-0.03em]">{s.title}</p>
              <p className="mt-2 max-w-[40ch] leading-relaxed text-fg-dim">{s.body}</p>
            </div>
            <div data-stage className="min-h-[22rem] rounded-[24px] border hairline bg-[linear-gradient(165deg,#15181e,#0c0d10)] p-6 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.07)] md:col-span-7 md:min-h-[28rem]">
              <V />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function Flow() {
  const pinned = useMedia(PIN_QUERY)
  return (
    <section id="how" aria-labelledby="how-title" className="relative">
      <Intro />
      {pinned ? <Pinned /> : <Stacked />}
    </section>
  )
}
