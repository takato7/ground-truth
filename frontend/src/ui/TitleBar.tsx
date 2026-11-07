import type { ReactNode } from "react"
import "./TitleBar.css"

/**
 * App title bar: leading action, centred title, trailing action, hairline below.
 * Title is a node so the caller can animate it (the pager crossfades page names).
 */
export function TitleBar({
  leading,
  title,
  trailing,
}: {
  leading?: ReactNode
  title: ReactNode
  trailing?: ReactNode
}) {
  return (
    <header className="titlebar">
      <div className="titlebar-side">{leading}</div>
      <div className="titlebar-title type-heading">{title}</div>
      <div className="titlebar-side titlebar-trailing">{trailing}</div>
    </header>
  )
}
