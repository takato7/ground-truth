import { ArrowRight, Inbox } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { ReactNode } from "react"
import { KIND, KIND_ORDER } from "../components/kind"
import { QuestionCard } from "../components/QuestionCard"
import { useStore } from "../data/store"
import type { Card } from "../data/types"
import {
  Button,
  Callout,
  CardList,
  Divider,
  Illustration,
  Page,
  Text,
  spring,
} from "../ui"
import "./FeedPage.css"

export type OpenSheet = (
  card: Card,
  from: "feed" | "you",
  el: HTMLElement,
) => void

/** Keeps a card's place (and height) in its list while it's open as a sheet. */
export function CardSlot({
  active,
  height,
  children,
}: {
  active: boolean
  height?: number
  children: ReactNode
}) {
  return active ? (
    <div className="card-ghost" style={{ height }} />
  ) : (
    <>{children}</>
  )
}

const instant = { opacity: 0, transition: { duration: 0 } }

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
  const { open } = useStore()
  const left = open.length

  // One flat list (dividers + cards) so AnimatePresence can reflow everything together.
  const items = KIND_ORDER.flatMap((kind) => {
    const cards = open.filter((c) => c.kind === kind)
    if (!cards.length) return []
    return [
      <motion.div
        key={`divider-${kind}`}
        layout="position"
        transition={spring.layout}
        exit={instant}
      >
        <Divider>{KIND[kind].divider}</Divider>
      </motion.div>,
      ...cards.map((card) => (
        <motion.div
          key={card.id}
          layout
          transition={spring.layout}
          exit={instant}
        >
          <CardSlot active={activeId === card.id} height={activeHeight}>
            <QuestionCard
              card={card}
              layoutId={`feed-${card.id}`}
              onOpen={(el) => onOpen(card, "feed", el)}
            />
          </CardSlot>
        </motion.div>
      )),
    ]
  })

  return (
    <Page>
      <AnimatePresence initial={false} mode="popLayout">
        {left ? (
          <motion.header
            key="intro"
            className="feed-intro"
            layout="position"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <Illustration name="lightbulb" />
            <Text as="h1" role="title">
              We have a few questions about eastern Chad
            </Text>
            <Text color="secondary">Answer the ones you know.</Text>
            <Text role="meta">
              {`${left} ${left === 1 ? "question" : "questions"} this week · about ${left < 3 ? "a minute" : "two minutes"}`}
            </Text>
          </motion.header>
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Text role="meta">Nothing left this week</Text>
          </motion.div>
        )}
      </AnimatePresence>

      <CardList>
        <AnimatePresence initial={false} mode="popLayout">
          {items}
          {left === 0 && (
            <motion.div
              key="caught-up"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.25 } }}
            >
              <Callout
                layout="center"
                icon={Inbox}
                title="No open questions"
                action={
                  <Button size="sm" iconEnd={ArrowRight} onClick={onGoNews}>
                    Read the latest update
                  </Button>
                }
              >
                New questions are sent each Monday.
              </Callout>
            </motion.div>
          )}
        </AnimatePresence>
      </CardList>
    </Page>
  )
}
