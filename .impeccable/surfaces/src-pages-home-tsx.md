---
version: 1
slug: "src-pages-home-tsx"
primary_target: "src/pages/Home.tsx"
related_targets: ["src/pages/Team.tsx"]
---

# Surface: MedMac promo site (Home `/` + Team `/team`)

Mode: Persuade. Visitors: hospital decision-makers, partners, curious. Action: try the hologram demo (working, on-page); secondary: contact, meet the team.
Proof: the mechanism demonstrated (flow, hologram, pay→queue). All stats, doctors, team are labelled placeholders. Footer disclaimer mandatory.

## Direction contract

THESIS: One machine carries a patient from vitals to the right doctor’s queue. The page deals that hand-off out as cards: status cards dealt from the kiosk’s own screen, the home screen’s five buttons as a hand that fans open, the six steps as a deck where each beat tosses the last card away, and figures on cards that turn over. Refuses the healthtech SaaS default: soft blue gradients, smiling-doctor stock, flat feature-card grids.

OWN-WORLD: A dark showroom that is not too bright. The ground is graphite night (#07080a) with bone text (#eceae4). The kiosk’s blue edge light (#4aa3ff) is the only ambient glow, in slow drifting pools and the halo behind the machine. Ember gold (#e9a440) is rationed to the primary CTA, the queue token, the active beat and one card per hand. The hologram section keeps its cyan on deep navy. Satoshi (Fontshare) everywhere, set big and tight; Noto Sans for the Indian scripts. The cards are glass or graphite slabs with hairline edges and deep black shadows. Normal cursor.

STORY: Visitor sees one stop replace five; watches each step take the screen; taps their own pain on the body; watches a payment become a place in line; meets the two people building it.

FIRST VIEWPORT: The headline in three lines on the left, with a char-masked reveal. Below it: the tagline, the "See it work" CTA and a ghost route to Team. On the right, the user’s kiosk photo (src/assets/kiosk/) on a blue halo, which rises out of blur. Four glass status cards (voice, vitals, match, token) are dealt out of its screen, float idly, and parallax at their own depths on fine pointers. An ECG trace runs along the floor into the kiosk’s base. Pill nav at the top.

FORM: seed: none (pinned). The user asked to "use this image and play with cards man like gsap cards", to keep it "kinda dark theme", "dont make this too bright", with "font satoshi everywhere" and to "keep the mouse pointer normal". Signature interactions: dealt hero cards, the Screens fan, the Flow deck toss, the Numbers flip, and the tappable anatomical hologram. Motion grammar: expo.out entrances, scrubbed pins with power2/3 inOut card moves, one funk overshoot for small pops. Every pinned or scrubbed move has a reduced-motion end state.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
