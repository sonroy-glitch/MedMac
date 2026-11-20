import { useRef, useState, useEffect } from 'react'
import { greetings } from '../../data/site'
import { bodyOutline, VIEW } from '../../data/body'
import { qrCells } from '../../lib/qr'
import { ease, gsap, media, useGSAP, whileVisible } from '../../lib/motion'
import { QrGrid, type QrGridHandle } from '../../components/QrGrid'
import { useMedia } from '../../hooks/useMedia'
import { useInView } from '../../hooks/useInView'

/** Each step's visual is the hero's pulse line, turned into something else. */

const stroke = {
  fill: 'none',
  stroke: 'var(--color-fg)',
  strokeWidth: 1.25,
  vectorEffect: 'non-scaling-stroke' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** An endless loop for one visual. It only runs while the visual is on screen. */
function useLoop(build: (tl: gsap.core.Timeline) => void | (() => void), scope: React.RefObject<HTMLElement | SVGSVGElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        const tl = gsap.timeline({ repeat: -1 })
        const done = build(tl)
        const stop = whileVisible(scope.current, tl)
        return () => {
          stop()
          tl.kill()
          done?.()
        }
      })
      return () => mm.revert()
    },
    { scope },
  )
}

/* 01 Screen: the line becomes an oscillometric cuff reading. */
const OSC = (() => {
  // Cuff deflating: a steady carrier whose amplitude swells and fades.
  const pts: string[] = []
  for (let x = 20; x <= 380; x += 2) {
    const t = (x - 20) / 360
    const env = Math.pow(Math.sin(t * Math.PI), 1.6) * 46 + 2
    pts.push(`${x} ${(140 - Math.sin(t * Math.PI * 2 * 15) * env).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
})()

export function ScreenVisual() {
  const ref = useRef<HTMLDivElement>(null)
  useLoop((tl) => {
    tl.fromTo('[data-osc]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, ease: 'power1.inOut' })
      .fromTo('[data-reading]', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: ease.out, stagger: 0.1 }, '-=0.5')
      .to({}, { duration: 1.6 })
      .to(['[data-osc]', '[data-reading]'], { autoAlpha: 0, duration: 0.4 })
      .set('[data-osc]', { autoAlpha: 1, strokeDashoffset: 1 })
  }, ref)
  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-center gap-6">
      <svg viewBox="0 0 400 220" className="w-full" aria-hidden="true">
        <line x1="20" x2="380" y1="140" y2="140" stroke="var(--color-line)" />
        <path data-osc d={OSC} {...stroke} pathLength={1} strokeDasharray="1" />
      </svg>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 numeric">
        {[
          ['Blood pressure', '118/76', 'mmHg'],
          ['Pulse', '72', 'bpm'],
          ['SpO₂', '98', '%'],
          ['Temperature', '36.8', '°C'],
        ].map(([k, v, u], i) => (
          <div key={k} data-reading className="border-t hairline pt-3">
            <dt className="text-xs text-fg-dim">{k}</dt>
            <dd className={`font-display text-[clamp(1.4rem,2.2vw,2.1rem)] font-medium tracking-[-0.03em] ${i === 0 ? 'text-accent' : ''}`}>
              {v}
              <span className="ml-1 font-sans text-xs font-normal tracking-normal text-fg-dim">{u}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* 02 Speak: the line becomes a voice, and the greeting changes script. */
export function SpeakVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useMedia(media.reduce)
  const [i, setI] = useState(0)
  // The greeting only changes while it can be seen: each swap mounts new text in a new script.
  const seen = useInView(ref)
  useEffect(() => {
    if (reduce || !seen) return
    const id = window.setInterval(() => setI((n) => (n + 1) % greetings.length), 1800)
    return () => window.clearInterval(id)
  }, [reduce, seen])
  useLoop((tl) => {
    tl.to('[data-bar]', {
      scaleY: () => gsap.utils.random(0.15, 1),
      duration: 0.22,
      ease: 'sine.inOut',
      stagger: { each: 0.025, from: 'center' },
      repeat: 7,
      yoyo: true,
      repeatRefresh: true,
    })
  }, ref)
  const g = greetings[i]
  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-center gap-10">
      <div className="h-[clamp(4rem,7vw,6.5rem)] overflow-hidden">
        <p key={g.name} className={`font-script ${reduce ? '' : 'animate-[greet_1.8s_var(--ease-out-expo)_both]'} text-[clamp(3rem,5.6vw,5.5rem)] font-medium leading-[1.2]`}>
          {g.native}
        </p>
      </div>
      <div className="flex h-36 items-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: 44 }, (_, n) => (
          <span
            key={n}
            data-bar
            className={`block h-full flex-1 origin-center rounded-full ${n === 21 || n === 22 ? 'bg-ember' : 'bg-fg/70'}`}
            style={{ transform: `scaleY(${0.12 + Math.abs(Math.sin(n * 0.7)) * 0.5})` }}
          />
        ))}
      </div>
      <p className="text-sm text-fg-dim">
        Heard as <span className="text-fg">{g.name}</span>. The kiosk answers in the same language.
      </p>
    </div>
  )
}

/* 03 Point: the line becomes a body; a touch lands on the knee. */
export function PointVisual() {
  const ref = useRef<HTMLDivElement>(null)
  useLoop((tl) => {
    tl.fromTo('[data-sil]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .fromTo('[data-touch]', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: ease.funk })
      .fromTo('[data-ripple]', { scale: 0.4, autoAlpha: 0.9 }, { scale: 3, autoAlpha: 0, duration: 1.2, ease: 'power2.out', repeat: 2 }, '<')
      .fromTo('[data-tag]', { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: ease.out }, '<0.2')
      .to({}, { duration: 1 })
      .to(['[data-touch]', '[data-tag]'], { autoAlpha: 0, duration: 0.4 })
  }, ref)
  const knee = { x: VIEW.cx + 20, y: 333 }
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center">
      <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="max-h-[min(62vh,30rem)] w-full" aria-hidden="true">
        <path data-sil d={bodyOutline} {...stroke} strokeOpacity={0.75} pathLength={1} strokeDasharray="1" />
        <g data-touch style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx={knee.x} cy={knee.y} r="6" fill="var(--color-ember)" />
        </g>
        <circle data-ripple cx={knee.x} cy={knee.y} r="6" fill="none" stroke="var(--color-ember)" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        {/* the patient's left knee is on the viewer's right */}
        <g data-tag>
          <path d={`M${knee.x + 12} ${knee.y} H${knee.x + 52}`} stroke="var(--color-ember)" strokeWidth="1.5" />
          <text x={knee.x + 60} y={knee.y + 5} fill="var(--color-fg)" fontSize="15" fontWeight="500" fontFamily="Satoshi, sans-serif">
            Left knee
          </text>
        </g>
      </svg>
    </div>
  )
}

/* 04 Match: three readings converge; one doctor lights up. */
const doctors = [
  { name: 'Dr. R. Menon', dept: 'General Medicine', y: 60 },
  { name: 'Dr. Anaya Kapoor', dept: 'Orthopaedics', y: 160 },
  { name: 'Dr. S. Iyer', dept: 'Cardiology', y: 260 },
]
const inputs = [
  { label: 'Vitals', y: 70 },
  { label: 'Words', y: 160 },
  { label: 'Body', y: 250 },
]

export function MatchVisual() {
  const ref = useRef<HTMLDivElement>(null)
  useLoop((tl) => {
    tl.fromTo('[data-wire]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.15 })
      .fromTo('[data-out]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' })
      .to('[data-pick]', { autoAlpha: 1, duration: 0.3 }, '-=0.1')
      .fromTo('[data-pick-dot]', { scale: 0 }, { scale: 1, duration: 0.6, ease: ease.funk }, '<')
      .to({}, { duration: 1.6 })
      .to(['[data-wire]', '[data-out]'], { strokeDashoffset: 1, duration: 0.5, ease: 'power2.in' })
      .to('[data-pick]', { autoAlpha: 0, duration: 0.3 }, '<')
  }, ref)
  return (
    <div ref={ref} className="h-full w-full">
      <svg viewBox="0 0 400 320" className="h-full w-full overflow-visible" aria-hidden="true">
        {inputs.map((n) => (
          <g key={n.label}>
            <text x="0" y={n.y + 4} fill="var(--color-fg-dim)" fontSize="13" fontFamily="Satoshi">
              {n.label}
            </text>
            <circle cx="62" cy={n.y} r="3" fill="var(--color-fg)" />
            <path data-wire d={`M62 ${n.y} C140 ${n.y} 140 160 200 160`} {...stroke} strokeOpacity={0.55} pathLength={1} strokeDasharray="1" />
          </g>
        ))}
        <circle cx="200" cy="160" r="9" fill="none" stroke="var(--color-fg)" />
        <circle cx="200" cy="160" r="2.5" fill="var(--color-fg)" />
        {doctors.map((d) => (
          <g key={d.name}>
            <path d={`M209 160 C260 160 250 ${d.y} 290 ${d.y}`} {...stroke} strokeOpacity={0.14} />
            <circle cx="292" cy={d.y} r="3" fill="var(--color-fg-dim)" />
            <text x="304" y={d.y - 2} fill="var(--color-fg)" fontSize="13" fontFamily="Satoshi">
              {d.name}
            </text>
            <text x="304" y={d.y + 14} fill="var(--color-fg-dim)" fontSize="11" fontFamily="Satoshi">
              {d.dept}
            </text>
          </g>
        ))}
        <path data-out d="M209 160 C260 160 250 160 290 160" fill="none" stroke="var(--color-ember)" strokeWidth={1.5} pathLength={1} strokeDasharray="1" vectorEffect="non-scaling-stroke" />
        <g data-pick style={{ opacity: 0 }}>
          <circle data-pick-dot cx="292" cy="160" r="6" fill="var(--color-ember)" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        </g>
      </svg>
    </div>
  )
}

/* 05 Pay: the code assembles, a scan crosses it, and it settles as paid. */
const cells = qrCells(21, 11)
export function PayVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const qr = useRef<QrGridHandle>(null)
  useLoop((tl) => {
    const grid = qr.current
    if (grid) tl.add(grid.reveal({ duration: 0.4, each: 0.0035, from: 'random', ease: ease.funk, over: 'on' }))
    tl.fromTo('[data-scan]', { yPercent: -10, autoAlpha: 0 }, { yPercent: 1000, autoAlpha: 1, duration: 1.1, ease: 'power1.inOut' })
      .to('[data-scan]', { autoAlpha: 0, duration: 0.2 })
      .to('[data-grid]', { autoAlpha: 0.06, scale: 0.92, duration: 0.5, ease: ease.out })
      .fromTo('[data-paid]', { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: ease.funk }, '<')
      .to({}, { duration: 1.8 })
      .to('[data-paid]', { autoAlpha: 0, duration: 0.3 })
      .set('[data-grid]', { autoAlpha: 1, scale: 1 })
    return () => qr.current?.full()
  }, ref)
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center">
      <div className="relative aspect-square w-[min(100%,22rem)]">
        <div data-grid className="h-full w-full" aria-hidden="true">
          <QrGrid ref={qr} cells={cells} size={21} gap={2} className="text-fg" />
        </div>
        <span data-scan aria-hidden="true" className="absolute inset-x-[-6%] top-0 h-[10%] border-b border-accent opacity-0" style={{ background: 'linear-gradient(to bottom, transparent, rgb(233 164 64 / 0.18))' }} />
        <div data-paid className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0">
          <p className="text-sm text-fg-dim">Orthopaedics</p>
          <p className="display numeric text-[clamp(4rem,7vw,6.5rem)]">₹300</p>
          <p className="mt-2 text-sm text-accent">Paid</p>
        </div>
      </div>
    </div>
  )
}

/* 06 Queue: the new token slides into the doctor's line as the one in front is called. */
const line = ['A-14', 'A-15', 'A-16']
export function QueueVisual() {
  const ref = useRef<HTMLDivElement>(null)
  useLoop((tl) => {
    tl.set('[data-q]', { y: 0, autoAlpha: 1 })
      .fromTo('[data-new]', { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: ease.out })
      .to({}, { duration: 1 })
      .to('[data-q="0"]', { autoAlpha: 0, x: -40, duration: 0.5, ease: 'power2.in' })
      .to('[data-q]:not([data-q="0"]), [data-new]', { y: '-=100%', duration: 0.7, ease: 'power3.inOut' }, '-=0.1')
      .to({}, { duration: 1.4 })
      .to(['[data-q]', '[data-new]'], { autoAlpha: 0, duration: 0.4 })
      .set('[data-q]', { x: 0 })
  }, ref)
  const row = 'flex items-center justify-between border-t hairline py-[clamp(0.8rem,1.6vh,1.1rem)]'
  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-center">
      <p className="flex justify-between text-sm text-fg-dim">
        <span>Dr. Anaya Kapoor · Orthopaedics</span>
        <span>Room 214</span>
      </p>
      <ol className="mt-6 overflow-hidden" aria-hidden="true">
        {line.map((t, i) => (
          <li key={t} data-q={i} className={`${row} text-fg-dim`}>
            <span className="numeric font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium tracking-[-0.03em]">{t}</span>
            <span className="text-xs">{i === 0 ? 'Now seeing' : `${i} ahead`}</span>
          </li>
        ))}
        <li data-new className={`${row} border-b`}>
          <span className="numeric font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium tracking-[-0.03em] text-accent">A-17</span>
          <span className="text-xs">You · 3 ahead</span>
        </li>
      </ol>
    </div>
  )
}

export const visuals = {
  screen: ScreenVisual,
  speak: SpeakVisual,
  point: PointVisual,
  match: MatchVisual,
  pay: PayVisual,
  queue: QueueVisual,
} as const
