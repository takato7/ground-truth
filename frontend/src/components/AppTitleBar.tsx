import { Menu } from "lucide-react"
import { motion, useTransform, type MotionValue } from "motion/react"
import { TitleBar, pressSmall } from "../ui"
import { IdentitySwitch } from "./IdentitySwitch"

/** One page name, fully visible when its page is centred and fading as you swipe away. */
function PageTitle({
  label,
  i,
  count,
  progress,
}: {
  label: string
  i: number
  count: number
  progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, (p) =>
    Math.max(0, 1 - Math.abs(p * (count - 1) - i)),
  )
  return (
    <motion.span className="titlebar-page" style={{ opacity }}>
      {label}
    </motion.span>
  )
}

/** Menu (placeholder for now) · current page name · identity switch. */
export function AppTitleBar({
  labels,
  progress,
}: {
  labels: string[]
  progress: MotionValue<number>
}) {
  return (
    <TitleBar
      leading={
        <motion.button
          type="button"
          className="bar-btn"
          whileTap={pressSmall}
          aria-label="Menu"
        >
          <Menu size={24} aria-hidden />
        </motion.button>
      }
      title={labels.map((label, i) => (
        <PageTitle
          key={label}
          label={label}
          i={i}
          count={labels.length}
          progress={progress}
        />
      ))}
      trailing={<IdentitySwitch />}
    />
  )
}
