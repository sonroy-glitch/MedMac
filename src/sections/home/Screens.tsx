import { useRef, type ReactNode } from 'react'
import { screens, type ScreenCard } from '../../data/site'
import { bodyOutline, VIEW } from '../../data/body'
import { qrCells } from '../../lib/qr'
import { gsap, media, ScrollTrigger, useGSAP } from '../../lib/motion'
import { jumpScroll } from '../../lib/scroll'
import { SplitReveal } from '../../components/SplitReveal'
import { Check } from '../../components/Icons'

/* ---------- each card's face ---------- */

function SymptomsFace() {
  return (
    <svg viewBox={`40 0 ${VIEW.w - 80} ${VIEW.h}`} className="mx-auto h-full w-auto" aria-hidden="true">
      <defs>
        <radialGradient id="sc-knee">
          <stop offset="0" stopColor="#e9a440" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e9a440" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={bodyOutline} fill="var(--color-holo)" fillOpacity="0.08" stroke="var(--color-holo)" strokeOpacity="0.7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <circle cx={VIEW.cx + 20} cy="333" r="34" fill="url(#sc-knee)" />
      <circle cx={VIEW.cx + 20} cy="333" r="6" fill="#e9a440" />
    </svg>
  )
}

function ReportFace() {
  const rows = [
    ['Blood pressure', '118/76'],
    ['Pulse', '72 bpm'],
    ['SpO₂', '98%'],
    ['Temperature', '36.8 °C'],
  ]
  return (
    <div className="numeric flex h-full flex-col justify-center text-[0.72rem]">
      <p className="mb-2 flex justify-between border-b border-dashed border-fg/25 pb-2 text-fg-dim">
        <span>Screening</span>
        <span>18 Nov · 09:41</span>
      </p>
      {rows.map(([k, v]) => (
        <p key={k} className="flex justify-between py-1">
          <span className="text-fg-dim">{k}</span>
          <span className="font-bold">{v}</span>
        </p>
      ))}
      <p className="mt-2 border-t border-dashed border-fg/25 pt-2 text-fg-dim">Printed at the kiosk</p>
    </div>
  )
}

function DoctorFace() {
  const depts = ['Cardiology', 'Orthopaedics', 'Neurology']
  return (
    <ul className="flex h-full flex-col justify-center gap-2 text-[0.78rem]">
      {depts.map((d, i) => (
        <li
          key={d}
          className={`flex items-center justify-between rounded-full border px-3 py-1.5 ${
            i === 1 ? 'border-accent bg-accent/15 text-fg' : 'border-line text-fg-dim'
          }`}
        >
          {d}
          {i === 1 && <Check className="h-4 w-4 text-accent" />}
        </li>
      ))}
    </ul>
  )
}

const QR = qrCells(21, 11)
function PayFace() {
  return (
    <div className="flex h-full items-center justify-center">
      <svg viewBox="-1 -1 23 23" className="aspect-square h-[78%] rounded-[10px] bg-paper p-1.5" aria-hidden="true">
        {QR.map((on, i) => (on ? <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1.02" height="1.02" fill="#1a1206" /> : null))}
      </svg>
    </div>
  )
}

function LanguageFace() {
  const scripts = ['अ', 'ଅ', 'அ', 'అ', 'অ', 'A']
  return (
    <div className="grid h-full grid-cols-3 place-items-center">
      {scripts.map((s, i) => (
        <span key={s} className={`font-script text-[clamp(1.6rem,2.4vw,2.3rem)] leading-none ${i === 0 ? 'text-signal' : 'text-fg/80'}`}>
          {s}
        </span>
      ))}
    </div>
  )
}

const FACES: Record<ScreenCard['id'], { tone: string; face: ReactNode }> = {
  symptoms: { tone: 'bg-[linear-gradient(165deg,#161a21,#0c0e12)]', face: <SymptomsFace /> },
  report: { tone: 'theme-light bg-paper', face: <ReportFace /> },
  doctor: { tone: 'theme-holo bg-[linear-gradient(165deg,#0d2a4d,#050d1c)]', face: <DoctorFace /> },
  pay: { tone: 'theme-ember', face: <PayFace /> },
  language: { tone: 'bg-[linear-gradient(165deg,#13305a,#0a1221)]', face: <LanguageFace /> },
}

/* ---------- the deck ---------- */

/** Where each card lands in the fan, from the centre outwards. */
const fan = (i: number, n: number) => {
  const c = i - (n - 1) / 2
  return { xPercent: c * 72, rotate: c * 7, y: c * c * 16 }
}

export function Screens() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = ref.current!
      const cards = gsap.utils.toArray<HTMLElement>('[data-hand]', root)
      const n = cards.length
      const mm = gsap.matchMedia()

      // Desktop: the deck rises in, then the section pins and the hand fans open as you scroll.
      // Both only ever move forward: once the hand is open, scrolling back up leaves it open.
      mm.add({ deck: media.deck, motion: media.motion }, ({ conditions }) => {
        if (!conditions?.deck || !conditions.motion) return
        gsap.set(cards, { transformOrigin: '50% 115%' })
        const rise = gsap.fromTo('[data-deck]', { y: '28vh', rotate: -6 }, { y: 0, rotate: 0, ease: 'none', paused: true })
        ScrollTrigger.create({
          trigger: root,
          start: 'top bottom',
          end: 'top top',
          onUpdate: (self) => self.progress > rise.progress() && rise.progress(self.progress),
        })
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
        cards.forEach((card, i) => {
          const c = i - (n - 1) / 2
          tl.fromTo(
            card,
            { xPercent: 0, y: -i * 3, rotate: c * 1.6 },
            { ...fan(i, n), duration: 1, ease: 'power2.inOut' },
            Math.abs(c) * 0.06,
          )
        })
        tl.to({}, { duration: 0.35 })
        // Follows the scroll with the same 0.8s lag a scrub had, but never backwards.
        let reached = 0
        let follow: gsap.core.Tween | null = null
        const pin = ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: '+=130%',
          pin: true,
          onUpdate(self) {
            if (self.progress <= reached) return
            reached = self.progress
            follow?.kill()
            follow = gsap.to(tl, { progress: reached, duration: 0.8, ease: 'power3.out' })
          },
        })
        // Once the hand is fully open the pin has done its job. Release it the next time the
        // page comes to rest, so scrolling back up passes the section like any other. The
        // scroll position moves by the pin's length in the same frame, so nothing on screen shifts.
        const release = () => {
          if (reached < 1) return
          ScrollTrigger.removeEventListener('scrollEnd', release)
          follow?.kill()
          tl.progress(1)
          const { start, end } = pin
          const y = window.scrollY
          pin.kill(true)
          jumpScroll(y <= start ? y : y >= end ? y - (end - start) : start)
          ScrollTrigger.refresh()
        }
        ScrollTrigger.addEventListener('scrollEnd', release)
        return () => ScrollTrigger.removeEventListener('scrollEnd', release)
      })

      // Phones: the hand is dealt into the swipe row, one card after another, tilting flat as it lands.
      // (also tablets and phones on their side: the fan needs a wide and tall screen)
      mm.add({ deck: media.deck, motion: media.motion }, ({ conditions }) => {
        if (conditions?.deck || !conditions?.motion) return
        gsap.from(cards, {
          y: 90,
          x: -40,
          rotate: (i: number) => -10 + i * 3,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: '[data-deck]', start: 'top 85%', once: true },
        })
        // Then the row pins and scrolling walks it sideways: down slides the cards right to left,
        // up slides them back. Once the last card is in, the page scrolls on.
        const row = root.querySelector<HTMLElement>('[data-deck]')!
        const gutter = () => parseFloat(getComputedStyle(row).paddingLeft) || 0
        // Layout offsets, not bounding boxes: the deal-in's transforms must not shorten the slide.
        // The last card stops with the same gutter on its right as the first has on its left.
        const dist = () => {
          const last = cards[n - 1]
          const span = last.offsetLeft + last.offsetWidth - cards[0].offsetLeft
          return Math.max(0, span + 2 * gutter() - row.clientWidth)
        }
        gsap.set(row, { overflow: 'visible' })
        gsap.to(row, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            // the row's top is the cards' top; measured on the row so the deal-in offset can't skew it
            trigger: row,
            pin: row.parentElement,
            start: () => `top ${Math.max(0, (window.innerHeight - cards[0].offsetHeight) / 2)}px`,
            end: () => `+=${dist()}`,
            scrub: 0.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      })

      // Desktop without motion: the hand is already open.
      mm.add(`${media.deck} and ${media.reduce}`, () => {
        gsap.set(cards, { transformOrigin: '50% 115%' })
        cards.forEach((card, i) => gsap.set(card, fan(i, n)))
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section
      ref={ref}
      id="screens"
      aria-labelledby="screens-title"
      className="relative overflow-hidden pt-section deck:flex deck:h-[100svh] deck:flex-col deck:pb-[6vh] deck:pt-28"
    >
      <div className="gutter grid gap-6 md:grid-cols-12 md:gap-8">
        <SplitReveal as="h2" id="screens-title" by="lines" className="display text-[clamp(2.4rem,5.4vw,5.5rem)] md:col-span-7">
          One screen. Five ways in.
        </SplitReveal>
        <SplitReveal
          as="p"
          by="lines"
          delay={0.15}
          className="max-w-[38ch] self-end text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-fg-dim md:col-span-4 md:col-start-9"
        >
          The kiosk’s home screen, dealt out on the table. Every patient starts from these five buttons, in their own
          language.
        </SplitReveal>
      </div>

      <div className="relative mt-10 deck:mt-0 deck:flex-1">
        <ul
          data-deck
          aria-label="The kiosk’s home screen buttons"
          className="gutter flex snap-x snap-mandatory gap-4 overflow-x-auto pb-section [scrollbar-width:none] deck:absolute deck:inset-0 deck:block deck:overflow-visible deck:p-0 [&::-webkit-scrollbar]:hidden"
        >
          {screens.map((s, i) => {
            const f = FACES[s.id]
            return (
              <li
                key={s.id}
                data-hand
                style={{ zIndex: i === 2 ? 6 : 5 - Math.abs(i - 2) }}
                className="w-[min(72vw,17rem)] shrink-0 snap-center deck:absolute deck:bottom-[8vh] deck:left-1/2 deck:ml-[calc(var(--cw)/-2)] deck:w-[var(--cw)] deck:hover:z-20! [--cw:min(17rem,16vw,34svh)]"
              >
                <div
                  className={`${f.tone} flex aspect-[5/7] flex-col overflow-hidden rounded-[22px] border border-white/10 p-[clamp(1rem,1.4vw,1.4rem)] text-fg shadow-[0_30px_60px_-24px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.08)] transition-transform duration-700 ease-out-expo deck:hover:-translate-y-10`}
                >
                  <div aria-hidden="true" className="min-h-0 flex-1 pb-4">
                    {f.face}
                  </div>
                  <h3 className="font-display text-[clamp(1.25rem,1.6vw,1.6rem)] font-bold leading-[1.05] tracking-[-0.03em]">{s.title}</h3>
                  <p className="mt-2 text-[0.85rem] leading-snug text-fg-dim">{s.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
