// Procedural Web Audio engine.
//
// Everything is synthesized in the browser — no audio files. The sound
// palette is deliberately small:
// - One ethereal pentatonic pad ("ambient") for the Garden page.
// - Three short chimes for actions: bloom (new entry), complete
//   (project done), tick (milestone checked).
//
// Browsers block AudioContext from starting without a user gesture.
// We create the context lazily and resume it on every call; the first
// user interaction unlocks it.

type SoundName = "bloom" | "complete" | "tick"

interface AmbientHandle {
  stop: () => void
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = false
let masterVolume = 0.45 // 0..1
let currentAmbient: AmbientHandle | null = null

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
  if (!value && currentAmbient) {
    currentAmbient.stop()
    currentAmbient = null
  }
}

export function isAudioEnabled(): boolean {
  return enabled
}

export function setVolume(value: number) {
  masterVolume = Math.max(0, Math.min(1, value))
  if (master) master.gain.value = masterVolume
}

export function getVolume(): number {
  return masterVolume
}

// --- Action sounds --------------------------------------------------------

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
  const notes = [523.25, 659.25, 783.99] // C5 E5 G5 — gentle major triad up
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    osc.type = "sine"
    osc.frequency.value = freq

    // Soft lowpass for warmth
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
  const notes = [392.0, 587.33, 783.99] // G4 D5 G5 — open chord, warm bell
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
  osc.frequency.value = 880 // A5
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

// --- Ambient pad ----------------------------------------------------------

// Pentatonic-ish pad voiced low to give Monument Valley calm.
// Each note: sine oscillator → lowpass → gain → master.
// A slow random LFO detunes each note by a few Hz so the chord breathes.
const PAD_NOTES = [
  130.81, // C3
  196.0, // G3
  261.63, // C4
  329.63, // E4
  392.0, // G4
  523.25, // C5
]

export function startAmbient(): AmbientHandle | null {
  if (!enabled) return null
  const c = getContext()
  if (!c || !master) return null
  if (currentAmbient) return currentAmbient // already running

  const now = c.currentTime
  const oscs: OscillatorNode[] = []
  const lfos: OscillatorNode[] = []
  const gains: GainNode[] = []
  const fadeIn = 4.0

  PAD_NOTES.forEach((freq, i) => {
    const osc = c.createOscillator()
    osc.type = "sine"
    osc.frequency.value = freq

    // Slow LFO for organic detune
    const lfo = c.createOscillator()
    lfo.type = "sine"
    // Different super-slow rates per note keep the chord shimmering
    lfo.frequency.value = 0.04 + i * 0.018
    const lfoDepth = c.createGain()
    lfoDepth.gain.value = 1.2 + i * 0.4 // Hz of detune
    lfo.connect(lfoDepth)
    lfoDepth.connect(osc.frequency)

    // Mild lowpass for warmth, opens slightly with index so high notes still glimmer
    const filter = c.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 600 + i * 220
    filter.Q.value = 0.6

    // Gentle pan spread so the chord opens stereo
    const panner = c.createStereoPanner ? c.createStereoPanner() : null
    if (panner) {
      panner.pan.value = (i / (PAD_NOTES.length - 1)) * 1.2 - 0.6
    }

    const gain = c.createGain()
    // Quieter than the chime so it doesn't dominate; lower notes louder.
    const target = 0.055 - i * 0.005
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(target, now + fadeIn)

    osc.connect(filter)
    filter.connect(gain)
    if (panner) {
      gain.connect(panner)
      panner.connect(master)
    } else {
      gain.connect(master)
    }

    osc.start(now)
    lfo.start(now)
    oscs.push(osc)
    lfos.push(lfo)
    gains.push(gain)
  })

  const handle: AmbientHandle = {
    stop: () => {
      const stopNow = c.currentTime
      const fadeOut = 1.2
      gains.forEach((g) => {
        g.gain.cancelScheduledValues(stopNow)
        g.gain.setValueAtTime(g.gain.value, stopNow)
        g.gain.linearRampToValueAtTime(0, stopNow + fadeOut)
      })
      // Stop oscillators after the fade so the ramp completes.
      window.setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop()
          } catch {
            // already stopped
          }
        })
        lfos.forEach((l) => {
          try {
            l.stop()
          } catch {
            // already stopped
          }
        })
      }, fadeOut * 1000 + 200)
      if (currentAmbient === handle) currentAmbient = null
    },
  }
  currentAmbient = handle
  return handle
}

export function stopAmbient(): void {
  if (currentAmbient) {
    currentAmbient.stop()
    currentAmbient = null
  }
}
