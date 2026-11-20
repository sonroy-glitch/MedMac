import { useEffect, useLayoutEffect, useState, type ComponentType } from 'react'
import { Hero } from '../sections/home/Hero'
import { LanguageMarquee } from '../sections/home/LanguageMarquee'
import { Screens } from '../sections/home/Screens'
import { Flow } from '../sections/flow/Flow'
import { Hologram } from '../sections/home/Hologram'
import { PayQueue } from '../sections/home/PayQueue'
import { Numbers } from '../sections/home/Numbers'
import { Footer } from '../components/Footer'
import { ScrollTrigger } from '../lib/motion'
import { afterPaint, openStage } from '../lib/stage'

/** Below the fold: mounted one per task after the first paint, top to bottom. */
const LATER: ComponentType[] = [LanguageMarquee, Screens, Flow, Hologram, PayQueue, Numbers, Footer]

export default function Home() {
  const [shown, setShown] = useState(0)
  const [stage, setStage] = useState<ReturnType<typeof openStage> | null>(null)

  useLayoutEffect(() => {
    const s = openStage(() => setShown(LATER.length))
    setStage(s)
    return s.close
  }, [])

  useEffect(() => {
    if (!stage) return
    if (shown < LATER.length) return afterPaint(() => setShown((n) => n + 1))
    // Every section is in: measure the full page once, so pins and the nav see its real length.
    ScrollTrigger.refresh()
    stage.finish()
  }, [shown, stage])

  return (
    <>
      <Hero />
      {LATER.slice(0, shown).map((Section, i) => (
        <Section key={i} />
      ))}
    </>
  )
}
