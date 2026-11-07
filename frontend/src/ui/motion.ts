// Motion values shared by every animated component. Tune here, not at call sites.

export const spring = {
  /** Cards growing into sheets and back, list reflow. */
  layout: { type: "spring", stiffness: 420, damping: 38, mass: 0.9 },
  /** Question steps sliding in a sheet. */
  step: { type: "spring", stiffness: 500, damping: 42 },
} as const

/**
 * Corner radius of anything that morphs with a layoutId. It must be set inline (not only in CSS)
 * so the radius stays round while the element scales. Matches --radius-xl.
 */
export const layoutRadius = { borderRadius: 24 } as const

export const press = { scale: 0.98 } as const
export const pressSmall = { scale: 0.97 } as const

/** Pause after a tap so the selection registers before the flow moves on. */
export const SELECT_DELAY_MS = 200

/** Sheet drag-to-dismiss thresholds. */
export const DISMISS = { distance: 120, velocity: 600 } as const

export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
} as const
