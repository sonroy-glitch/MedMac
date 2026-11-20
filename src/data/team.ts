/**
 * All team content lives here: names, roles, bios, photos and each
 * person's academics and achievements.
 *
 * Photos live in src/assets/team/ and are matched by file name, whatever
 * the extension: person-1.webp, person-1.jpg and person-1.png all work for
 * `photo: 'src/assets/team/person-1.webp'`. Portrait (4:5) crops look best;
 * about 900px wide is plenty. If no file matches, the page shows a framed
 * monogram instead, so nothing else needs to change.
 */

export type TimelineEntry = {
  /** Optional, e.g. "2016 – 2020" or "2021 – now" */
  years?: string
  title: string
  place?: string
  note?: string
}

export type Person = {
  id: string
  name: string
  role: string
  /** Path from the project root. Matched by file name (any image extension) at build time; missing files fall back to the monogram frame. */
  photo: string
  bio: string
  /** One list per person: education, roles and achievements. */
  achievements: TimelineEntry[]
}

export const team: Person[] = [
  {
    id: 'person-1',
    name: 'Sujal Krishna',
    role: 'Co-founder · Hardware & Product',
    photo: 'src/assets/team/person-1.webp',
    bio: 'Sujal builds the machine itself: the vitals rig, the enclosure and the touch-and-voice stack, bringing embedded engineering and product design together in one kiosk.',
    achievements: [
      { title: 'BTech', place: 'KIIT University' },
      { title: 'Embedded Engineer', place: 'Actoan Techlabs' },
      { title: 'Product Designer', place: 'Oops Ventures' },
      { title: 'Marketing Lead', place: 'Petrocore Pvt. Ltd.' },
    ],
  },
  {
    id: 'person-2',
    name: 'Sounak Roy',
    role: 'Co-founder · AI & Systems',
    photo: 'src/assets/team/person-2.webp',
    bio: 'Sounak designs how the machine listens and decides: the multilingual voice flow, the body interface and the doctor-matching logic, built on a background in AI and systems development.',
    achievements: [
      { title: 'BTech', place: 'KIIT University' },
      { title: 'Innovation Architect', place: 'CreatED' },
      { title: 'Open Source Contributor', place: 'GSSoC' },
      { title: 'AI & Systems Developer', place: 'Nullclass' },
      { title: 'Olympiad Medalist' },
    ],
  },
]
