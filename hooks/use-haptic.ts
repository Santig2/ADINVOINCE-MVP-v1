"use client"

import { useCallback } from "react"

export function useHaptic() {
  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      try {
        switch (type) {
          case "light":
            window.navigator.vibrate(20)
            break
          case "medium":
            window.navigator.vibrate(50)
            break
          case "heavy":
            window.navigator.vibrate(100)
            break
          case "success":
            window.navigator.vibrate([30, 50, 30])
            break
          case "error":
            window.navigator.vibrate([100, 50, 100, 50, 100])
            break
        }
      } catch (e) {
        // Ignore errors if vibrate is not allowed or supported
      }
    }
  }, [])

  return { triggerHaptic }
}
