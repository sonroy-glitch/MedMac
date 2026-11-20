import { useRef, useState } from 'react'
import { team, type Person, type TimelineEntry } from '../data/team'
import { site } from '../data/site'
import { dur, ease, gsap, media, useGSAP, whileVisible } from '../lib/motion'
import { SplitReveal } from '../components/SplitReveal'
import { Footer } from '../components/Footer'

/** Any photo dropped into src/assets/team is picked up at build time, matched by file name whatever its extension. */
const stem = (path: string) => path.replace(/^.*[\/]/, '').replace(/\.[^.]+$/, '').toLowerCase()
const photos = new Map(
  Object.entries(
    import.meta.glob<string>('/src/assets/team/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' }),
  ).map(([path, url]) => [stem(path), url]),
)
const photoFor = (path: string) => photos.get(stem(path))

function Portrait({ person, index }: { person: Person; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const src = photoFor(person.photo)
  const [failed, setFailed] = useState(false)
  const showPhoto = Boolean(src) && !failed
  const initials = person.name
    .split(' ')
    .map((p) => p[0])
    .join('')

  useGSAP(
    () => {
      // A real photo stays still: no reveal, parallax or tilt. Only the monogram frame moves.
      if (showPhoto) return
      const el = ref.current!
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: dur.xl, ease: ease.out, scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
        )
        gsap.fromTo(
          el.querySelector('[data-inner]'),
          { scale: 1.25, yPercent: -6 },
          { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
        const scan = gsap.fromTo(el.querySelector('[data-scan]'), { yPercent: -100 }, { yPercent: 1000, duration: 4, ease: 'sine.inOut', repeat: -1, yoyo: true })
        return whileVisible(el, scan)
      })
      mm.add(`${media.motion} and ${media.finePointer}`, () => {
        const rx = gsap.quickTo(el, 'rotateX', { duration: 0.8, ease: 'power3.out' })
        const ry = gsap.quickTo(el, 'rotateY', { duration: 0.8, ease: 'power3.out' })
        // The card's box is read once per hover (and again after a scroll), not on every pointer move,
        // and it only holds its own layer while it is tilting.
        let r: DOMRect | null = null
        let rest: gsap.core.Tween | null = null
        const forget = () => (r = null)
        const enter = () => {
          rest?.kill()
          el.style.willChange = 'transform'
          r = el.getBoundingClientRect()
        }
        const move = (e: PointerEvent) => {
          if (!r) r = el.getBoundingClientRect()
          ry(((e.clientX - r.left) / r.width - 0.5) * 8)
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8)
        }
        const leave = () => {
          r = null
          rx(0)
          ry(0)
          rest = gsap.delayedCall(0.9, () => (el.style.willChange = ''))
        }
        el.addEventListener('pointerenter', enter)
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        window.addEventListener('scroll', forget, { passive: true })
        return () => {
          rest?.kill()
          el.style.willChange = ''
          el.removeEventListener('pointerenter', enter)
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
          window.removeEventListener('scroll', forget)
        }
      })
      return () => mm.revert()
    },
    { dependencies: [showPhoto] },
  )

  return (
    <div style={{ perspective: '1200px' }}>
      <div ref={ref} className="group relative aspect-[4/5] overflow-hidden bg-raised">
        <div data-inner className="absolute inset-0">
          {showPhoto ? (
            <img
              src={src}
              alt={`Portrait of ${person.name}`}
              width={900}
              height={1125}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div role="img" aria-label={`Monogram for ${person.name}`} className="relative h-full w-full">
              {/* fine grid */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    'linear-gradient(var(--color-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-fg) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <span
                aria-hidden="true"
                className="display outline-type absolute inset-0 grid place-items-center text-[clamp(7rem,16vw,15rem)] transition-transform duration-700 ease-funk group-hover:scale-110"
              >
                {initials}
              </span>
              <span data-scan aria-hidden="true" className="absolute inset-x-0 top-0 h-[10%] border-b border-accent/70" />
            </div>
          )}
        </div>

        {/* corner brackets: open out on hover */}
        {(['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'left-3 bottom-3 border-l border-b', 'right-3 bottom-3 border-r border-b'] as const).map(
          (pos, i) => (
            <span
              key={pos}
              aria-hidden="true"
              className={`absolute h-6 w-6 border-fg/70 transition-transform duration-500 ease-funk ${pos} ${
                showPhoto ? '' : ['group-hover:-translate-x-1 group-hover:-translate-y-1', 'group-hover:translate-x-1 group-hover:-translate-y-1', 'group-hover:-translate-x-1 group-hover:translate-y-1', 'group-hover:translate-x-1 group-hover:translate-y-1'][i]
              }`}
            />
          ),
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-6 text-xs text-fg-dim">
          <span>{showPhoto ? person.role.split(' · ')[1] : person.name}</span>
          <span className="numeric">{String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}

function Timeline({ title, entries }: { title: string; entries: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(media.motion, () => {
        gsap.fromTo(
          '[data-spine]',
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 60%', scrub: true } },
        )
        gsap.utils.toArray<HTMLElement>('[data-entry]').forEach((el) => {
          gsap.from(el, { y: 20, autoAlpha: 0, duration: dur.md, ease: ease.out, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
          gsap.from(el.querySelector('[data-node]'), {
            scale: 0,
            duration: dur.md,
            ease: ease.funk,
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref}>
      <h3 className="font-display text-xl font-medium tracking-[-0.02em]">{title}</h3>
      <ol className="relative mt-6">
        <span data-spine aria-hidden="true" className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-line" />
        {entries.map((e) => (
          <li key={`${e.years}-${e.title}`} data-entry className="group relative pb-8 pl-10 last:pb-0">
            <span
              data-node
              aria-hidden="true"
              className="absolute left-0 top-[0.4rem] h-[11px] w-[11px] rounded-full border border-fg-dim bg-ground transition-colors duration-300 group-hover:border-accent group-hover:bg-ember"
            />
            {e.years && <p className="numeric mb-1 text-sm text-fg-dim transition-colors duration-300 group-hover:text-accent">{e.years}</p>}
            <p className="text-[1.05rem] text-fg transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">{e.title}</p>
            {e.place && <p className="text-fg-dim transition-colors duration-300 group-hover:text-accent">{e.place}</p>}
            {e.note && <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-fg-dim/80">{e.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  )
}

function PersonBlock({ person, index }: { person: Person; index: number }) {
  const flip = index % 2 === 1
  const [first, ...rest] = person.name.split(' ')
  return (
    <article aria-labelledby={`${person.id}-name`} className="gutter relative py-[clamp(4rem,12vh,9rem)]">
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className={`w-[78%] max-w-[20rem] md:col-span-5 md:w-[80%] md:max-w-none ${flip ? 'md:order-2 md:col-start-8 md:ml-auto' : ''}`}>
          <Portrait person={person} index={index} />
        </div>

        <div className={`relative flex flex-col md:col-span-7 ${flip ? 'md:order-1 md:col-start-1 md:row-start-1' : ''}`}>
          <h2
            id={`${person.id}-name`}
            className={`group/name display relative z-10 text-[clamp(2.75rem,8vw,8.5rem)] leading-[0.98] [&_.split-line-mask]:-mb-[0.16em] [&_.split-line-mask]:pb-[0.16em] md:mt-[8vh] ${
              flip ? 'md:-mr-[14vw] md:text-right' : 'md:-ml-[14vw]'
            }`}
          >
            <SplitReveal as="span" by="chars" className="block">
              {first}
            </SplitReveal>
            <SplitReveal
              as="span"
              by="chars"
              delay={0.1}
              className="block transition-[color,-webkit-text-stroke] duration-500 group-hover/name:text-transparent group-hover/name:[-webkit-text-stroke:1.5px_var(--color-ember)]"
            >
              {rest.join(' ')}
            </SplitReveal>
          </h2>
          <div className={`mt-8 md:mt-12 ${flip ? 'md:ml-auto md:max-w-[36rem]' : 'md:max-w-[36rem]'}`}>
            <p className="text-accent">{person.role}</p>
            <p className="mt-4 text-[clamp(1.05rem,1.3vw,1.25rem)] leading-relaxed text-fg">{person.bio}</p>
          </div>
        </div>
      </div>

      <div className="mt-[clamp(3rem,9vh,6rem)] grid gap-12 border-t hairline pt-10 md:grid-cols-12 md:gap-8">
        <div className={`md:col-span-6 ${flip ? 'md:col-start-7' : ''}`}>
          <Timeline title="Academics & achievements" entries={person.achievements} />
        </div>
      </div>
    </article>
  )
}

export default function Team() {
  return (
    <>
      <section className="gutter flex min-h-[78svh] flex-col justify-end pb-[clamp(3rem,8vh,6rem)] pt-32">
        <SplitReveal as="h1" by="chars" trigger="ready" className="display text-[clamp(3.4rem,13vw,14rem)]">
          Two of us.
        </SplitReveal>
        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <SplitReveal as="p" by="lines" trigger="ready" delay={0.4} className="max-w-[44ch] text-[clamp(1rem,1.25vw,1.2rem)] leading-relaxed text-fg-dim md:col-span-5 md:col-start-8">
            {`One builds the machine, one teaches it to listen. ${site.name} is the kiosk they wished their own families had found in a hospital lobby.`}
          </SplitReveal>
        </div>
      </section>
      {team.map((p, i) => (
        <PersonBlock key={p.id} person={p} index={i} />
      ))}
      <Footer />
    </>
  )
}
