"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  getVolume,
  isAudioEnabled,
  setAudioEnabled as engineSetEnabled,
  setVolume as engineSetVolume,
} from "@/lib/audio/engine"

const STORAGE_KEY_ENABLED = "becoming-audio-enabled"
const STORAGE_KEY_VOLUME = "becoming-audio-volume"

interface AudioContextValue {
  enabled: boolean
  toggle: () => void
  setEnabled: (value: boolean) => void
  volume: number
  setVolume: (value: number) => void
}

const Ctx = createContext<AudioContextValue | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState<boolean>(false)
  const [volume, setVolumeState] = useState<number>(getVolume())

  // Hydrate from localStorage on first mount.
  useEffect(() => {
    try {
      const savedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED) === "1"
      const savedVol = parseFloat(localStorage.getItem(STORAGE_KEY_VOLUME) || "")
      if (Number.isFinite(savedVol)) {
        setVolumeState(savedVol)
        engineSetVolume(savedVol)
      }
      setEnabledState(savedEnabled)
      engineSetEnabled(savedEnabled)
    } catch {
      // ignore
    }
  }, [])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    engineSetEnabled(value)
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, value ? "1" : "0")
    } catch {
      // ignore
    }
  }, [])

  const toggle = useCallback(() => {
    setEnabled(!isAudioEnabled())
  }, [setEnabled])

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value))
    setVolumeState(clamped)
    engineSetVolume(clamped)
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped))
    } catch {
      // ignore
    }
  }, [])

  return (
    <Ctx.Provider value={{ enabled, toggle, setEnabled, volume, setVolume }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAudio(): AudioContextValue {
  const v = useContext(Ctx)
  if (!v) {
    return {
      enabled: false,
      toggle: () => {},
      setEnabled: () => {},
      volume: 0.45,
      setVolume: () => {},
    }
  }
  return v
}
