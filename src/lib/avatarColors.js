// Pastel background/accent pairs used for channel avatars in the admin
// dashboard, matching the mockup's category palette. Picked deterministically
// per channel so the same channel always gets the same color.
const PASTEL_PAIRS = [
  ['#FDE2ED', '#FAC7DC'],
  ['#E1F3E4', '#C3E8C9'],
  ['#E1ECFB', '#C2D9F5'],
  ['#EAE1FB', '#D3C2F0'],
  ['#FDECD6', '#FAD8AC'],
  ['#DDF1F5', '#B9E4EC'],
  ['#FCE5DD', '#F8C7B7'],
  ['#E4E1FB', '#C9C3F5'],
  ['#FCE1E8', '#F8C0CF'],
  ['#E3F1DE', '#C6E4BB'],
]

export function pastelBackgroundFor(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return PASTEL_PAIRS[hash % PASTEL_PAIRS.length][0]
}
