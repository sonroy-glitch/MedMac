import { useRef } from 'react'
import { site, stats } from '../../data/site'
import { gsap, media, useGSAP } from '../../lib/motion'

/**
 * Three face-down cards that turn over as they reach you, each counting up
 * to its figure. The figures live in src/data/site.ts.
 */
export function Numbers() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        gsap.utils.toArray<HTMLElement>('[data-stat]').forEach((el, i) => {
          const num = el.querySelector<HTMLElement>('[data-num]')!
          const turn = el.querySelector<HTMLElement>('[data-turn]')!
          const to = Number(num.dataset.num)
          const obj = { v: 0 }
          num.textContent = '0'
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 78%', once: true }, delay: i * 0.12 })
          tl.fromTo(
            turn,
            { rotateY: 180, rotateZ: i % 2 ? 4 : -4, y: 60 },
            { rotateY: 0, rotateZ: 0, y: 0, duration: 1.4, ease: 'expo.out' },
          ).to(
            obj,
            {
              v: to,
              duration: 1.6,
              ease: 'expo.out',
              onUpdate: () => {
                num.textContent = String(Math.round(obj.v))
              },
            },
            0.35,
          )
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  const offsets = ['', 'md:mt-[10vh]', 'md:mt-[20vh]']
  const tones = [
    'bg-[linear-gradient(165deg,#15181e,#0c0d10)]',
    'bg-[linear-gradient(165deg,#1a1610,#0d0c0a)] [&_[data-num]]:text-ember',
    'theme-holo bg-[linear-gradient(165deg,#0d2a4d,#050d1c)]',
  ]

  return (
    <section ref={ref} aria-labelledby="numbers-title" className="gutter relative py-section">
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <h2 id="numbers-title" className="display text-[clamp(2.2rem,4.6vw,4.6rem)] md:col-span-7">
          What one stop could mean for a busy outpatient floor.
        </h2>
      </div>

      <dl className="mt-16 grid items-start gap-6 md:-mb-[12vh] md:grid-cols-3 md:gap-8">
        {stats.map((s, i) => (
          <div key={s.label} data-stat className={`[perspective:1600px] ${offsets[i] ?? ''}`}>
            <dt className="sr-only">{s.label}</dt>
            <dd data-turn className="relative [transform-style:preserve-3d]">
              {/* the face */}
              <div
                className={`${tones[i]} flex aspect-[5/4] flex-col justify-between rounded-[26px] md:aspect-[4/5] border border-white/10 p-[clamp(1.5rem,2.4vw,2.25rem)] text-fg shadow-[0_40px_80px_-34px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.08)] [backface-visibility:hidden]`}
              >
                <span aria-hidden="true" className="flex items-center justify-between text-xs text-fg-dim">
                  <span>{site.name}</span>
                  <span className="numeric">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <span>
                  <span className="display block text-[clamp(5rem,10vw,10rem)] leading-[0.85]">
                    <span data-num={s.value}>{s.value}</span>
                    {s.suffix && (
                      <span className="ml-2 align-top font-sans text-[0.22em] font-medium tracking-normal text-fg-dim">{s.suffix.trim()}</span>
                    )}
                  </span>
                  <span aria-hidden="true" className="mt-5 block max-w-[24ch] text-balance leading-snug text-fg-dim">
                    {s.label}
                  </span>
                </span>
              </div>
              {/* the back: what you see before it turns over */}
              <div
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center rounded-[26px] border border-white/10 bg-[#0b0c0f] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgb(255 255 255 / 0.035) 0 1px, transparent 1px 14px), radial-gradient(circle at 50% 50%, rgb(74 163 255 / 0.16), transparent 60%)',
                }}
              >
                <svg viewBox="0 0 32 32" className="h-14 w-14">
                  <path d="M5 17h5.5l2.5-6 4 12 3-9 1.8 3H27" fill="none" stroke="#e9a440" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
