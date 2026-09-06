// Two kinds of randomness, deliberately kept apart.
//
// shuffle() is a fresh draw every time it's called — the home feed uses it so
// the kid gets a different mix on every visit instead of the same
// newest-upload-first list.
//
// shuffleForPageSession() is a random-but-frozen order: the same catalog comes
// back in the same order for as long as the tab keeps the app alive, and only
// gets reshuffled by a real page load (reload, direct URL, new tab). The watch
// page's "up next" uses it so that picking a video out of the list doesn't
// reshuffle the list underneath it — the kid can tap the third thumbnail
// expecting the fourth one to still be there afterwards.

export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Fixed when this module is first evaluated, i.e. once per page load. Module
// state survives client-side route changes but not a reload, which is exactly
// the lifetime "until the page is loaded fresh" describes — so it's kept in
// memory rather than in sessionStorage, which would outlive a reload.
const PAGE_SESSION_SEED = Math.floor(Math.random() * 2 ** 32)

// FNV-1a over the key, seeded per page load and avalanched at the end so that
// near-identical keys (YouTube ids differing in one character) don't land next
// to each other. Returns a stable number in [0, 1) — the item's position in
// the session's shuffle.
function seededRank(key) {
  let hash = (0x811c9dc5 ^ PAGE_SESSION_SEED) >>> 0
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x2545f491)
  hash ^= hash >>> 13
  return (hash >>> 0) / 2 ** 32
}

// Ranking each item independently (rather than shuffling the array once and
// caching it) means the order holds up as the input changes: dropping the
// video that's currently playing, or a background feed refresh adding an
// upload, leaves every other video where the kid last saw it.
export function shuffleForPageSession(items, keyOf) {
  return items
    .map((item) => ({ item, rank: seededRank(String(keyOf(item))) }))
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.item)
}
