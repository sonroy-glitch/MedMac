import { useEffect, useRef, type ReactNode } from 'react'
import { dur, ease, gsap, media } from '../lib/motion'
import { useMedia } from '../hooks/useMedia'

type Props = {
  children: ReactNode
  /** How far the element follows the pointer, 0–1. */
  strength?: number
  className?: string
}

/** Pulls its child toward the pointer; snaps back with the signature overshoot. */
export function Magnetic({ children, strength = 0.32, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = useMedia(media.finePointer)
  const reduce = useMedia(media.reduce)

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || reduce) return
    const xTo = gsap.quickTo(el, 'x', { duration: dur.sm, ease: ease.outSoft })
    const yTo = gsap.quickTo(el, 'y', { duration: dur.sm, ease: ease.outSoft })
    let rect: DOMRect | null = null
    let rest: gsap.core.Tween | null = null
    // Its own layer only while it is following the pointer or settling back.
    const enter = () => {
      rest?.kill()
      el.style.willChange = 'transform'
      rect = el.getBoundingClientRect()
    }
    const move = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect()
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength)
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength)
    }
    const leave = () => {
      rect = null
      rest = gsap.to(el, { x: 0, y: 0, duration: dur.md, ease: ease.funk, overwrite: true, onComplete: () => void (el.style.willChange = '') })
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      // quickTo tweens are paused, so GSAP's global timeline keeps them (and this
      // element's whole page) alive until they are killed.
      xTo.tween.kill()
      yTo.tween.kill()
      rest?.kill()
      gsap.set(el, { x: 0, y: 0 })
      el.style.willChange = ''
    }
  }, [fine, reduce, strength])

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  )
}
