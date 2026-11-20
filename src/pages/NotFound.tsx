import { Button } from '../components/Button'
import { PulseLine } from '../sections/home/PulseLine'

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end gutter pb-16 pt-28">
      <PulseLine className="absolute inset-x-0 top-[40%] h-40 -translate-y-1/2 opacity-60" />
      <h1 className="display relative text-[clamp(3rem,12vw,12rem)]">Wrong ward.</h1>
      <p className="relative mt-6 max-w-[40ch] text-fg-dim">This page does not exist. The kiosk would send you somewhere useful, and so will this button.</p>
      <div className="relative mt-8">
        <Button kind="route" to="/" label="Home">
          Back to the start
        </Button>
      </div>
    </section>
  )
}
