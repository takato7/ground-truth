import type { ElementType, ReactNode } from "react"
import { cx } from "./cx"

/** The five type roles. Sizes and weights live in base.css; pick by what the text is for. */
export type TextRole = "title" | "heading" | "body" | "meta" | "label"

/** Primary and secondary cover nearly everything. tone = the surface's accent ink. */
export type TextColor = "primary" | "secondary" | "tone" | "danger"

export function textClass(role: TextRole, color?: TextColor) {
  return cx(`type-${role}`, color && `fg-${color}`)
}

/**
 * All copy goes through here (or textClass), so type stays on the five roles.
 * meta and label are secondary by default; everything else is primary.
 */
export function Text({
  as: As = "p",
  role = "body",
  color,
  className,
  children,
}: {
  as?: ElementType
  role?: TextRole
  color?: TextColor
  className?: string
  children: ReactNode
}) {
  return <As className={cx(textClass(role, color), className)}>{children}</As>
}
