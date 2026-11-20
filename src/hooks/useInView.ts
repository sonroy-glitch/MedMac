import { useEffect, useState, type RefObject } from 'react'

/** True while the element is on screen (within `margin`). Starts false, so timers wait for the first look. */
export function useInView(ref: RefObject<Element | null>, margin = '15% 0px') {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return setOn(true)
    const io = new IntersectionObserver((entries) => setOn(entries[entries.length - 1].isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return on
}
