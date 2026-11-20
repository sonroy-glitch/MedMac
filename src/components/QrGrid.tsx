import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from '../lib/motion'

export type QrReveal = {
  /** Seconds each cell takes to pop in. */
  duration: number
  /** Stagger between cells, as in a GSAP stagger. */
  each: number
  from: 'center' | 'random' | 'start'
  ease: string
  /** Stagger over every cell (as a selector of all spans would) or only the dark ones. */
  over?: 'all' | 'on'
}

export type QrGridHandle = {
  /** One tween on a plain number that pops every cell in, staggered, with a single canvas draw per frame. */
  reveal: (opts: QrReveal) => gsap.core.Tween
  /** Every cell at full size. */
  full: () => void
}

type Props = {
  cells: boolean[]
  /** Cells per row. */
  size: number
  /** Gap between cells in CSS px. */
  gap?: number
  /** Corner radius of each cell in CSS px. */
  radius?: number
  /** The cell colour comes from the canvas's CSS `color`, so pass a text colour class. */
  className?: string
}

/**
 * The decorative QR grid, drawn on one canvas. It replaces a grid of a few
 * hundred spans that each carried their own tween: same look, same staggered
 * pop, but one node and one draw per frame instead of hundreds of style reads.
 */
export const QrGrid = forwardRef<QrGridHandle, Props>(function QrGrid({ cells, size, gap = 2, radius = 0, className = '' }, handle) {
  const ref = useRef<HTMLCanvasElement>(null)
  const scales = useRef<Float32Array>(new Float32Array(cells.length).fill(1))
  const box = useRef({ w: 0, h: 0, dpr: 1, color: '#fff' })

  const draw = () => {
    const el = ref.current
    const ctx = el?.getContext('2d')
    const { w, h, dpr, color } = box.current
    if (!el || !ctx || !w || !h) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = color
    const cw = (w - gap * (size - 1)) / size
    const ch = (h - gap * (size - 1)) / size
    const snap = (v: number) => Math.round(v * dpr) / dpr
    ctx.beginPath()
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i]) continue
      const s = scales.current[i]
      if (s <= 0) continue
      const x = (i % size) * (cw + gap)
      const y = Math.floor(i / size) * (ch + gap)
      if (s === 1) {
        // Full-size cells sit on the device pixel grid, as the CSS grid did.
        const x0 = snap(x)
        const y0 = snap(y)
        const x1 = snap(x + cw)
        const y1 = snap(y + ch)
        if (radius) ctx.roundRect(x0, y0, x1 - x0, y1 - y0, radius)
        else ctx.rect(x0, y0, x1 - x0, y1 - y0)
      } else {
        const sw = cw * s
        const sh = ch * s
        const sx = x + (cw - sw) / 2
        const sy = y + (ch - sh) / 2
        if (radius) ctx.roundRect(sx, sy, sw, sh, radius * s)
        else ctx.rect(sx, sy, sw, sh)
      }
    }
    ctx.fill()
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    box.current.color = getComputedStyle(el).color
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      box.current = { ...box.current, w: width, h: height, dpr }
      el.width = Math.round(width * dpr)
      el.height = Math.round(height * dpr)
      draw()
    })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(handle, () => ({
    full() {
      scales.current.fill(1)
      draw()
    },
    reveal({ duration, each, from, ease, over = 'all' }) {
      const order = over === 'all' ? cells.map((_, i) => i) : cells.flatMap((on, i) => (on ? [i] : []))
      const spread = gsap.utils.distribute({ each, from, base: 0 })
      const delays = new Float32Array(cells.length)
      let last = 0
      order.forEach((cell, n) => {
        delays[cell] = spread(n, order[n], order) as number
        last = Math.max(last, delays[cell])
      })
      const fn = gsap.parseEase(ease)
      const total = last + duration
      const apply = (t: number) => {
        for (const cell of order) {
          const p = Math.min(1, Math.max(0, (t - delays[cell]) / duration))
          scales.current[cell] = p === 1 ? 1 : fn(p)
        }
        draw()
      }
      const proxy = { t: 0 }
      apply(0)
      return gsap.to(proxy, { t: total, duration: total, ease: 'none', onUpdate: () => apply(proxy.t) })
    },
  }))

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />
})
