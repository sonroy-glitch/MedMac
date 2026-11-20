import { Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { TransitionProvider } from './components/Transition'
import { Backdrop } from './components/Backdrop'
import { Nav } from './components/Nav'
import { Intro } from './components/Intro'
import Home from './pages/Home'
import { NotFound, Team } from './lib/routes'
import { site } from './data/site'
import { startSmoothScroll, stopSmoothScroll } from './lib/scroll'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    startSmoothScroll()
    // Fetch the Team page in the background once the first page has settled, so the first visit to it is instant.
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 2500))
    idle(() => void Team.preload())
    return stopSmoothScroll
  }, [])

  useEffect(() => {
    document.title =
      pathname === '/team' ? `Team · ${site.name}` : `${site.name}: from vitals to the right doctor’s queue`
  }, [pathname])

  return (
    <TransitionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ember focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <Backdrop />
      <Intro />
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
    </TransitionProvider>
  )
}
