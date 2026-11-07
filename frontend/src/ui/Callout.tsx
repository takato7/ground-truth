import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cx } from "./cx"
import { Surface, type SurfaceProps } from "./Surface"
import { Text } from "./Text"
import "./Callout.css"

/**
 * Icon + title + message on a surface. "row" for inline notices (standing, privacy),
 * "center" for empty and blocked states (caught up, News locked).
 */
export function Callout({
  icon: Icon,
  title,
  children,
  action,
  layout = "row",
  ...surface
}: SurfaceProps & {
  icon: LucideIcon
  title?: string
  children?: ReactNode
  action?: ReactNode
  layout?: "row" | "center"
}) {
  return (
    <Surface
      pad={layout === "center" ? "lg" : "md"}
      {...surface}
      className={cx("callout", `callout-${layout}`)}
    >
      <Icon
        className="callout-icon"
        size={layout === "center" ? 28 : 22}
        aria-hidden
      />
      <div className="callout-text">
        {title && (
          <Text as="h2" role="heading" className="callout-title">
            {title}
          </Text>
        )}
        {children && (
          <Text role="body" color="secondary">
            {children}
          </Text>
        )}
        {action && <div className="callout-action">{action}</div>}
      </div>
    </Surface>
  )
}
