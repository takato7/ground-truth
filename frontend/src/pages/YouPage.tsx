import { TrendingUp, UserRound } from "lucide-react"
import { motion } from "motion/react"
import { IDENTITY } from "../components/kind"
import { QuestionCard } from "../components/QuestionCard"
import { PANEL } from "../data/cards"
import { useStore } from "../data/store"
import {
  Avatar,
  Callout,
  CardList,
  Divider,
  Page,
  SectionHeader,
  Stat,
  Text,
  fadeIn,
} from "../ui"
import { CardSlot, type OpenSheet } from "./FeedPage"
import "./YouPage.css"

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" })

/** The expert's own history: every answer, green where it moved ACAPS. */
export function YouPage({
  activeId,
  activeHeight,
  onOpen,
}: {
  activeId?: string
  activeHeight?: number
  onOpen: OpenSheet
}) {
  const { state, answered, impacts } = useStore()
  const known = state.identity === "known"

  // Answers arrive newest first; a divider starts each new day.
  const items = answered.flatMap(({ card, answer }, i) => {
    const day = dayLabel(answer.at)
    const newDay = i === 0 || dayLabel(answered[i - 1].answer.at) !== day
    return [
      ...(newDay ? [<Divider key={`day-${day}`}>{day}</Divider>] : []),
      <motion.div key={card.id} layout {...fadeIn}>
        <CardSlot active={activeId === card.id} height={activeHeight}>
          <QuestionCard
            card={card}
            answer={answer}
            layoutId={`you-${card.id}`}
            onOpen={(el) => onOpen(card, "you", el)}
          />
        </CardSlot>
      </motion.div>,
    ]
  })

  return (
    <Page>
      {/* Profile header: no card, just the avatar with name and panel centred below it. */}
      <header className="you-profile">
        <Avatar size="lg">
          {known ? "MO" : <UserRound size={36} aria-hidden />}
        </Avatar>
        <div className="stack gap-1">
          <Text as="h1" role="title">
            {known ? "Mira Okonde" : "Anonymous expert"}
          </Text>
          <Text role="meta">
            {PANEL} panel · {IDENTITY[state.identity].label}
          </Text>
        </div>
      </header>

      {/* Shown only when it's true. A weak record gets no card rather than a discouraging one. */}
      {state.goodStanding && (
        <motion.div {...fadeIn}>
          <Callout tone="brand" icon={TrendingUp} title="Every round answered">
            You’ve answered every round since joining. Your accuracy record
            starts once your first forecasts resolve, six months after you made
            them.
          </Callout>
        </motion.div>
      )}

      <div className="row gap-2 you-stats">
        <Stat value={answered.length} label="answers" />
        {impacts > 0 && (
          <Stat value={impacts} label="informed ACAPS" tone="brand" />
        )}
      </div>

      <SectionHeader>History</SectionHeader>
      {answered.length === 0 ? (
        <Text color="secondary" className="you-empty">
          Your answers and the panel’s responses appear here.
        </Text>
      ) : (
        <CardList>{items}</CardList>
      )}
    </Page>
  )
}
