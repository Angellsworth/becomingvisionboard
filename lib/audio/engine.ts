// Procedural Web Audio engine + background music player.
//
// SFX (bloom / complete / tick) are synthesized — small chimes that
// don't need files. Background music is an audio file you drop into
// /public/audio/garden.mp3 (intended for Vivaldi's The Four Seasons,
// but any music works). The file loops while the user is on the
// Memory Garden page and the audio toggle is on.

type SoundName = "bloom" | "complete" | "tick"

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = false
let masterVolume = 0.45 // 0..1

// --- AudioContext --------------------------------------------------------

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
      master = ctx.createGain()
      master.gain.value = masterVolume
      master.connect(ctx.destination)
    } catch {
      return null
    }
  }
  if (ctx.state === "suspended") {
    void ctx.resume()
  }
  return ctx
}

export function setAudioEnabled(value: boolean) {
  enabled = value
  if (!value) {
    stopMusic()
  }
}

export function isAudioEnabled(): boolean {
  return enabled
}

export function setVolume(value: number) {
  masterVolume = Math.max(0, Math.min(1, value))
  if (master) master.gain.value = masterVolume
  // Apply to any music currently playing too.
  if (musicAudio && musicAudio.volume > 0) {
    musicAudio.volume = masterVolume
  }
}

export function getVolume(): number {
  return masterVolume
}

// --- Action sounds (synthesized) -----------------------------------------

export function playSound(name: SoundName): void {
  if (!enabled) return
  const c = getContext()
  if (!c || !master) return
  switch (name) {
    case "bloom":
      playBloom(c, master)
      return
    case "complete":
      playComplete(c, master)
      return
    case "tick":
      playTick(c, master)
      return
  }
}

function playBloom(c: AudioContext, dest: AudioNode) {
  const now = c.currentTime
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    osc.type = "sine"
    osc.frequency.value = freq
    const filter = c.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 2200
    filter.Q.value = 0.4
    const gain = c.createGain()
    const start = now + i * 0.09
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.18, start + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 1.3)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(dest)
    osc.start(start)
    osc.stop(start + 1.4)
  })
}

function playComplete(c: AudioContext, dest: AudioNode) {
  const now = c.currentTime
  const notes = [392.0, 587.33, 783.99]
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    osc.type = "sine"
    osc.frequency.value = freq
    const filter = c.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 1800
    filter.Q.value = 0.3
    const gain = c.createGain()
    const start = now + i * 0.07
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.16, start + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 2.4)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(dest)
    osc.start(start)
    osc.stop(start + 2.5)
  })
}

function playTick(c: AudioContext, dest: AudioNode) {
  const now = c.currentTime
  const osc = c.createOscillator()
  osc.type = "sine"
  osc.frequency.value = 880
  const filter = c.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 2400
  filter.Q.value = 0.4
  const gain = c.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.12, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(dest)
  osc.start(now)
  osc.stop(now + 0.4)
}

// --- Background music (audio file) ---------------------------------------

const MUSIC_URL = "/audio/garden.mp3"
const FADE_IN_MS = 3000
const FADE_OUT_MS = 1000

let musicAudio: HTMLAudioElement | null = null
let fadeTimer: number | null = null
let musicError = false
const musicErrorListeners = new Set<(loaded: boolean) => void>()

function clearFade() {
  if (fadeTimer !== null) {
    window.clearInterval(fadeTimer)
    fadeTimer = null
  }
}

function getMusicAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null
  if (musicAudio) return musicAudio
  try {
    const a = new Audio(MUSIC_URL)
    a.loop = true
    a.preload = "auto"
    a.volume = 0
    a.addEventListener("error", () => {
      musicError = true
      musicErrorListeners.forEach((cb) => cb(false))
    })
    a.addEventListener("canplay", () => {
      musicError = false
      musicErrorListeners.forEach((cb) => cb(true))
    })
    musicAudio = a
    return a
  } catch {
    return null
  }
}

/** Returns true if music started successfully, false if disabled or no file. */
export function startMusic(): boolean {
  if (!enabled) return false
  const a = getMusicAudio()
  if (!a) return false

  clearFade()
  a.volume = 0
  const playPromise = a.play()
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((e) => {
      console.warn("[audio] music play() rejected — likely needs a user gesture or file missing", e)
    })
  }

  const target = masterVolume
  const steps = Math.max(1, Math.round(FADE_IN_MS / 50))
  const step = target / steps
  fadeTimer = window.setInterval(() => {
    if (!musicAudio) {
      clearFade()
      return
    }
    musicAudio.volume = Math.min(target, musicAudio.volume + step)
    if (musicAudio.volume >= target) clearFade()
  }, 50)
  return true
}

export function stopMusic(): void {
  if (!musicAudio) return
  const a = musicAudio
  clearFade()
  const startVol = a.volume
  const steps = Math.max(1, Math.round(FADE_OUT_MS / 50))
  const step = startVol / steps
  fadeTimer = window.setInterval(() => {
    a.volume = Math.max(0, a.volume - step)
    if (a.volume <= 0.005) {
      a.pause()
      a.currentTime = 0
      a.volume = 0
      clearFade()
    }
  }, 50)
}

/** Subscribe to load state — true once the music file is playable. */
export function onMusicLoadState(cb: (loaded: boolean) => void): () => void {
  musicErrorListeners.add(cb)
  // Synchronously report current state.
  const a = getMusicAudio()
  if (a) {
    if (musicError) cb(false)
    else if (a.readyState >= 3) cb(true)
  }
  return () => {
    musicErrorListeners.delete(cb)
  }
}

export function getMusicUrl(): string {
  return MUSIC_URL
}
