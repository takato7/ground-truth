import type { ElementType, ReactNode } from "react"
import { cx } from "./cx"
import "./Surface.css"

/** neutral for nearly everything; brand (a light ACAPS-teal tint) only where an accent is earned. */
export type Tone = "neutral" | "brand"
export type Pad = "none" | "sm" | "md" | "lg"

export interface SurfaceProps {
  tone?: Tone
  pad?: Pad
  /** Floats above the page (popovers, the lock card). */
  elevated?: boolean
  /** Sits on a toned parent and lets the tint show through (choices, bars inside a sheet). */
  well?: boolean
}

/**
 * Class names for a surface, for elements that can't be <Surface> (motion elements with a layoutId).
 */
export function surfaceClass({
  tone = "neutral",
  pad = "md",
  elevated,
  well,
}: SurfaceProps = {}) {
  return cx(
    "surface",
    `tone-${tone}`,
    `pad-${pad}`,
    elevated && "elevated",
    well && "well",
  )
}

/** The one rounded panel: cards, stats, callouts and wells are all a Surface. */
export function Surface({
  as: As = "div",
  className,
  children,
  ...props
}: SurfaceProps & {
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  return <As className={cx(surfaceClass(props), className)}>{children}</As>
}
