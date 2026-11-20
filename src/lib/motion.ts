import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

/*
 * ScrollTrigger keeps an empty requestAnimationFrame loop running for as long as
 * it is enabled, to work around uneven repaints in Firefox. Elsewhere it costs: a
 * frame loop at rest makes Chromium restyle every running CSS animation on every
 * frame, even the ones the compositor runs by itself. So outside Firefox the
 * loop's first request, made while the plugin registers, is dropped and the loop
 * never starts. Every other frame request passes straight through.
 */
const keepRafLoop = typeof navigator === 'undefined' || /firefox/i.test(navigator.userAgent)
const nativeRaf = typeof window === 'undefined' ? undefined : window.requestAnimationFrame
if (nativeRaf && !keepRafLoop) {
  window.requestAnimationFrame = (cb) => {
    const src = String(cb)
    return src.length < 120 && src.includes('requestAnimationFrame(') ? 0 : nativeRaf.call(window, cb)
  }
}
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP)
if (nativeRaf) window.requestAnimationFrame = nativeRaf

/**
 * Motion tokens. Every GSAP tween in the site uses these names.
 * The CSS mirrors live in src/styles/index.css (--ease-*).
 */
CustomEase.create('funk', 'M0,0 C0.16,0.62 0.3,1.09 0.52,1.065 0.7,1.045 0.82,1 1,1')

export const ease = {
  out: 'expo.out',
  outSoft: 'power4.out',
  inOut: 'expo.inOut',
  /** The signature overshoot: chips, magnets, cursor, queue token. Use nowhere else. */
  funk: 'funk',
} as const

export const dur = {
  xs: 0.25,
  sm: 0.5,
  md: 0.9,
  lg: 1.3,
  xl: 1.8,
} as const

export const stagger = {
  char: 0.022,
  line: 0.09,
} as const

export const media = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 900px)',
  /** Room for the pinned card fan: wide and tall enough. Matches the `deck:` variant in index.css. */
  deck: '(min-width: 900px) and (min-height: 520px)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(media.reduce).matches

/**
 * Runs ambient loops only while their element is on screen (with a little
 * margin so they are already moving when they scroll in), and pauses them
 * otherwise. Returns the disconnect, for a cleanup.
 */
export function whileVisible(
  el: Element | null | undefined,
  anims: gsap.core.Animation | gsap.core.Animation[],
  { margin = '15% 0px', onToggle }: { margin?: string; onToggle?: (visible: boolean) => void } = {},
) {
  const list = Array.isArray(anims) ? anims : [anims]
  if (!el || typeof IntersectionObserver === 'undefined') return () => {}
  list.forEach((a) => a.pause())
  const io = new IntersectionObserver(
    (entries) => {
      const on = entries[entries.length - 1].isIntersecting
      list.forEach((a) => (on ? a.resume() : a.pause()))
      onToggle?.(on)
    },
    { rootMargin: margin },
  )
  io.observe(el)
  return () => io.disconnect()
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
