import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cx } from "./cx"
import type { Tone } from "./Surface"
import "./Chip.css"

/**
 * Small rounded label. "tinted" fills with the tone (or sits light on a toned parent),
 * "outline" is a hairline, "solid" is inverted (the "you" marker).
 */
export function Chip({
  variant = "tinted",
  tone,
  icon: Icon,
  onClick,
  children,
}: {
  variant?: "tinted" | "outline" | "solid"
  tone?: Tone
  icon?: LucideIcon
  onClick?: () => void
  children: ReactNode
}) {
  const className = cx(
    "chip",
    `chip-${variant}`,
    tone && `tone-${tone} chip-toned`,
  )
  const body = (
    <>
      {Icon && <Icon size={14} strokeWidth={2.2} aria-hidden />}
      {children}
    </>
  )
  return onClick ? (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  ) : (
    <span className={className}>{body}</span>
  )
}

/** Count bubble on a tab icon. */
export function Badge({ count }: { count: number }) {
  return count > 0 ? <span className="badge">{count}</span> : null
}
