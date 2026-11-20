# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Two separate surfaces, with separate stacks:

- **Promotional website** (product intro + team): Vite + React + TypeScript + Tailwind CSS, GSAP (ScrollTrigger, SplitText) and Lenis, react-router with two routes (`/`, `/team`). No heavy UI component libraries. All of this is confirmed by the user in the website brief.
- **Kiosk software** (the patient-facing app on the machine): Next.js, confirmed earlier. Not built yet and out of scope for the promo site.

## Users

- **Kiosk users:** patients and members of the public at a hospital. They walk up to the machine and complete pre-consultation screening on their own, without staff help.
- **Promo-site visitors:** people being introduced to the product and the team behind it, such as hospital decision-makers, partners, investors and the curious. The site informs; it doesn't sell a checkout.

## Product Purpose

A kiosk placed in hospitals that handles the basic pre-consultation screening patients normally go through before seeing a doctor, and then routes and queues them to the right doctor.

The flow: **Screen → Speak → Point → Match → Pay → Queue.**

1. **Vitals screening:** checks blood pressure and other standard pre-checkup vitals.
2. **Multilingual voice conversation:** the patient describes the problem out loud, in their own language.
3. **Interactive human-body hologram:** a glowing holographic body on screen. The patient taps where the pain or problem is.
4. **Smart doctor allocation:** the hospital's doctor data is fed into the machine. It uses the vitals, the selected body regions and what the patient said to pick the right doctor.
5. **Pay at the kiosk:** the screen shows a payment QR. Once the patient pays for that doctor's visit, they're automatically added to that doctor's queue.

Success for the patient: they walk away already in the right doctor's queue, without a separate front-desk stop for screening, triage and payment.

## Positioning

One physical machine in the hospital takes a patient from vitals to the right doctor's queue: measure, talk in your own language, point at the body, get matched, pay and get queued. Neither a symptom-checker app nor a standalone vitals booth can claim that end-to-end hand-off on site.

## Operating Context

- Deployed in hospitals, in public or semi-public waiting areas.
- One walk-up patient at a time on a touchscreen kiosk with voice input.
- Depends on the hospital supplying its doctor roster and data, and on a payment QR flow at the kiosk.

Still open:
- The exact vitals hardware beyond blood pressure.
- The payment provider and rails (UPI is likely in India, but not confirmed).
- Whether a clinician reviews the screening, and the data-privacy and patient-identification model.

## Capabilities and Constraints

- The capabilities are the five listed under Product Purpose. Present nothing else as a feature.
- Languages: Hindi and regional Indian languages, plus English. The promo site's language marquee names English, Hindi, Odia, Bengali, Tamil, Telugu, Marathi and others.
- **Concept stage.** The product isn't a certified medical device. Never make medical claims, accuracy figures or regulatory statements. Every public surface carries "Concept prototype. Not a certified medical device."
- Doctor matching is a routing aid, not a diagnosis. Demos show made-up departments and doctors only.

## Brand Commitments

- Product name: "MedMac" (confirmed by the user for the promo site; the project folder still says AI Doctor Machine). The name must be changeable from one place.
- The promo site's visual direction was pinned by the user in the website brief and is recorded in the surface brief and later in DESIGN.md, not here.

## Evidence on Hand

None real. There are no customers, hospital partners, clinical validation, accuracy figures, certifications or deployment numbers.

- Stats on the promo site are **illustrative placeholders** and must be labelled that way.
- Team members on the promo site are **invented placeholders** until the user supplies real data (`src/data/team.ts`, photos at `src/assets/team/person-1.jpg` and `person-2.jpg`).
- Doctor names, queue numbers and departments in demos are made up and must look like demo content.

## Product Principles

1. **One machine, one hand-off.** Always show the whole path from vitals to queue. That's the product.
2. **Their language first.** Speaking in your own language is a core capability, not an afterthought.
3. **Routing, not diagnosis.** The machine routes the patient to the right doctor and never claims to diagnose.
4. **Honest at concept stage.** Demonstrate freely, label made-up content, and claim nothing unproven.

## Accessibility & Inclusion

- Multilingual from day one: Hindi and regional Indic scripts must render and fit correctly.
- Public hospital touchscreen: expect a wide range of ages, abilities and literacy levels. Voice input is part of the product.
- Promo site: respect `prefers-reduced-motion`, keep visible focus states and AA contrast, and stay fully usable without a mouse.
