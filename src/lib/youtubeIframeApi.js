// Loads the official YouTube IFrame Player API script once and resolves
// with the global `YT` namespace it attaches to `window`. Playback is
// always streamed live from YouTube through this embedded player — nothing
// is downloaded or re-hosted.

let apiPromise = null

export function loadYouTubeIframeApi() {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }

    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      resolve(window.YT)
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })

  return apiPromise
}
