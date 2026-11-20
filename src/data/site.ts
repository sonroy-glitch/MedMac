/**
 * Site-wide content. Change the product name and copy here;
 * every page reads from this file.
 */
export const site = {
  name: 'MedMac',
  tagline: 'The hospital kiosk that takes a patient from vitals to the right doctor’s queue.',
}

export type Language = { name: string; native: string }

/** Shown in the marquee, each in its own script. */
export const languages: Language[] = [
  { name: 'English', native: 'English' },
  { name: 'Hindi', native: 'हिन्दी' },
  { name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { name: 'Bengali', native: 'বাংলা' },
  { name: 'Tamil', native: 'தமிழ்' },
  { name: 'Telugu', native: 'తెలుగు' },
  { name: 'Marathi', native: 'मराठी' },
  { name: 'Gujarati', native: 'ગુજરાતી' },
  { name: 'Kannada', native: 'ಕನ್ನಡ' },
  { name: 'Malayalam', native: 'മലയാളം' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { name: 'Assamese', native: 'অসমীয়া' },
]

/** Greetings cycled in the “Speak” step. */
export const greetings: Language[] = [
  { name: 'English', native: 'Hello' },
  { name: 'Hindi', native: 'नमस्ते' },
  { name: 'Odia', native: 'ନମସ୍କାର' },
  { name: 'Tamil', native: 'வணக்கம்' },
  { name: 'Telugu', native: 'నమస్కారం' },
  { name: 'Bengali', native: 'নমস্কার' },
]

export type FlowStep = {
  id: string
  word: string
  title: string
  body: string
}

export const flow: FlowStep[] = [
  {
    id: 'screen',
    word: 'Screen',
    title: 'Vitals, first.',
    body: 'Blood pressure and the standard pre-checkup vitals, measured at the kiosk before anyone asks a question.',
  },
  {
    id: 'speak',
    word: 'Speak',
    title: 'In your own language.',
    body: 'The patient tells the machine what’s wrong, out loud, in the language they think in.',
  },
  {
    id: 'point',
    word: 'Point',
    title: 'Show where it hurts.',
    body: 'A glowing body hologram. Tap the head, the chest, the knee: wherever the problem is.',
  },
  {
    id: 'match',
    word: 'Match',
    title: 'The right doctor.',
    body: 'The hospital’s own doctor data, read against the vitals, the body and the words, picks who should see this patient.',
  },
  {
    id: 'pay',
    word: 'Pay',
    title: 'One scan, paid.',
    body: 'Scan the QR with any UPI app and pay for that doctor’s visit, right at the kiosk.',
  },
  {
    id: 'queue',
    word: 'Queue',
    title: 'Already in line.',
    body: 'Payment done, the patient is added to that doctor’s queue automatically, with a token and a room number.',
  },
]

/** The six beats of the hand-off, shown as the flow’s progress rail. */
export const beats = ['Screen', 'Speak', 'Point', 'Match', 'Pay', 'Queue'] as const

/** The three figures on the flip cards. */
export const stats = [
  { value: 1, suffix: '', label: 'stop instead of five, from vitals to queue' },
  { value: 12, suffix: '', label: 'languages the patient can speak in' },
  { value: 7, suffix: ' min', label: 'from walking up to being in a queue' },
]

export type ScreenCard = {
  id: 'symptoms' | 'report' | 'doctor' | 'pay' | 'language'
  title: string
  body: string
}

/** The five buttons on the kiosk's home screen, dealt out as cards on the home page. */
export const screens: ScreenCard[] = [
  { id: 'symptoms', title: 'Check Symptoms', body: 'Say what’s wrong, or tap where it hurts.' },
  { id: 'report', title: 'Get Health Report', body: 'Today’s vitals, printed at the kiosk.' },
  { id: 'doctor', title: 'Book Doctor', body: 'Matched to a department from the hospital’s own list.' },
  { id: 'pay', title: 'Pay & Join Queue', body: 'Scan, pay the visit fee, and you’re in that doctor’s line.' },
  { id: 'language', title: 'Change Language', body: 'Twelve languages. One tap to switch.' },
]
