import { useEffect, useRef, useState, type ReactNode } from 'react'
import { greetings, site } from '../../data/site'
import { dur, ease, gsap, media, SplitText, stagger, useGSAP } from '../../lib/motion'
import { scrollToTarget } from '../../lib/scroll'
import { useMedia } from '../../hooks/useMedia'
import { useTransition } from '../../components/Transition'
import { Button } from '../../components/Button'
import { Kiosk } from '../../components/Kiosk'
import { PulseLine } from './PulseLine'
import kioskSmall from '../../assets/kiosk-sizes/medmac-kiosk-683.webp'

const LINES = ['From vitals', 'to the right', 'doctor’s queue.']

/** Drop a real product shot into src/assets/kiosk/ and it replaces the drawing here. */
const photos = Object.values(
  import.meta.glob<string>('/src/assets/kiosk/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' }),
)
/** A smaller copy of the kiosk photo for phones and 1x screens; the full file stays for large retina screens. */
const photoSet = photos[0]?.includes('medmac-kiosk') ? `${kioskSmall} 683w, ${photos[0]} 1024w` : undefined

/** The kiosk's idle screen, used only when there is no product photo. */
function WelcomeScreen() {
  const reduce = useMedia(media.reduce)
  const [i, setI] = useState(1)
  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setI((n) => (n + 1) % greetings.length), 2200)
    return () => window.clearInterval(id)
  }, [reduce])
  const g = greetings[i]

  return (
    <div className="theme-holo flex h-full flex-col bg-[radial-gradient(130%_70%_at_50%_0%,#123a63,#060a12_72%)] p-[7cqw]">
      <div className="flex items-center justify-between text-[3.8cqw] text-fg-dim">
        <span>OPD · Kiosk 03</span>
        <span className="numeric">09:41</span>
      </div>
      <div className="mt-[12cqw] h-[19cqw] overflow-hidden">
        <p
          key={g.name}
          className={`font-script text-[13cqw] font-medium leading-[1.4] ${reduce ? '' : 'animate-[greet_2.2s_var(--ease-out-expo)_both]'}`}
        >
          {g.native}
        </p>
      </div>
      <p className="text-[6.2cqw] font-medium leading-[1.15] tracking-[-0.02em]">How can we help you today?</p>
      <p className="mt-auto rounded-full bg-ember py-[3.6cqw] text-center text-[4.6cqw] font-bold text-ink">Tap to begin</p>
    </div>
  )
}

/* ---------- the cards the machine deals out ---------- */

const glyph = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path d={d} {...glyph} />
    </svg>
  )
}

const ICON = {
  pulse: 'M2 11h3.5l2-5 3 9 2.4-7 1.6 3H18',
  mic: 'M10 2.5a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-5 0V5A2.5 2.5 0 0 1 10 2.5Zm-5.5 7a5.5 5.5 0 0 0 11 0M10 15v2.5',
  pin: 'M10 18s-5.5-5-5.5-9a5.5 5.5 0 0 1 11 0c0 4-5.5 9-5.5 9Zm0-7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  ticket: 'M3 6.5V5h14v1.5a2 2 0 0 0 0 4V15H3v-4.5a2 2 0 0 0 0-4ZM12 5v10',
}

type HeroCard = {
  id: string
  /** Where the card sits around the machine, per breakpoint. */
  place: string
  /** Pointer parallax depth: higher moves more. */
  depth: number
  tone?: 'ember'
  icon: keyof typeof ICON
  label: string
  body: ReactNode
}

const CARDS: HeroCard[] = [
  {
    id: 'voice',
    place: 'right-[-5%] top-[-3%] md:right-[-4%] md:top-[9%] lg:right-[-12%] short:hidden',
    depth: 1.2,
    icon: 'mic',
    label: 'Listening · Hindi',
    body: (
      <>
        <span className="font-script block text-[1.15em] leading-[1.35]">घुटने में दर्द है</span>
        <span className="block text-fg-dim">“My knee hurts.”</span>
      </>
    ),
  },
  {
    id: 'vitals',
    place: 'left-[-3%] top-[42%] md:left-[-8%] md:top-[25%] lg:left-[-24%]',
    depth: 0.8,
    icon: 'pulse',
    label: 'Blood pressure',
    body: (
      <span className="numeric flex items-baseline gap-1.5">
        <span className="font-display text-[1.9em] font-bold leading-none tracking-[-0.04em]">118/76</span>
        <span className="text-fg-dim">mmHg</span>
      </span>
    ),
  },
  {
    id: 'match',
    place: 'hidden md:block md:left-[-6%] md:top-[60%] lg:left-[-17%] short:hidden',
    depth: 1.5,
    icon: 'pin',
    label: 'Left knee → suggested',
    body: <span className="font-display text-[1.35em] font-bold tracking-[-0.03em]">Orthopaedics</span>,
  },
  {
    id: 'token',
    place: 'right-[-5%] top-[68%] md:right-[-4%] md:top-[66%] lg:right-[-12%]',
    depth: 1,
    tone: 'ember',
    icon: 'ticket',
    label: 'Paid · in the queue',
    body: (
      <span className="flex items-baseline justify-between gap-3">
        <span className="numeric font-display text-[1.9em] font-bold leading-none tracking-[-0.04em] text-ember">A-17</span>
        <span className="text-fg-dim">3 ahead</span>
      </span>
    ),
  },
]

function Card({ card }: { card: HeroCard }) {
  const ember = card.tone === 'ember'
  return (
    <div data-depth={card.depth} className={`absolute z-10 w-[min(38vw,9.5rem)] md:w-[11.5rem] lg:w-[13.5rem] short:w-[9.5rem] ${card.place}`}>
      <div data-card>
        <div
          className={`rounded-[18px] border p-3 text-[0.68rem] leading-snug shadow-[0_24px_50px_-20px_rgb(0_0_0/0.85)] md:p-4 md:text-[0.8rem] short:p-3 short:text-[0.68rem] ${
            ember
              ? 'border-ember/40 bg-[#14110c]/80 text-fg backdrop-blur-xl'
              : 'border-white/10 bg-[#0d1119]/75 text-fg backdrop-blur-xl'
          }`}
        >
          <p className={`mb-2 flex items-center gap-1.5 ${ember ? 'text-ember' : 'text-signal'}`}>
            <Glyph d={ICON[card.icon]} />
            <span className="text-fg-dim">{card.label}</span>
          </p>
          {card.body}
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { ready } = useTransition()

  // The ECG and the live-signal ping only run while the hero is on screen.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-offscreen', !e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        const root = ref.current!
        const lines = root.querySelectorAll<HTMLElement>('[data-line]')
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root)
        const ping = root.querySelector<HTMLElement>('[data-ping]')
        if (!ready) {
          gsap.set([lines, '[data-rise]', '[data-pulse]', '[data-machine]', '[data-halo]', cards], { autoAlpha: 0 })
          return
        }
        gsap.set([lines, '[data-rise]'], { autoAlpha: 1 })
        const split = SplitText.create(lines, { type: 'chars', aria: 'none' })

        // Each card starts tucked into the machine's screen and is dealt out to its place.
        const stage = root.querySelector<HTMLElement>('[data-stage]')!.getBoundingClientRect()
        const home = { x: stage.left + stage.width * 0.45, y: stage.top + stage.height * 0.28 }
        const offset = (el: HTMLElement) => {
          const r = el.getBoundingClientRect()
          return { x: home.x - (r.left + r.width / 2), y: home.y - (r.top + r.height / 2) }
        }

        const tl = gsap.timeline()
        tl.fromTo('[data-halo]', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: dur.xl, ease: ease.out }, 0)
          .fromTo('[data-pulse]', { autoAlpha: 0, scaleX: 0.6 }, { autoAlpha: 1, scaleX: 1, duration: dur.xl, ease: ease.out }, 0)
          .fromTo(
            '[data-machine]',
            { autoAlpha: 0, y: 80, scale: 0.94, filter: 'blur(14px)', willChange: 'transform, filter' },
            { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: dur.xl, ease: ease.out, clearProps: 'filter,willChange' },
            0.05,
          )
          .from(split.chars, { yPercent: 118, rotate: 6, duration: dur.lg, ease: ease.out, stagger: stagger.char }, 0.1)
          .fromTo(
            cards,
            {
              autoAlpha: 0,
              x: (_i: number, el: HTMLElement) => offset(el).x,
              y: (_i: number, el: HTMLElement) => offset(el).y,
              scale: 0.3,
              rotate: (i: number) => (i % 2 ? 18 : -18),
            },
            { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: dur.lg, ease: ease.out, stagger: 0.12 },
            0.75,
          )
          .from('[data-rise]', { y: 28, autoAlpha: 0, duration: dur.lg, ease: ease.out, stagger: 0.08 }, 0.7)
          // The live-signal ping starts once its line is visible: a CSS loop that starts while hidden
          // never makes it onto the compositor and would restyle the page every frame.
          .call(() => ping?.classList.add('animate-ping'))

        // Leaving the hero: headline lifts away, the cards scatter upward at their own depths.
        const leave = { trigger: root, start: 'top top', end: 'bottom top', scrub: true }
        gsap.to('[data-headline]', { yPercent: -22, autoAlpha: 0.15, ease: 'none', scrollTrigger: leave })
        gsap.to('[data-machine-inner]', { yPercent: 10, scale: 0.94, ease: 'none', scrollTrigger: leave })
        gsap.to('[data-pulse]', { scaleY: 0.4, autoAlpha: 0.25, ease: 'none', scrollTrigger: leave })
        cards.forEach((c) => {
          const d = Number(c.parentElement!.dataset.depth)
          gsap.to(c, { yPercent: -90 * d, ease: 'none', scrollTrigger: leave })
        })
        return () => {
          split.revert()
          ping?.classList.remove('animate-ping')
        }
      })

      // A fine pointer tilts the machine.
      mm.add(`${media.motion} and ${media.finePointer}`, () => {
        const root = ref.current!
        const tilt = root.querySelector<HTMLElement>('[data-tilt]')!
        const rx = gsap.quickTo(tilt, 'rotationY', { duration: 1.2, ease: 'power3.out' })
        const ry = gsap.quickTo(tilt, 'rotationX', { duration: 1.2, ease: 'power3.out' })
        // The cards stay put; only the machine leans toward the pointer.
        const move = (e: PointerEvent) => {
          rx((e.clientX / window.innerWidth - 0.5) * 10)
          ry(-(e.clientY / window.innerHeight - 0.5) * 5)
        }
        root.addEventListener('pointermove', move)
        return () => root.removeEventListener('pointermove', move)
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [ready], revertOnUpdate: true },
  )

  return (
    <section ref={ref} className="relative overflow-hidden pb-[clamp(2rem,6vh,4rem)] pt-28">
      <div data-pulse className="absolute inset-x-0 top-[89%] hidden -translate-y-1/2 opacity-70 md:block">
        <PulseLine className="h-[clamp(4.5rem,10vh,7rem)] w-full" />
      </div>

      <div className="relative gutter grid gap-6 md:min-h-[calc(100svh-7rem-clamp(2rem,6vh,4rem))] md:grid-cols-12 md:items-center md:gap-8">
        <div className="relative z-20 md:col-span-6">
          <h1 data-headline className="display text-[clamp(2.75rem,11.5vw,4.5rem)] md:text-[clamp(2.75rem,6vw,6.25rem)]">
            <span className="sr-only">From vitals to the right doctor’s queue.</span>
            {LINES.map((l, i) => (
              <span key={l} aria-hidden="true" className="mask-line">
                <span data-line className={`block ${i === 1 ? 'text-fg-dim md:pl-[4vw]' : ''}`}>
                  {i === 2 ? (
                    <>
                      doctor’s queue<span className="text-ember">.</span>
                    </>
                  ) : (
                    l
                  )}
                </span>
              </span>
            ))}
          </h1>

          <p data-rise className="mt-5 max-w-[34ch] text-[clamp(1.02rem,1.25vw,1.2rem)] font-medium leading-relaxed text-fg-dim md:mt-10">
            {site.tagline} Vitals, voice, a body you can point at, and payment. One stop.
          </p>
          <div data-rise className="mt-6 flex flex-wrap items-center gap-3 md:mt-8 md:gap-4">
            <Button kind="button" icon="down" onClick={() => scrollToTarget('#screens')}>
              See it work
            </Button>
            <Button kind="route" variant="ghost" to="/team" label="Team" icon="right">
              Who’s building it
            </Button>
          </div>
          <p data-rise className="numeric mt-10 hidden items-center gap-2 text-xs text-fg-dim md:flex">
            <span className="relative flex h-2 w-2">
              <span data-ping className="absolute inset-0 rounded-full bg-signal/60" />
              <span className="relative h-2 w-2 rounded-full bg-signal" />
            </span>
            <span className="font-bold text-fg">72</span> bpm · 118/76 mmHg
          </p>

        </div>

        <div className="relative flex justify-center md:col-span-6 md:col-start-7">
          {/* the machine's own light, spilling onto the floor around it */}
          <div
            data-halo
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[44%] h-[120%] w-[150%] -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(closest-side, rgb(74 163 255 / 0.22), rgb(74 163 255 / 0.06) 55%, transparent)' }}
          />
          <div data-machine className="relative [perspective:1400px]">
            <div data-stage className="relative">
              <div data-machine-inner>
                <div data-tilt className="relative [transform-style:preserve-3d]">
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[2%] left-1/2 h-[5%] w-[70%] -translate-x-1/2 rounded-[50%] bg-signal/40 blur-2xl"
                  />
                  {photos[0] ? (
                    <img
                      src={photos[0]}
                      srcSet={photoSet}
                      sizes={photoSet ? '(min-width: 768px) min(56vh, 33.4rem), min(42.7vh, 21.4rem)' : undefined}
                      width={1024}
                      height={1536}
                      fetchPriority="high"
                      alt={`The ${site.name} kiosk: a white standing machine with a blue-lit touchscreen, a blood pressure cuff on its left and a thermometer on its right.`}
                      className="relative h-[min(64svh,32rem)] w-auto select-none object-contain drop-shadow-[0_40px_60px_rgb(0_0_0/0.6)] md:h-[min(84svh,50rem)]"
                      draggable={false}
                    />
                  ) : (
                    <figure>
                      <Kiosk id="hero-kiosk" className="h-[min(64svh,32rem)] md:h-[min(84svh,50rem)]">
                        <WelcomeScreen />
                      </Kiosk>
                      <figcaption className="sr-only">
                        Illustration of the {site.name} kiosk: a standing machine like a bank ATM, with a touchscreen, a
                        fingertip sensor, a print slot and a cuff port on its side.
                      </figcaption>
                    </figure>
                  )}
                </div>
              </div>
              <div aria-hidden="true">
                {CARDS.map((c) => (
                  <Card key={c.id} card={c} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
