import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion'
import { whenStaged } from './stage'

let lenis: Lenis | null = null
let ticking = false
let still = 0

/**
 * Lenis driven by GSAP's ticker so ScrollTrigger and smooth scroll never drift.
 * It only asks for frames while a smooth scroll is in flight: an endless frame
 * loop at rest would make the browser restyle every running CSS loop each frame,
 * even the ones the compositor runs on its own.
 */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), autoRaf: false })
  lenis.on('scroll', ScrollTrigger.update)
  lenis.on('virtual-scroll', wake)
  // The page grows after Lenis starts (sections mount after the first paint), so
  // re-measure whenever ScrollTrigger does instead of waiting on Lenis' debounce.
  ScrollTrigger.addEventListener('refresh', resize)
  gsap.ticker.lagSmoothing(0)
  wake()
}

function resize() {
  lenis?.resize()
}

function wake() {
  if (!lenis || ticking) return
  ticking = true
  still = 0
  lenis.time = 0 // the clock was parked: start the next scroll from this frame, not from the last one
  gsap.ticker.add(raf)
}

function raf(time: number) {
  if (!lenis) return
  lenis.raf(time * 1000)
  if (lenis.isScrolling === 'smooth') still = 0
  else if (++still > 6) {
    gsap.ticker.remove(raf)
    ticking = false
  }
}

export function stopSmoothScroll() {
  gsap.ticker.remove(raf)
  ticking = false
  ScrollTrigger.removeEventListener('refresh', resize)
  lenis?.destroy()
  lenis = null
}

export function scrollToTarget(target: string | HTMLElement | number, immediate = false) {
  // A section that has not mounted yet: mount the rest of the page first, then go.
  if (typeof target === 'string' && !document.querySelector(target)) {
    void whenStaged().then(() => requestAnimationFrame(() => document.querySelector(target) && scrollToTarget(target, immediate)))
    return
  }
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(target, { immediate, duration: 1.6, offset: 0 })
    wake()
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  el?.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Moves the page to `y` this frame with no easing, keeping smooth scroll in step. */
export function jumpScroll(y: number) {
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(y, { immediate: true, force: true })
    wake()
  } else window.scrollTo(0, y)
}

export function pauseScroll(paused: boolean) {
  if (!lenis) return
  if (paused) lenis.stop()
  else {
    lenis.start()
    wake()
  }
}
