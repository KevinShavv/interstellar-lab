import { computed, onMounted, onUnmounted, unref, watch } from 'vue'

import { useSiteChrome } from '@/composables/useSiteChrome'

const sharedPlayer = {
  audio: null,
  activeToken: null,
  currentSource: '',
  interactionHandler: null,
  releaseTimer: 0,
}

function ensureAudio() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!sharedPlayer.audio) {
    sharedPlayer.audio = new Audio()
    sharedPlayer.audio.preload = 'auto'
    sharedPlayer.audio.loop = true
  }

  return sharedPlayer.audio
}

function removeInteractionHandler() {
  if (!sharedPlayer.interactionHandler || typeof window === 'undefined') {
    return
  }

  const handler = sharedPlayer.interactionHandler
  window.removeEventListener('pointerdown', handler)
  window.removeEventListener('keydown', handler)
  sharedPlayer.interactionHandler = null
}

function requestPlayback(audio) {
  if (!audio || audio.muted) {
    return
  }

  const playPromise = audio.play()
  if (typeof playPromise?.then !== 'function') {
    return
  }

  playPromise
    .then(() => {
      removeInteractionHandler()
    })
    .catch(() => {
      if (sharedPlayer.interactionHandler || typeof window === 'undefined') {
        return
      }

      sharedPlayer.interactionHandler = () => {
        requestPlayback(audio)
      }

      window.addEventListener('pointerdown', sharedPlayer.interactionHandler, { passive: true })
      window.addEventListener('keydown', sharedPlayer.interactionHandler)
    })
}

function claimTrack(token, source, muted, volume, loop) {
  const audio = ensureAudio()
  if (!audio || !source) {
    return
  }

  if (sharedPlayer.releaseTimer) {
    window.clearTimeout(sharedPlayer.releaseTimer)
    sharedPlayer.releaseTimer = 0
  }

  sharedPlayer.activeToken = token
  audio.loop = loop
  audio.volume = volume
  audio.muted = muted

  if (sharedPlayer.currentSource !== source) {
    sharedPlayer.currentSource = source
    audio.src = source
    audio.load()
  }

  if (muted) {
    audio.pause()
    return
  }

  requestPlayback(audio)
}

function releaseTrack(token) {
  if (typeof window === 'undefined' || sharedPlayer.activeToken !== token) {
    return
  }

  if (sharedPlayer.releaseTimer) {
    window.clearTimeout(sharedPlayer.releaseTimer)
  }

  sharedPlayer.releaseTimer = window.setTimeout(() => {
    if (sharedPlayer.activeToken !== token) {
      return
    }

    sharedPlayer.audio?.pause()
    sharedPlayer.activeToken = null
    sharedPlayer.releaseTimer = 0
  }, 180)
}

export function useAmbientAudio(source, options = {}) {
  const token = Symbol('ambient-audio')
  const { volumeMuted } = useSiteChrome()
  const resolvedSource = computed(() => unref(source))
  const volume = options.volume ?? 0.38
  const loop = options.loop ?? true

  function syncTrack() {
    claimTrack(token, resolvedSource.value, volumeMuted.value, volume, loop)
  }

  onMounted(() => {
    syncTrack()
  })

  watch(resolvedSource, () => {
    syncTrack()
  })

  watch(volumeMuted, () => {
    syncTrack()
  })

  onUnmounted(() => {
    releaseTrack(token)
  })
}
