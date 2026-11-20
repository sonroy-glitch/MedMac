import { greetings, languages } from '../data/site'

/**
 * Loads Noto Sans for each Indic script, subset by Google Fonts to only the
 * characters the site actually shows (a few KB instead of ~1 MB).
 * Edit the languages in src/data/site.ts and this updates itself.
 */
const families = [
  'Noto+Sans+Devanagari',
  'Noto+Sans+Oriya',
  'Noto+Sans+Bengali',
  'Noto+Sans+Tamil',
  'Noto+Sans+Telugu',
  'Noto+Sans+Gujarati',
  'Noto+Sans+Kannada',
  'Noto+Sans+Malayalam',
  'Noto+Sans+Gurmukhi',
]

export function loadScriptFonts() {
  // Plus the script glyphs on the hero and home-screen cards.
  const extra = 'घुटने में दर्द है अ ଅ அ అ অ'
  const chars = new Set([...languages, ...greetings].flatMap((l) => [...l.native]).concat([...extra.replace(/ /g, '')]))
  const text = encodeURIComponent([...chars].join(''))
  const href = `https://fonts.googleapis.com/css2?${families
    .map((f) => `family=${f}:wght@500`)
    .join('&')}&text=${text}&display=swap`
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}
