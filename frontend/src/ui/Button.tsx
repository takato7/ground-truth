import type { LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { cx } from "./cx"
import { pressSmall } from "./motion"
import "./Button.css"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link"

/** Every tappable text action. Icon-only actions use IconButton. */
export function Button({
  variant = "primary",
  size = "md",
  block,
  icon: Icon,
  iconEnd: IconEnd,
  disabled,
  onClick,
  className,
  children,
}: {
  variant?: ButtonVariant
  size?: "md" | "sm"
  /** Full width. Defaults on for primary, as iOS bottom actions are. */
  block?: boolean
  icon?: LucideIcon
  iconEnd?: LucideIcon
  disabled?: boolean
  onClick?: () => void
  className?: string
  children: ReactNode
}) {
  const iconSize = size === "sm" ? 16 : 18
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : pressSmall}
      className={cx(
        "btn",
        `btn-${variant}`,
        `btn-${size}`,
        (block ?? variant === "primary") && "btn-block",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {Icon && <Icon size={iconSize} aria-hidden />}
      {children}
      {IconEnd && <IconEnd size={iconSize} aria-hidden />}
    </motion.button>
  )
}

/** Round icon-only button: close, back. */
export function IconButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={pressSmall}
      className="icon-btn"
      onClick={onClick}
      aria-label={label}
    >
      <Icon size={20} aria-hidden />
    </motion.button>
  )
}
