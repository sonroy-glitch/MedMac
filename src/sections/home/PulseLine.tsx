/** One heartbeat, 600 units wide, baseline at y=100. The spike peaks at x≈100. */
const BEAT = 'h40 l12 -10 l12 10 h20 l10 -74 l14 150 l10 -76 h28 l16 -16 l16 16 h422'
const TRACE = `M0 100 ${Array.from({ length: 4 }, () => BEAT).join(' ')}`
/** The writing head, in viewBox units of 1200. A spike reaches it 0.15s into each loop. */
const HEAD_X = 800
const HEAD_PCT = `${(HEAD_X / 1200) * 100}%`

/*
 * The fade that hides the trace past the head and at the far left, as a CSS
 * mask on the box. Same stops as the old SVG mask: its gradient ran across a
 * rect from x=-10 to x=1210, so offset o sits at (-10 + 1220·o) / 1200.
 */
const at = (o: number) => `${(((-10 + 1220 * o) / 1200) * 100).toFixed(3)}%`
const FADE = `linear-gradient(to right, transparent ${at(0)}, #000 ${at(0.16)}, #000 ${at(HEAD_X / 1200)}, transparent ${at(HEAD_X / 1200 + 0.002)})`

/**
 * The hero's living background: an ECG trace that scrolls under a fixed
 * writing head, which sits at the kiosk's foot: the heartbeat runs into the
 * machine. A small glow at the head flares each time a spike passes.
 *
 * Pure CSS keyframes on transform, scale and opacity (see index.css), so the
 * compositor runs it without the main thread: no per-frame SVG relayout or
 * repaint. It holds still when the hero is off screen (data-offscreen) and
 * under reduced motion.
 */
export function PulseLine({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none relative ${className}`}>
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        {/* the flat line the trace is about to write over */}
        <line x1={HEAD_X} x2="1200" y1="100" y2="100" stroke="var(--color-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-0" style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
        {/* Two widths of the box, so one beat (600 units) is a quarter of the strip. */}
        <div className="pulse-trace absolute inset-y-0 left-0 w-[200%]">
          <svg viewBox="0 0 2400 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path
              d={TRACE}
              fill="none"
              stroke="var(--color-fg)"
              strokeOpacity="0.6"
              strokeWidth="1.25"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
      <span
        className="pulse-glow absolute top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{
          left: HEAD_PCT,
          background: 'radial-gradient(closest-side, rgb(233 164 64 / 0.4), transparent)',
        }}
      />
      <span
        className="pulse-head absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember"
        style={{ left: HEAD_PCT, boxShadow: '0 0 12px 2px rgb(233 164 64 / 0.7)' }}
      />
    </div>
  )
}
