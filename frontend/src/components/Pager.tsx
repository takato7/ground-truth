import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useRef, useState, type ReactNode, type RefObject } from "react"
import type { LucideIcon } from "lucide-react"

export interface PageDef {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
  content: ReactNode
}

/** Full-height pages side by side, snapping one at a time; swipe or use the tab bar. */
export function usePager(count: number) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollXProgress } = useScroll({ container: ref })
  const [index, setIndex] = useState(0)
  useMotionValueEvent(scrollXProgress, "change", (p) =>
    setIndex(Math.round(p * (count - 1))),
  )
  const goTo = (i: number) => {
    const el = ref.current
    if (!el) return
    el.scrollTo?.({ left: i * el.clientWidth, behavior: "smooth" })
    setIndex(i)
  }
  return { ref, progress: scrollXProgress, index, goTo }
}

export function Pager({
  pagerRef,
  pages,
}: {
  pagerRef: RefObject<HTMLDivElement | null>
  pages: PageDef[]
}) {
  return (
    <div className="pager" ref={pagerRef}>
      {pages.map((p) => (
        <motion.div
          key={p.id}
          className="page"
          layoutScroll
          aria-label={p.label}
        >
          {p.content}
        </motion.div>
      ))}
    </div>
  )
}

/** Floating frosted-glass tab bar. The highlight follows the swipe, not just the taps. */
export function TabBar({
  pages,
  progress,
  index,
  onSelect,
}: {
  pages: PageDef[]
  progress: MotionValue<number>
  index: number
  onSelect: (i: number) => void
}) {
  const x = useTransform(progress, (p) => `${p * (pages.length - 1) * 100}%`)
  return (
    <nav className="tabbar" aria-label="Pages">
      <div className="tabbar-inner">
        <motion.span
          className="tabbar-pill"
          style={{ x, width: `${100 / pages.length}%` }}
        />
        {pages.map((p, i) => {
          const Icon = p.icon
          return (
            <button
              key={p.id}
              className={`tab ${i === index ? "on" : ""}`}
              aria-current={i === index ? "page" : undefined}
              onClick={() => onSelect(i)}
            >
              <span className="tab-icon">
                <Icon
                  size={22}
                  strokeWidth={i === index ? 2.3 : 1.8}
                  aria-hidden
                />
                {!!p.badge && <span className="tab-badge">{p.badge}</span>}
              </span>
              {p.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
