// Light / dark theme. "system" follows the OS; the resolved theme lands on <html data-theme>.

import { useEffect, useState } from "react"

export type ThemeMode = "system" | "light" | "dark"

const KEY = "groundline-theme"
const query = () => window.matchMedia?.("(prefers-color-scheme: dark)")

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === "light" || v === "dark" || v === "system") return v
  } catch {
    // Storage blocked: follow the system.
  }
  return "system"
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(readMode)

  useEffect(() => {
    const mq = query()
    const apply = () => {
      const dark = mode === "dark" || (mode === "system" && !!mq?.matches)
      document.documentElement.dataset.theme = dark ? "dark" : "light"
    }
    apply()
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      // Not saved; the choice still applies this session.
    }
    mq?.addEventListener("change", apply)
    return () => mq?.removeEventListener("change", apply)
  }, [mode])

  return { mode, setMode }
}
