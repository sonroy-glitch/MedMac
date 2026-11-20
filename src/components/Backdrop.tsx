/** Inline SVG noise, tiled. About 1 KB, no request. */
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`

/**
 * The fixed environment behind the page: graphite night, the kiosk's blue
 * light in two slow pools drifting on 70–90 s loops, and a fine grain.
 * Themed sections (holo, ember) paint their own ground over it.
 */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      <div
        className="absolute -right-[16vw] -top-[24vh] h-[86vh] w-[72vw] rounded-full [animation:drift-a_74s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(closest-side, rgb(74 163 255 / 0.16), rgb(74 163 255 / 0.04) 60%, transparent)' }}
      />
      <div
        className="absolute -bottom-[30vh] -left-[18vw] h-[80vh] w-[64vw] rounded-full [animation:drift-b_92s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(closest-side, rgb(74 163 255 / 0.07), rgb(74 163 255 / 0.015) 60%, transparent)' }}
      />
      <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: GRAIN }} />
    </div>
  )
}
