import { CircleCheck } from "lucide-react"
import { motion } from "motion/react"
import { STANCE_SHORT, likelihoodLabel } from "../data/cards"
import type { Answer, Card } from "../data/types"
import { CardMeta, SourceLine, postDate } from "./CardHeader"
import { KIND } from "./kind"
import {
  Meter,
  Text,
  cx,
  layoutRadius,
  press,
  spring,
  surfaceClass,
} from "../ui"
import "./QuestionCard.css"

/** The expert's answer in a few words. */
export function answerSummary(card: Card, a: Answer) {
  if (card.kind === "risk") return likelihoodLabel(a.likelihood)
  if (card.kind === "trigger" && a.stance) return STANCE_SHORT[a.stance]
  return a.note ? `“${a.note}”` : "Sent"
}

/**
 * A question as it sits in a list: kind and post date, the question, then ACAPS's ID and
 * original title (so it's clear the question comes from their analysis) and, for triggers,
 * ACAPS's completion rate.
 * Answered cards add the answer; one that informed ACAPS is tinted brand with a check.
 * An unanswered open question is tinted brand too, and shows its prompt instead of the source.
 * Shares `layoutId` with the CardSheet it opens into.
 */
export function QuestionCard({
  card,
  answer,
  layoutId,
  onOpen,
}: {
  card: Card
  answer?: Answer
  layoutId: string
  onOpen: (el: HTMLElement) => void
}) {
  const impact = !!answer && !!card.impact
  // The open question closes the feed: tinted so "nothing above fits?" still has somewhere to go.
  const invite = card.kind === "open" && !answer
  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      transition={spring.layout}
      className={cx(
        surfaceClass({
          pad: "none",
          tone: impact || invite ? "brand" : "neutral",
        }),
        "qcard",
      )}
      style={layoutRadius}
      whileTap={press}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      <motion.div layout="position" className="qcard-body">
        <CardMeta
          pill={KIND[card.kind].pill}
          hue={KIND[card.kind].hue}
          date={postDate(card.round)}
        />
        <div className="qcard-head">
          <Text role="heading">{card.question}</Text>
          {impact && (
            <CircleCheck
              className="qcard-check tone-brand"
              size={22}
              aria-label="Made an impact"
            />
          )}
        </div>
        {invite ? (
          <Text role="meta">{card.context}</Text>
        ) : (
          <SourceLine id={card.sourceId} text={card.sourceTitle} />
        )}

        {answer ? (
          <>
            <Text role="meta">
              You said{" "}
              <span className="fg-primary">{answerSummary(card, answer)}</span>
            </Text>
            {impact && (
              <Text role="meta" color="tone" className="tone-brand">
                {card.impact}
              </Text>
            )}
          </>
        ) : (
          card.rate !== undefined && (
            <Meter value={card.rate} label={`${card.rate}% completed`} />
          )
        )}
      </motion.div>
    </motion.button>
  )
}
