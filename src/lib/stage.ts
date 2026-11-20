/**
 * Progressive mounting for long pages. The first paint only waits for what is
 * on screen; the sections below the fold mount one per task right after, in
 * document order, so their ScrollTriggers and pins are created in the same
 * order as before. Anything that needs a section that has not mounted yet
 * (an in-page link) asks for the rest at once and waits.
 */
type Stage = { flush: () => void; done: boolean; waiters: (() => void)[] }

let current: Stage | null = null

export function openStage(flush: () => void) {
  const stage: Stage = { flush, done: false, waiters: [] }
  current = stage
  return {
    finish() {
      stage.done = true
      stage.waiters.splice(0).forEach((fn) => fn())
    },
    close() {
      if (current === stage) current = null
      stage.waiters.splice(0).forEach((fn) => fn())
    },
  }
}

/** Resolves once every staged section is in the page (straight away when nothing is staged). */
export function whenStaged(): Promise<void> {
  const stage = current
  if (!stage || stage.done) return Promise.resolve()
  return new Promise((resolve) => {
    stage.waiters.push(resolve)
    stage.flush()
  })
}

/** Runs after the browser has had the chance to paint the current frame. */
export function afterPaint(fn: () => void) {
  let timer = 0
  const raf = requestAnimationFrame(() => {
    timer = window.setTimeout(fn, 0)
  })
  return () => {
    cancelAnimationFrame(raf)
    window.clearTimeout(timer)
  }
}
