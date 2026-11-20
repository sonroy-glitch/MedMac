/**
 * The hologram's human figure: a T-pose body with its skeleton, in a 440 × 470 viewBox.
 * The figure is symmetric about x = 220. The department mapping is invented for the demo.
 * It is not medical logic.
 */
export type RegionId = 'head' | 'chest' | 'abdomen' | 'arms' | 'legs' | 'back'

export type Region = {
  id: RegionId
  label: string
  /** Hit-area shapes. They are clipped to the body outline when drawn. */
  d: string[]
  /** Shown as chips when the region is selected. */
  chips: string[]
  department: string
}

export const VIEW = { w: 440, h: 470, cx: 220 }
const CX = VIEW.cx

type P = [number, number]
const f = (n: number) => +n.toFixed(1)

/** A closed Catmull-Rom spline through the points, as cubic Béziers. */
function smoothClosed(pts: P[]): string {
  const n = pts.length
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(
      p2[1] - (p3[1] - p1[1]) / 6,
    )} ${f(p2[0])} ${f(p2[1])}`
  }
  return `${d}Z`
}

/** Right half of the outline as (offset from centre, y), crown to crotch. */
const HALF: P[] = [
  [0, 18], [14, 20], [23, 31], [26, 47], [24, 62], [19, 74], [12, 83], [11, 91],
  [22, 97], [40, 100], [54, 103],
  [80, 105], [110, 107], [148, 109], [176, 111],
  [187, 109], [198, 110], [206, 114], [207, 119], [201, 124], [188, 124], [177, 121],
  [148, 121], [110, 124], [80, 126], [47, 131],
  [41, 152], [36, 180], [31, 200], [35, 222], [41, 242],
  [41, 264], [39, 292], [31, 330], [32, 352], [27, 382], [17, 412], [22, 428], [24, 438], [10, 442],
  [5, 416], [8, 382], [9, 356], [8, 330], [6, 296], [0, 268],
]
const right = HALF.map(([dx, y]): P => [CX + dx, y])
const left = HALF.slice(1, -1)
  .reverse()
  .map(([dx, y]): P => [CX - dx, y])

/** The whole body as one smooth path. */
export const bodyOutline = smoothClosed([...right, ...left])

/* ---------- skeleton ---------- */

const ell = (cx: number, cy: number, rx: number, ry = rx) =>
  `M${f(cx - rx)} ${f(cy)} a${rx} ${ry} 0 1 0 ${f(rx * 2)} 0 a${rx} ${ry} 0 1 0 ${f(-rx * 2)} 0Z`

/** A long bone: a capsule between two points, with optional knobs at the joints. */
function bone(x1: number, y1: number, x2: number, y2: number, r: number, knobs = 0) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const nx = (-(y2 - y1) / len) * r
  const ny = ((x2 - x1) / len) * r
  let d = `M${f(x1 + nx)} ${f(y1 + ny)} L${f(x2 + nx)} ${f(y2 + ny)} A${r} ${r} 0 0 0 ${f(x2 - nx)} ${f(y2 - ny)} L${f(x1 - nx)} ${f(
    y1 - ny,
  )} A${r} ${r} 0 0 0 ${f(x1 + nx)} ${f(y1 + ny)}Z`
  if (knobs) d += ` ${ell(x1, y1, r * knobs)} ${ell(x2, y2, r * knobs)}`
  return d
}

/** Both sides at once: builds the right-hand version from offsets, then mirrors it. */
const pair = (make: (s: 1 | -1) => string) => `${make(1)} ${make(-1)}`
const X = (s: number, dx: number) => CX + s * dx

const SKULL = [
  ell(CX, 44, 19, 22),
  `M${CX - 15} 58 Q${CX - 14} 77 ${CX} 80 Q${CX + 14} 77 ${CX + 15} 58`,
].join(' ')
const FACE = [
  ell(CX - 8, 48, 5.5, 4.5),
  ell(CX + 8, 48, 5.5, 4.5),
  `M${CX} 53 L${CX - 3} 61 H${CX + 3}Z`,
  `M${CX - 9} 67 H${CX + 9}`,
  `M${CX - 6} 64 V70 M${CX - 2} 64 V70 M${CX + 2} 64 V70 M${CX + 6} 64 V70`,
].join(' ')

const NECK = [0, 1, 2].map((i) => `M${CX - 4} ${83 + i * 5} h8 v3.5 h-8Z`).join(' ')
const THORACIC = Array.from({ length: 9 }, (_, i) => `M${CX - 3.5} ${99 + i * 6.2} h7 v4.6 h-7Z`).join(' ')
const LUMBAR = Array.from({ length: 5 }, (_, i) => `M${CX - 6} ${158 + i * 12.5} h12 v9.5 h-12Z`).join(' ')

const CLAVICLES = pair((s) => `M${X(s, 3)} 100 Q${X(s, 18)} 96 ${X(s, 36)} 101`)
const STERNUM = `M${CX - 4} 103 h8 v40 l-4 9 l-4 -9Z`

const RIBS = Array.from({ length: 9 }, (_, k) => {
  const y0 = 105 + k * 7
  const w = 22 + Math.min(k, 5) * 3.2 - Math.max(0, k - 5) * 2.5
  const start = k >= 7 ? w * 0.55 : 4.5
  return pair(
    (s) =>
      `M${X(s, start)} ${y0} C${X(s, w * 0.8)} ${y0 - 3} ${X(s, w + 5)} ${y0 + 5} ${X(s, w - 3)} ${y0 + 15 + k * 0.4}`,
  )
}).join(' ')

const SCAPULAE = pair((s) => `M${X(s, 12)} 106 L${X(s, 38)} 104 Q${X(s, 34)} 124 ${X(s, 18)} 142 Q${X(s, 13)} 124 ${X(s, 12)} 106Z`)

const PELVIS = [
  pair((s) => `M${X(s, 5)} 226 C${X(s, 16)} 213 ${X(s, 33)} 211 ${X(s, 37)} 222 C${X(s, 39)} 237 ${X(s, 30)} 250 ${X(s, 17)} 255 C${X(s, 10)} 257 ${X(s, 6)} 250 ${X(s, 5)} 243Z`),
  `M${CX - 8} 224 L${CX + 8} 224 L${CX + 4} 251 L${CX - 4} 251Z`,
  pair((s) => ell(X(s, 11), 254, 4.5, 3.6)),
  `M${CX - 10} 259 Q${CX} 266 ${CX + 10} 259`,
].join(' ')

const ARMS = pair((s) =>
  [
    bone(X(s, 54), 108, X(s, 108), 114, 3.4, 1.6),
    bone(X(s, 113), 112.5, X(s, 172), 113.5, 1.9),
    bone(X(s, 113), 118.5, X(s, 172), 119, 1.6),
    ell(X(s, 178), 116, 4, 4.4),
    ...[111.5, 114.5, 117.5, 120.5].map((y, i) => bone(X(s, 182), 113 + i * 2, X(s, 203 - Math.abs(i - 1.3) * 1.6), y, 0.9)),
    bone(X(s, 180), 121, X(s, 191), 126, 1),
  ].join(' '),
)

const LEGS = pair((s) =>
  [
    ell(X(s, 22), 247, 5.5),
    bone(X(s, 24), 252, X(s, 20), 323, 4, 1.4),
    ell(X(s, 20), 333, 4.6),
    bone(X(s, 18), 341, X(s, 14), 406, 3, 1.4),
    bone(X(s, 27), 343, X(s, 20), 404, 1.5),
    `M${X(s, 9)} 412 L${X(s, 18)} 413 L${X(s, 21)} 433 L${X(s, 10)} 437Z`,
  ].join(' '),
)

export type BonePart = 'core' | 'face' | 'front' | 'back'

/** The skeleton, tagged so the front and back views can show different parts. */
export const skeleton: { d: string; part: BonePart }[] = [
  { d: SKULL, part: 'core' },
  { d: FACE, part: 'face' },
  { d: `${NECK} ${LUMBAR}`, part: 'core' },
  { d: THORACIC, part: 'back' },
  { d: `${CLAVICLES} ${STERNUM} ${RIBS}`, part: 'front' },
  { d: SCAPULAE, part: 'back' },
  { d: `${PELVIS} ${ARMS} ${LEGS}`, part: 'core' },
]

/* ---------- interactive regions ---------- */

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y} h${w} v${h} h${-w}Z`
const T = { l: CX - 44, w: 88 }

export const regions: Record<RegionId, Region> = {
  head: {
    id: 'head',
    label: 'Head',
    d: [rect(CX - 30, 10, 60, 86)],
    chips: ['Headache', 'Dizziness', 'Blurred vision'],
    department: 'Neurology',
  },
  chest: {
    id: 'chest',
    label: 'Chest',
    d: [rect(T.l, 96, T.w, 76)],
    chips: ['Tightness', 'Breathlessness', 'Palpitations'],
    department: 'Cardiology',
  },
  abdomen: {
    id: 'abdomen',
    label: 'Abdomen',
    d: [rect(T.l, 172, T.w, 92)],
    chips: ['Stomach pain', 'Nausea', 'Bloating'],
    department: 'Gastroenterology',
  },
  arms: {
    id: 'arms',
    label: 'Arms',
    d: [rect(CX + 44, 90, 180, 50), rect(0, 90, CX - 44, 50)],
    chips: ['Joint pain', 'Swelling', 'Numbness'],
    department: 'Orthopaedics',
  },
  legs: {
    id: 'legs',
    label: 'Legs',
    d: [rect(CX - 50, 264, 100, 190)],
    chips: ['Knee pain', 'Cramps', 'Swelling'],
    department: 'Orthopaedics',
  },
  back: {
    id: 'back',
    label: 'Back',
    d: [rect(T.l, 96, T.w, 168)],
    chips: ['Lower back pain', 'Stiffness', 'Shoulder ache'],
    department: 'Physiotherapy & Spine',
  },
}

export const frontRegions: RegionId[] = ['head', 'chest', 'abdomen', 'arms', 'legs']
export const backRegions: RegionId[] = ['head', 'back', 'arms', 'legs']

/** Where the selection pulse sits for each region; arms and legs pulse on both sides. */
export const pulseAt: Record<RegionId, P[]> = {
  head: [[CX, 46]],
  chest: [[CX, 128]],
  abdomen: [[CX, 205]],
  back: [[CX, 170]],
  arms: [[CX - 130, 116], [CX + 130, 116]],
  legs: [[CX - 20, 333], [CX + 20, 333]],
}

/** Invented routing for the demo: one region names its department; three or more go to General Medicine. */
export function suggestDepartment(selected: RegionId[]): string | null {
  if (selected.length === 0) return null
  if (selected.length >= 3) return 'General Medicine'
  const depts = [...new Set(selected.map((id) => regions[id].department))]
  return depts.length === 1 ? depts[0] : 'General Medicine'
}
