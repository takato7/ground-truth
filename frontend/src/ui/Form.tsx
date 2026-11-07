// Inputs: text field, and the tap-to-answer choice list used by every question.

import { motion } from "motion/react"
import { cx } from "./cx"
import { pressSmall } from "./motion"
import "./Form.css"

export function TextField({
  value,
  onChange,
  label,
  placeholder,
  multiline,
  autoFocus,
  maxLength,
  onEnter,
}: {
  value: string
  onChange: (v: string) => void
  /** Accessible name. */
  label: string
  placeholder?: string
  multiline?: boolean
  autoFocus?: boolean
  maxLength?: number
  onEnter?: () => void
}) {
  const shared = {
    className: "field type-body",
    value,
    placeholder,
    autoFocus,
    maxLength,
    "aria-label": label,
  }
  return multiline ? (
    <textarea {...shared} rows={5} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input
      {...shared}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
    />
  )
}

export interface Choice<T> {
  label: string
  value: T
  /** Shown as an outline: the "not sure" / "something else" escape hatch. */
  quiet?: boolean
}

/** One answer per tap. The selected row inverts. */
export function ChoiceList<T>({
  options,
  selected,
  onPick,
}: {
  options: Choice<T>[]
  selected: T | undefined
  onPick: (v: T) => void
}) {
  return (
    <div className="choice-list" role="group">
      {options.map((o) => (
        <motion.button
          type="button"
          key={o.label}
          whileTap={pressSmall}
          aria-pressed={selected === o.value}
          className={cx(
            "choice type-body",
            selected === o.value && "selected",
            o.quiet && "quiet",
          )}
          onClick={() => onPick(o.value)}
        >
          {o.label}
        </motion.button>
      ))}
    </div>
  )
}

/** Large selectable row with icon, title and description (onboarding). */
export function OptionCard({
  icon: Icon,
  title,
  body,
  selected,
  onSelect,
}: {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>
  title: string
  body: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={pressSmall}
      className={cx("option-card", selected && "selected")}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <Icon size={22} aria-hidden />
      <span className="stack gap-1">
        <span className="type-heading">{title}</span>
        <span className="type-meta">{body}</span>
      </span>
    </motion.button>
  )
}
