import type { ReactNode } from 'react'
import { site } from '../data/site'

/** The drawing is 360 × 860 units. The screen slot is cut out at these coordinates. */
const VB = { w: 360, h: 860 }
const SCREEN = { x: 40, y: 154, w: 252, h: 378 }
const pct = (v: number, of: number) => `${(v / of) * 100}%`

const keys = Array.from({ length: 12 }, (_, i) => ({ col: i % 3, row: Math.floor(i / 3) }))
const grille = Array.from({ length: 24 }, (_, i) => ({ col: i % 8, row: Math.floor(i / 8) }))

/**
 * The MedMac machine, drawn like a bank ATM: lit brand header, a hooded
 * touchscreen, a slanted deck with keypad and fingertip sensor, a print slot,
 * a side cuff port and a plinth with a floor light. Whatever is passed as
 * children renders live inside the screen, sized in container units (cqw).
 */
export function Kiosk({ children, className = '', id = 'k' }: { children?: ReactNode; className?: string; id?: string }) {
  const g = (name: string) => `${id}-${name}`
  return (
    <div className={`relative aspect-[360/860] select-none ${className}`}>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={g('body')} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fdfcf9" />
            <stop offset="0.55" stopColor="#f1ede5" />
            <stop offset="1" stopColor="#ddd7cb" />
          </linearGradient>
          <linearGradient id={g('side')} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#c9c2b5" />
            <stop offset="1" stopColor="#a39c8e" />
          </linearGradient>
          <linearGradient id={g('head')} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2a2e36" />
            <stop offset="1" stopColor="#15181d" />
          </linearGradient>
          <linearGradient id={g('hood')} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0f1115" />
            <stop offset="0.12" stopColor="#262a31" />
            <stop offset="1" stopColor="#1c1f25" />
          </linearGradient>
          <linearGradient id={g('deck')} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#d9d3c7" />
            <stop offset="1" stopColor="#f6f3ec" />
          </linearGradient>
          <linearGradient id={g('gloss')} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={g('sensor')}>
            <stop offset="0" stopColor="#e9a440" stopOpacity="0.95" />
            <stop offset="0.55" stopColor="#e9a440" stopOpacity="0.35" />
            <stop offset="1" stopColor="#e9a440" stopOpacity="0" />
          </radialGradient>
          <filter id={g('blur')} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={g('shadow')} x="-30%" y="-300%" width="160%" height="700%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* floor shadow and floor light */}
        <ellipse cx="176" cy="842" rx="188" ry="16" fill="#000" opacity="0.6" filter={`url(#${g('shadow')})`} />
        <rect x="24" y="826" width="290" height="8" rx="4" fill="#4aa3ff" opacity="0.75" filter={`url(#${g('blur')})`} />

        {/* side panel: gives the cabinet its depth */}
        <path d="M316 34 L342 52 L342 820 L316 830 Z" fill={`url(#${g('side')})`} />
        <path d="M316 34 L342 52 L342 128 L316 120 Z" fill="#0d0f12" />
        <ellipse cx="329.5" cy="610" rx="7.5" ry="26" fill="#1c1f25" />
        <ellipse cx="330.5" cy="610" rx="4" ry="20" fill="#0a0b0d" />

        {/* plinth */}
        <path d="M10 770 H322 V822 Q322 832 312 832 H20 Q10 832 10 822 Z" fill="#23262c" />
        <path d="M322 770 L346 776 L346 818 L322 832 Z" fill="#15171b" />
        <rect x="30" y="824" width="272" height="2.5" rx="1.25" fill="#9fd0ff" />

        {/* body */}
        <rect x="16" y="112" width="300" height="660" fill={`url(#${g('body')})`} />
        <path d="M16 112 H140 L16 470 Z" fill={`url(#${g('gloss')})`} opacity="0.7" />
        <rect x="16.5" y="112" width="1.5" height="660" fill="#fff" opacity="0.9" />

        {/* lit header */}
        <path d="M16 120 V52 Q16 22 46 22 H286 Q316 22 316 52 V120 Z" fill={`url(#${g('head')})`} />
        <path d="M30 34 H230" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
        <rect x="40" y="56" width="30" height="30" rx="9" fill="#0b0c0f" stroke="#3a3f48" />
        <path d="M44 72 h5 l2.4 -6 l4 12 l3 -9 l1.8 3 H67" fill="none" stroke="#e9a440" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="80" y="80" fill="#f3efe7" fontFamily="Satoshi, sans-serif" fontWeight="700" fontSize="26" letterSpacing="-1">
          {site.name}
        </text>
        <circle cx="272" cy="71" r="8" fill="#0a0b0d" stroke="#3a3f48" />
        <circle cx="272" cy="71" r="3.4" fill="#2f8cff" opacity="0.8" />
        <circle cx="292" cy="71" r="2.6" fill="#7cf0a8" />
        {/* the light strip under the sign */}
        <rect x="16" y="112" width="300" height="8" fill="#4aa3ff" opacity="0.8" filter={`url(#${g('blur')})`} />
        <rect x="16" y="113" width="300" height="5" fill="#8cc6ff" />

        {/* screen hood */}
        <rect x="28" y="138" width="276" height="410" rx="22" fill={`url(#${g('hood')})`} />
        <rect x="28.5" y="138.5" width="275" height="409" rx="21.5" fill="none" stroke="#fff" strokeOpacity="0.08" />
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="10" fill="#060a12" />

        {/* deck: keypad, card slot, fingertip sensor */}
        <path d="M34 566 H298 L312 640 H20 Z" fill={`url(#${g('deck')})`} />
        <path d="M34 566 H298" stroke="#b9b2a5" />
        <rect x="20" y="640" width="292" height="12" fill="#cfc8bb" />
        {keys.map(({ col, row }) => (
          <rect
            key={`${col}-${row}`}
            x={52 - row * 2.2 + col * (30 + row * 1.3)}
            y={575 + row * 15}
            width={25 + row * 1.2}
            height="10"
            rx="3"
            fill={col === 2 && row === 3 ? '#e9a440' : '#fbfaf7'}
            stroke="#a8a193"
            strokeWidth="0.8"
          />
        ))}
        <rect x="160" y="586" width="40" height="5" rx="2.5" fill="#1c1f25" />
        <rect x="163" y="588" width="34" height="1.4" rx="0.7" fill="#e9a440" opacity="0.8" />
        <ellipse cx="250" cy="604" rx="40" ry="17" fill="#1c1f25" />
        <ellipse cx="250" cy="604" rx="26" ry="10" fill={`url(#${g('sensor')})`} />
        <ellipse cx="250" cy="604" rx="12" ry="4.5" fill="#2a1d0b" opacity="0.85" />

        {/* lower panel: print slot, scanner window, speaker */}
        <rect x="48" y="676" width="120" height="10" rx="5" fill="#1c1f25" />
        <rect x="56" y="680" width="104" height="2" rx="1" fill="#e9a440" opacity="0.7" />
        {grille.map(({ col, row }) => (
          <circle key={`${col}-${row}`} cx={58 + col * 14} cy={712 + row * 12} r="2.4" fill="#bdb6a9" />
        ))}
        <rect x="200" y="668" width="88" height="56" rx="10" fill="#1c1f25" />
        <rect x="208" y="676" width="72" height="40" rx="6" fill="#0b1726" />
        <path d="M214 696 H274" stroke="#7fdbff" strokeOpacity="0.8" strokeWidth="1.4" />
        <rect x="208" y="676" width="72" height="40" rx="6" fill="#7fdbff" opacity="0.08" />
        <path d="M16 760 H316" stroke="#c4bdb0" />
      </svg>

      <div
        className="absolute overflow-hidden rounded-[2.6%/1.7%] [container-type:size]"
        style={{ left: pct(SCREEN.x, VB.w), top: pct(SCREEN.y, VB.h), width: pct(SCREEN.w, VB.w), height: pct(SCREEN.h, VB.h) }}
      >
        {children}
        {/* glass reflection over the live screen */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(115deg, rgb(255 255 255 / 0.1), transparent 38%)' }}
        />
      </div>
    </div>
  )
}
