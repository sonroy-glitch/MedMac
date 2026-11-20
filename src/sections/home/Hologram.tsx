import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  backRegions,
  bodyOutline,
  frontRegions,
  pulseAt,
  regions,
  skeleton,
  suggestDepartment,
  VIEW,
  type RegionId,
} from '../../data/body'
import { dur, ease, gsap, media, useGSAP } from '../../lib/motion'
import { SplitReveal } from '../../components/SplitReveal'
import { Close, Flip } from '../../components/Icons'

type View = 'front' | 'back'
const order: RegionId[] = ['head', 'chest', 'abdomen', 'back', 'arms', 'legs']
const viewOf = (id: RegionId): View | null => (id === 'back' ? 'back' : id === 'chest' || id === 'abdomen' ? 'front' : null)

const { cx: CX } = VIEW
/** Projector rings around the figure: chest, knees, feet. */
const RINGS = [
  { y: 150, rx: 72, ry: 11 },
  { y: 334, rx: 50, ry: 8 },
  { y: 440, rx: 66, ry: 11 },
]
const backArc = ({ y, rx, ry }: (typeof RINGS)[number]) => `M${CX - rx} ${y} A${rx} ${ry} 0 0 1 ${CX + rx} ${y}`
const frontArc = ({ y, rx, ry }: (typeof RINGS)[number]) => `M${CX + rx} ${y} A${rx} ${ry} 0 0 1 ${CX - rx} ${y}`

/** Motes rising off the projector disc. Fixed positions so renders are stable. */
const MOTES = Array.from({ length: 18 }, (_, i) => ({ x: CX + Math.sin(i * 2.39) * 90, r: 0.8 + (i % 3) * 0.5 }))

const HOLO = '#7fdbff'
const layer = 'absolute inset-0 h-full w-full overflow-visible'
const BONE = '#d8f6ff'

/* The figure box has the viewBox's exact aspect, so viewBox units map straight to percentages. */
const X0 = -40
const VW = 520
const VH = 492
const pctX = (x: number) => `${((x - X0) / VW) * 100}%`
const pctY = (y: number) => `${(y / VH) * 100}%`
/** The scan runs from y=14 to y=442. */
const SCAN = { top: 14, travel: 428 }
/** The body's silhouette as a CSS mask, so the scan band can move on the compositor and stay clipped. */
const BODY_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${X0} 0 ${VW} ${VH}' preserveAspectRatio='none'><path d='${bodyOutline}'/></svg>`,
)}")`
const MOTE_RISE = (i: number) => 150 + (i % 5) * 30

function Body({
  view,
  selected,
  hover,
  onToggle,
  onHover,
}: {
  view: View
  selected: RegionId[]
  hover: RegionId | null
  onToggle: (id: RegionId) => void
  onHover: (id: RegionId | null) => void
}) {
  const ids = view === 'front' ? frontRegions : backRegions
  const bones = skeleton.filter(({ part }) => part === 'core' || part === view || (part === 'face' && view === 'front'))
  // From behind the ribs still read, just fainter.
  const ribsBehind = view === 'back' ? skeleton.find(({ part }) => part === 'front') : undefined
  const pings = selected.filter((id) => ids.includes(id)).flatMap((id) => pulseAt[id])

  return (
    // Stacked layers on one viewBox. The blurred, still parts are rasterised once; everything that
    // loops (the scan band and line, motes, pings) is a box moved by transform and opacity, which the
    // compositor runs without repainting anything.
    <div className="relative h-full w-full" aria-hidden="true">
    <svg viewBox="-40 0 520 492" className="h-full w-full overflow-visible">
      <defs>
        <clipPath id="holo-body">
          <path d={bodyOutline} />
        </clipPath>
        <linearGradient id="holo-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={HOLO} stopOpacity="0.34" />
          <stop offset="0.55" stopColor="#3aa6ff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#2f8cff" stopOpacity="0.12" />
        </linearGradient>
        <radialGradient id="holo-core" cx={CX} cy="150" r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#bdf0ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#bdf0ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="holo-disc">
          <stop offset="0" stopColor="#c6f3ff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor={HOLO} stopOpacity="0.45" />
          <stop offset="1" stopColor="#2f8cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam-l" gradientUnits="userSpaceOnUse" x1="-40" y1="492" x2="200" y2="170">
          <stop offset="0" stopColor={HOLO} stopOpacity="0.22" />
          <stop offset="1" stopColor={HOLO} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beam-r" gradientUnits="userSpaceOnUse" x1="480" y1="492" x2="240" y2="170">
          <stop offset="0" stopColor={HOLO} stopOpacity="0.22" />
          <stop offset="1" stopColor={HOLO} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scan-band" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={HOLO} stopOpacity="0" />
          <stop offset="1" stopColor={HOLO} stopOpacity="0.22" />
        </linearGradient>
        <filter id="holo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="holo-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* light beams from the bottom corners */}
      <g style={{ mixBlendMode: 'screen' }} filter="url(#holo-soft)">
        <path d="M-40 492 L20 492 L204 186 L198 182 Z" fill="url(#beam-l)" />
        <path d="M480 492 L420 492 L236 186 L242 182 Z" fill="url(#beam-r)" />
      </g>

      {/* projector disc */}
      <ellipse cx={CX} cy="446" rx="150" ry="26" fill="url(#holo-disc)" opacity="0.55" />
      {[128, 100, 72].map((rx, i) => (
        <ellipse key={rx} cx={CX} cy="446" rx={rx} ry={rx * 0.17} fill="none" stroke={HOLO} strokeOpacity={0.22 + i * 0.16} />
      ))}
      <ellipse cx={CX} cy="446" rx="38" ry="5.5" fill="#e8fbff" opacity="0.85" filter="url(#holo-soft)" />

      {/* back halves of the rings sit behind the body */}
      {RINGS.map((r) => (
        <path key={`b${r.y}`} d={backArc(r)} fill="none" stroke={HOLO} strokeOpacity="0.35" strokeWidth="1.2" />
      ))}

      {/* the body: glow, translucent skin, inner light, contour lines */}
      <path d={bodyOutline} fill="none" stroke={HOLO} strokeWidth="5" opacity="0.5" filter="url(#holo-glow)" />
      <path d={bodyOutline} fill="url(#holo-fill)" />
      <g clipPath="url(#holo-body)">
        <rect x="0" y="0" width="440" height="470" fill="url(#holo-core)" />
        <g stroke={HOLO} strokeOpacity="0.09" strokeWidth="0.6">
          {Array.from({ length: 75 }, (_, i) => (
            <line key={i} x1="0" x2="440" y1={14 + i * 6} y2={14 + i * 6} />
          ))}
        </g>
      </g>
    </svg>

    {/* the scan band: moved by a CSS transform, clipped to the body by a static mask */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 motion-reduce:hidden"
      style={{ maskImage: BODY_MASK, WebkitMaskImage: BODY_MASK, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }}
    >
      <div className="holo-sweep absolute" style={{ left: pctX(0), width: `${(440 / VW) * 100}%`, top: pctY(SCAN.top), height: pctY(SCAN.travel) }}>
        <div className="absolute inset-x-0 bottom-full" style={{ height: `${(60 / SCAN.travel) * 100}%`, background: 'linear-gradient(rgb(127 219 255 / 0), rgb(127 219 255 / 0.22))' }} />
      </div>
    </div>

    <svg viewBox="-40 0 520 492" className={layer}>

      {/* skeleton */}
      <g fill={BONE} stroke={BONE} strokeLinecap="round" strokeLinejoin="round">
        {ribsBehind && <path d={ribsBehind.d} fill="none" strokeOpacity="0.28" strokeWidth="0.9" />}
        <g filter="url(#holo-soft)" opacity="0.7">
          {bones.map(({ d, part }) => (
            <path key={part + d.length} d={d} fillOpacity={part === 'core' ? 0.14 : 0} strokeWidth="1.6" />
          ))}
        </g>
        {bones.map(({ d, part }) => (
          <path key={part + d.length} d={d} fillOpacity={part === 'core' ? 0.1 : 0} strokeOpacity="0.85" strokeWidth="1" />
        ))}
      </g>

      <path d={bodyOutline} fill="none" stroke="#a8ecff" strokeWidth="1.3" />

      {/* front halves of the rings: the soft halo here, the turning dashes on the layer above */}
      {RINGS.map((r) => (
        <path key={`f${r.y}`} d={frontArc(r)} fill="none" stroke={HOLO} strokeWidth="3" opacity="0.35" filter="url(#holo-soft)" />
      ))}
    </svg>

    <svg viewBox="-40 0 520 492" className={layer}>
      {/* tappable regions, clipped to the body: their own layer, so a hover fade repaints only them */}
      <g clipPath="url(#holo-body)">
        {ids.map((id) => {
          const on = selected.includes(id)
          const hot = hover === id
          return (
            <g
              key={id}
              onPointerEnter={() => onHover(id)}
              onPointerLeave={() => onHover(null)}
              onClick={() => onToggle(id)}
              className="cursor-pointer"
            >
              {regions[id].d.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill={HOLO}
                  fillOpacity={on ? 0.36 : hot ? 0.18 : 0}
                  style={{ transition: 'fill-opacity .35s var(--ease-out-expo)' }}
                />
              ))}
            </g>
          )
        })}
      </g>

    </svg>

    <svg viewBox="-40 0 520 492" className={`${layer} pointer-events-none`}>
      {RINGS.map((r) => (
        <path key={`d${r.y}`} d={frontArc(r)} fill="none" stroke="#c9f4ff" strokeWidth="1.4" strokeDasharray="44 10 4 10" />
      ))}

      {/* selection pulses: the dots */}
      {pings.map(([x, y]) => (
        <circle key={`${x},${y}`} cx={x} cy={y} r="3" fill="#e8fbff" />
      ))}
    </svg>

    {/* and their rings, as boxes so the compositor can scale them */}
    {pings.map(([x, y]) => (
      <span
        key={`${x},${y}`}
        aria-hidden="true"
        className="holo-ping pointer-events-none absolute aspect-square rounded-full border border-[#e8fbff]"
        style={{ left: pctX(x - 6), top: pctY(y - 6), width: `${(12 / VW) * 100}%` }}
      />
    ))}

    {/* motes rising off the disc and the scan line: compositor-only transform and opacity loops */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      {MOTES.map(({ x, r }, i) => (
        <span
          key={i}
          className="holo-mote absolute"
          style={{
            left: pctX(x - r),
            width: `${((2 * r) / VW) * 100}%`,
            top: pctY(440 - MOTE_RISE(i)),
            height: pctY(MOTE_RISE(i)),
            animationDuration: `${4 + (i % 4)}s`,
            animationDelay: `${(i * 0.37) % 4}s`,
          }}
        >
          <span className="absolute inset-x-0 bottom-0 aspect-square translate-y-1/2 rounded-full bg-[#d8f6ff]" />
        </span>
      ))}
    </div>
    <div aria-hidden="true" className="holo-sweep pointer-events-none absolute" style={{ left: pctX(40), width: `${(360 / VW) * 100}%`, top: pctY(SCAN.top), height: pctY(SCAN.travel) }}>
      <div className="absolute inset-x-0 top-0 h-px -translate-y-1/2 bg-holo/70" />
    </div>
    </div>
  )
}

export function Hologram() {
  const ref = useRef<HTMLElement>(null)
  const figure = useRef<HTMLDivElement>(null)
  const dept = useRef<HTMLParagraphElement>(null)
  const [view, setView] = useState<View>('front')
  const [selected, setSelected] = useState<RegionId[]>([])
  const [hover, setHover] = useState<RegionId | null>(null)
  const prev = useRef<RegionId[]>([])
  const department = suggestDepartment(selected)

  const flipTo = (next: View) => {
    if (next === view) return
    const el = figure.current
    if (!el || window.matchMedia(media.reduce).matches) return setView(next)
    gsap
      .timeline()
      .to(el, { scaleX: 0, duration: dur.xs, ease: 'power2.in' })
      .add(() => setView(next))
      .to(el, { scaleX: 1, duration: dur.sm, ease: ease.funk })
  }

  const toggle = (id: RegionId) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
    const v = viewOf(id)
    if (v && !selected.includes(id)) flipTo(v)
  }

  // The scan sweep, rising motes and pings are CSS loops (index.css) that run only under [data-live]:
  // once the figure has risen in, and while it is near the screen. Starting them while the figure is
  // still hidden would keep them off the compositor, so the reveal sets `revealed` when it lands.
  const revealed = useRef(false)
  const onScreen = useRef(false)
  const syncLive = () => figure.current?.toggleAttribute('data-live', revealed.current && onScreen.current)
  useEffect(() => {
    const el = figure.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen.current = e.isIntersecting
        syncLive()
      },
      { rootMargin: '15% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The navy ground opening out of the night, and the figure rising in.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        gsap.fromTo(
          '[data-ground]',
          { clipPath: 'circle(10% at 66% 60%)' },
          {
            clipPath: 'circle(150% at 66% 60%)',
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top 95%', end: 'top 35%', scrub: true },
          },
        )
        gsap.from(figure.current, {
          yPercent: 6,
          scale: 0.9,
          autoAlpha: 0,
          duration: dur.xl,
          ease: ease.out,
          scrollTrigger: { trigger: ref.current, start: 'top 55%', once: true },
          onComplete() {
            revealed.current = true
            syncLive()
          },
        })
      })
      // Without motion the figure is simply there (and the loops stay off in CSS anyway).
      mm.add(media.reduce, () => {
        revealed.current = true
        syncLive()
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  // Chips and the department react to selection.
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || window.matchMedia(media.reduce).matches) {
      prev.current = selected
      return
    }
    const added = selected.filter((id) => !prev.current.includes(id))
    prev.current = selected
    const ctx = gsap.context(() => {
      added.forEach((id) => {
        gsap.from(`[data-chip="${id}"]`, { yPercent: 120, rotate: -4, autoAlpha: 0, duration: dur.md, ease: ease.funk, stagger: 0.06 })
      })
    }, root)
    return () => ctx.revert()
  }, [selected, view])

  useLayoutEffect(() => {
    if (!dept.current || !department || window.matchMedia(media.reduce).matches) return
    const t = gsap.fromTo(dept.current, { yPercent: 105 }, { yPercent: 0, duration: dur.md, ease: ease.funk })
    return () => {
      t.kill()
    }
  }, [department])

  const chips = selected.flatMap((id) => regions[id].chips.map((c) => ({ id, c })))

  return (
    <section ref={ref} aria-labelledby="holo-title" className="theme-holo relative overflow-hidden bg-transparent">
      <div data-ground aria-hidden="true" className="absolute inset-0 bg-holo-ground">
        {/* grid floor and a cool bloom behind the figure */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgb(127 219 255 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(127 219 255 / 0.07) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(75% 70% at 66% 55%, #000 30%, transparent 85%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(40% 45% at 68% 58%, rgb(47 140 255 / 0.22), transparent 70%)' }}
        />
      </div>

      <div className="relative gutter grid gap-10 py-section md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 md:pt-6 lg:col-span-4">
          <SplitReveal as="h2" id="holo-title" by="lines" className="display text-[clamp(2.4rem,5.4vw,5.6rem)]">
            Point at where it hurts.
          </SplitReveal>
          <p className="mt-6 max-w-[40ch] leading-relaxed text-fg-dim">
            The kiosk shows a body the patient can turn and tap. Try it: tap the figure, or pick one or more areas here.
          </p>

          <div role="group" aria-label="Body areas" className="mt-8 flex flex-wrap gap-2">
            {order.map((id) => {
              const on = selected.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(id)}
                  onPointerEnter={() => setHover(id)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(id)}
                  onBlur={() => setHover(null)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    on ? 'border-holo bg-holo text-holo-ground' : 'border-line text-fg hover:border-holo/70'
                  }`}
                >
                  {regions[id].label}
                </button>
              )
            })}
          </div>

          <div className="mt-10 border-t border-line pt-6" aria-live="polite">
            {department ? (
              <>
                <p className="text-sm text-fg-dim">Suggested department</p>
                <div className="mt-1 overflow-hidden">
                  <p ref={dept} className="font-display text-[clamp(1.7rem,2.8vw,2.8rem)] font-bold tracking-[-0.035em] text-holo">
                    {department}
                  </p>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Common complaints for these areas">
                  {chips.map(({ id, c }) => (
                    <li key={`${id}-${c}`} className="overflow-hidden">
                      <span data-chip={id} className="inline-flex items-center gap-2 rounded-full bg-fg/[0.07] px-3 py-1.5 text-sm text-fg">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-holo" />
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="mt-6 inline-flex items-center gap-2 text-sm text-fg-dim hover:text-fg"
                >
                  <Close className="h-4 w-4" /> Clear
                </button>
              </>
            ) : (
              <p className="text-fg-dim">Nothing selected yet. The suggested department will appear here.</p>
            )}
          </div>

        </div>

        <div className="relative flex flex-col items-center md:col-span-7 md:self-center lg:col-span-8">
          <div className="relative flex aspect-[520/492] max-h-[min(82vh,50rem)] w-full items-center justify-center">
            <div ref={figure} className="relative aspect-[520/492] h-full max-w-full">
              <Body view={view} selected={selected} hover={hover} onToggle={toggle} onHover={setHover} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-6 text-sm">
            <p className="numeric text-fg-dim">{view === 'front' ? 'Front' : 'Back'} view</p>
            <button
              type="button"
              onClick={() => flipTo(view === 'front' ? 'back' : 'front')}
              className="inline-flex items-center gap-2 rounded-full border border-holo/40 px-4 py-2 font-medium text-holo transition-colors hover:border-holo"
            >
              <Flip className="h-4 w-4" /> Turn around
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
