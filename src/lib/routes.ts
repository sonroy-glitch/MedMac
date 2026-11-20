import { lazy, type ComponentType } from 'react'

type Mod = { default: ComponentType }

/**
 * A route component in its own chunk that can be fetched ahead of time. Once
 * fetched, it renders straight away instead of suspending, so a page
 * transition never uncovers an empty page.
 */
function route(load: () => Promise<Mod>) {
  let mod: Mod | undefined
  let pending: Promise<Mod> | undefined
  const preload = () => (pending ??= load().then((m) => (mod = m)))
  // A thenable that resolves synchronously lets React.lazy render without suspending.
  const Page = lazy(() => (mod ? ({ then: (done: (m: Mod) => void) => done(mod!) } as unknown as Promise<Mod>) : preload()))
  return Object.assign(Page, { preload })
}

export const Team = route(() => import('../pages/Team'))
export const NotFound = route(() => import('../pages/NotFound'))

/** Fetches the chunk for a path, so it is ready before the transition reveals it. */
export function preloadRoute(path: string) {
  if (path === '/') return Promise.resolve()
  return (path === '/team' ? Team : NotFound).preload()
}
