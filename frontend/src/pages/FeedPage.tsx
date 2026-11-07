import { ArrowRight, PartyPopper } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { FeedCard, SPRING } from "../components/FeedCard"
import { IdentityChip, PageHeader } from "../components/ui"
import { useStore } from "../data/store"
import type { Card } from "../data/types"

export interface OpenSheet {
  (card: Card, from: "feed" | "you", el: HTMLElement): void
}

/** Slot that keeps its height while its card is open as a sheet, so the list doesn't jump. */
export function CardSlot({
  active,
  height,
  children,
}: {
  active: boolean
  height?: number
  children: React.ReactNode
}) {
  return active ? (
    <div className="card-ghost" style={{ height }} />
  ) : (
    <>{children}</>
  )
}

export function FeedPage({
  activeId,
  activeHeight,
  onOpen,
  onGoNews,
}: {
  activeId?: string
  activeHeight?: number
  onOpen: OpenSheet
  onGoNews: () => void
}) {
  const { open, state } = useStore()
  const left = open.length

  return (
    <div className="page-inner">
      <PageHeader
        title="Feed"
        right={<IdentityChip identity={state.identity} />}
      />
      <p className="feed-sub">
        {left
          ? `${left} ${left === 1 ? "question" : "questions"} this week · about ${left < 3 ? "a minute" : "two minutes"}`
          : "Nothing left this week"}
      </p>

      <div className="card-list">
        <AnimatePresence initial={false} mode="popLayout">
          {open.map((card) => (
            <motion.div
              key={card.id}
              layout
              transition={SPRING}
              exit={{ opacity: 0, transition: { duration: 0 } }}
            >
              <CardSlot active={activeId === card.id} height={activeHeight}>
                <FeedCard
                  card={card}
                  layoutId={`feed-${card.id}`}
                  onOpen={(el) => onOpen(card, "feed", el)}
                />
              </CardSlot>
            </motion.div>
          ))}
          {left === 0 && (
            <motion.div
              key="caught-up"
              layout
              className="caught-up"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.25 } }}
            >
              <PartyPopper size={28} aria-hidden />
              <h2>You’re all caught up</h2>
              <p>
                New questions arrive on Mondays. The latest from ACAPS is on
                News.
              </p>
              <button className="pill-link" onClick={onGoNews}>
                Open News <ArrowRight size={16} aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
