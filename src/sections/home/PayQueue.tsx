import { useLayoutEffect, useRef, useState } from 'react'
import { qrCells } from '../../lib/qr'
import { dur, ease, gsap, media, useGSAP } from '../../lib/motion'
import { SplitReveal } from '../../components/SplitReveal'
import { Button } from '../../components/Button'
import { Check } from '../../components/Icons'
import { QrGrid, type QrGridHandle } from '../../components/QrGrid'

type Phase = 'ready' | 'scanning' | 'paid' | 'queued'

/** Invented for the demo. */
const visit = {
  doctor: 'Dr. Anaya Kapoor',
  department: 'Orthopaedics',
  room: 'Room 214',
  fee: '₹300',
  token: 'A-17',
  ahead: ['A-14', 'A-15', 'A-16'],
}
const cells = qrCells(25, 3)
const steps: { id: string; label: string; on: Phase[] }[] = [
  { id: 'pay', label: 'Pay', on: ['ready', 'scanning', 'paid', 'queued'] },
  { id: 'paid', label: 'Paid', on: ['paid', 'queued'] },
  { id: 'queue', label: 'Queue', on: ['queued'] },
]
const pad = (n: number) => String(n).padStart(2, '0')

const glass =
  'rounded-[28px] border hairline bg-[linear-gradient(165deg,#15181e,#0c0d10)] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.07)]'

export function PayQueue() {
  const ref = useRef<HTMLElement>(null)
  const deck = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const timers = useRef<number[]>([])
  const qr = useRef<QrGridHandle>(null)
  // The code pops in when the demo is replayed. On the first render it is far below the fold, so it starts drawn.
  const shown = useRef(false)

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const pay = () => {
    clear()
    const reduce = window.matchMedia(media.reduce).matches
    setPhase('scanning')
    later(() => setPhase('paid'), reduce ? 200 : 1700)
    later(() => setPhase('queued'), reduce ? 400 : 3000)
  }
  const replay = () => {
    clear()
    setPhase('ready')
  }

  // The outlined word that crosses into the next section, and the screen card dealt onto the table.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        gsap.fromTo(
          '[data-queue-word]',
          { xPercent: 12 },
          { xPercent: -38, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
        gsap
          .timeline({ scrollTrigger: { trigger: '[data-deck]', start: 'top 80%', once: true } })
          .from('[data-screen]', { y: 120, rotate: -7, autoAlpha: 0, duration: dur.xl, ease: ease.out })
          .from('[data-under]', { rotate: 0, autoAlpha: 0, duration: dur.lg, ease: ease.out, stagger: 0.08 }, '-=0.6')
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  // Each phase change redraws what the kiosk screen is showing.
  useLayoutEffect(() => {
    const el = deck.current
    if (!el || window.matchMedia(media.reduce).matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-view]', { y: 18, autoAlpha: 0, duration: dur.sm, ease: ease.out })
      if (phase === 'ready' && shown.current) {
        qr.current?.reveal({ duration: 0.35, each: 0.002, from: 'center', ease: ease.funk })
      }
      shown.current = true
      if (phase === 'scanning') {
        gsap.fromTo('[data-beam]', { yPercent: -100 }, { yPercent: 900, duration: 0.8, ease: 'sine.inOut', repeat: 1, yoyo: true })
      }
      if (phase === 'paid') {
        gsap.from('[data-ok]', { scale: 0, rotate: -30, duration: dur.md, ease: ease.funk })
      }
      if (phase === 'queued') {
        gsap.from('[data-row]', { y: 14, autoAlpha: 0, duration: dur.sm, ease: ease.out, stagger: 0.05 })
        // The token is printed out of the screen and lands beside it, like a ticket.
        gsap.from('[data-ticket]', { x: -120, y: -60, rotate: -14, scale: 0.7, autoAlpha: 0, duration: dur.lg, ease: ease.funk, delay: 0.25 })
      }
    }, el)
    return () => {
      ctx.revert()
      qr.current?.full()
    }
  }, [phase])

  const busy = phase === 'scanning' || phase === 'paid'

  return (
    <section ref={ref} aria-labelledby="pay-title" className="relative overflow-hidden pb-section">
      <p
        data-queue-word
        aria-hidden="true"
        className="display outline-type pointer-events-none select-none whitespace-nowrap text-[clamp(8rem,30vw,32rem)] leading-[0.8]"
      >
        Queue
      </p>

      <div className="gutter -mt-[clamp(2rem,9vw,9rem)] grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:sticky md:top-28 md:col-span-5 md:self-start md:pt-24">
          <SplitReveal as="h2" id="pay-title" by="lines" className="display text-[clamp(2.4rem,5.4vw,5.6rem)]">
            Paid, and already in line.
          </SplitReveal>
          <p className="mt-6 max-w-[42ch] leading-relaxed text-fg-dim">
            The kiosk shows a QR for the matched doctor’s fee. The patient pays from their phone, and the token lands in that
            doctor’s queue on its own. No counter, no slip of paper.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {phase === 'queued' ? (
              <Button kind="button" variant="ghost" icon="none" onClick={replay}>
                Run it again
              </Button>
            ) : (
              <Button kind="button" icon="none" onClick={pay} className={phase !== 'ready' ? 'pointer-events-none opacity-60' : ''}>
                Scan and pay
              </Button>
            )}
          </div>
        </div>

        <div ref={deck} data-deck className="relative mx-auto mb-28 w-full max-w-[29rem] md:mb-12 md:col-span-6 md:col-start-7 md:mt-24">
          {/* the rest of the deck, fanned out behind the screen card */}
          <div data-under aria-hidden="true" className="absolute inset-0 rotate-[5deg] opacity-40">
            <div className={`h-full w-full ${glass}`} />
          </div>
          <div data-under aria-hidden="true" className="absolute inset-0 -rotate-[3deg] opacity-60">
            <div className={`h-full w-full ${glass}`} />
          </div>

          <div data-screen className={`relative ${glass} flex min-h-[34rem] flex-col p-[clamp(1.4rem,3vw,2.25rem)]`}>
            <div className="flex items-center justify-between gap-3 text-xs text-fg-dim">
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${busy ? 'animate-pulse bg-ember' : 'bg-signal'}`} />
                On the kiosk screen
              </span>
              <span className="numeric">
                {visit.department} · {visit.room}
              </span>
            </div>

            <ol className="mt-5 grid grid-cols-3 gap-2 text-xs" aria-label="Payment progress">
              {steps.map((s, i) => {
                const lit = s.on.includes(phase)
                return (
                  <li
                    key={s.id}
                    aria-current={lit && !steps[i + 1]?.on.includes(phase) ? 'step' : undefined}
                    className={`border-t pt-2 transition-colors duration-500 ${lit ? 'border-ember text-fg' : 'hairline text-fg-dim'}`}
                  >
                    <span className="numeric mr-1.5 text-fg-dim">{pad(i + 1)}</span>
                    {s.label}
                  </li>
                )
              })}
            </ol>

            <div aria-live="polite" className="flex flex-1 flex-col">
              {(phase === 'ready' || phase === 'scanning') && (
                <div data-view className="flex flex-1 flex-col items-center justify-center gap-7 pt-6">
                  <div className="relative w-[min(62%,15rem)]">
                    <div
                      data-qr
                      role="img"
                      aria-label="Payment QR code"
                      className="aspect-square rounded-2xl border hairline bg-white/[0.03] p-4"
                    >
                      <QrGrid ref={qr} cells={cells} size={25} gap={2} radius={1} className="text-fg/80" />
                    </div>
                    {phase === 'scanning' && (
                      <span
                        data-beam
                        aria-hidden="true"
                        className="absolute inset-x-[-4%] top-0 h-[10%] border-b-2 border-ember bg-gradient-to-b from-transparent to-ember/20"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-display text-[1.6rem] font-bold tracking-[-0.03em]">
                      {phase === 'scanning' ? 'Waiting for payment…' : `Pay ${visit.fee}`}
                    </p>
                    <p className="mt-1.5 text-sm text-fg-dim">Consultation with {visit.doctor}</p>
                  </div>
                </div>
              )}

              {phase === 'paid' && (
                <div data-view className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
                  <span data-ok className="grid h-24 w-24 place-items-center rounded-full border border-ember/50 bg-ember/10 text-ember">
                    <Check className="h-10 w-10" />
                  </span>
                  <div>
                    <p className="font-display text-[1.8rem] font-bold tracking-[-0.03em]">Payment received</p>
                    <p className="numeric mt-1.5 text-sm text-fg-dim">{visit.fee} · UPI</p>
                  </div>
                </div>
              )}

              {phase === 'queued' && (
                <div data-view className="flex flex-1 flex-col pt-8">
                  <p className="text-sm text-fg-dim">{visit.doctor}’s queue</p>
                  <ol className="numeric mt-3">
                    {visit.ahead.map((t, i) => (
                      <li key={t} data-row className="flex items-center justify-between border-t hairline py-3.5 text-fg-dim">
                        <span className="font-display text-[1.6rem] font-medium tracking-[-0.03em]">{t}</span>
                        <span className="text-xs">{i === 0 ? 'Now seeing' : `~${i * 6} min`}</span>
                      </li>
                    ))}
                    <li data-row className="flex items-center justify-between border-y border-ember/40 py-3.5">
                      <span className="font-display text-[1.6rem] font-medium tracking-[-0.03em] text-ember">{visit.token}</span>
                      <span className="text-xs">You · {visit.ahead.length} ahead</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

          </div>

          {phase === 'queued' && (
            <div data-ticket className="absolute -bottom-28 right-[-2%] w-[11.5rem] rotate-[6deg] md:-bottom-12 md:right-[-14%]">
              <div className="rounded-[18px] border border-ember/40 bg-[#14110c]/90 p-4 text-[0.8rem] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.85)] backdrop-blur-xl">
                <p className="text-fg-dim">Your token</p>
                <p className="numeric mt-1 font-display text-[2.6rem] font-bold leading-none tracking-[-0.04em] text-ember">{visit.token}</p>
                <p className="mt-2 text-fg-dim">
                  {visit.room} · ~{visit.ahead.length * 6} min
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
