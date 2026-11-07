import { CircleCheck, Clock, Users } from "lucide-react"
import { motion } from "motion/react"
import { STANCE_SHORT, likelihoodLabel } from "../data/cards"
import type { Answer, Card } from "../data/types"
import { KindChip, Meter } from "./ui"

export const CARD_RADIUS = 24
export const SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
} as const

const EST: Record<Card["kind"], string> = {
  risk: "15 sec",
  trigger: "20 sec",
  open: "1 min",
}

export function answerSummary(card: Card, a: Answer) {
  if (card.kind === "risk") return likelihoodLabel(a.likelihood)
  if (card.kind === "trigger" && a.stance) return STANCE_SHORT[a.stance]
  return a.note ? `“${a.note}”` : "Sent"
}

/**
 * A question as it sits in a list. Shares `layoutId` with the sheet it opens into,
 * so tapping it grows the card into the full question and closing shrinks it back.
 */
export function FeedCard({
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
  const impact = answer && card.impact
  return (
    <motion.button
      layoutId={layoutId}
      transition={SPRING}
      className={`fcard kind-${card.kind} ${answer ? "answered" : ""} ${impact ? "impact" : ""}`}
      style={{ borderRadius: CARD_RADIUS }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      <motion.div layout="position" className="fcard-inner">
        <div className="fcard-top">
          <KindChip kind={card.kind} />
          <span className="fcard-topic">{card.topic}</span>
          {impact && (
            <CircleCheck
              className="fcard-check"
              size={22}
              aria-label="Made an impact"
            />
          )}
        </div>
        <p className="fcard-q">{card.question}</p>
        {answer ? (
          <>
            <p className="fcard-said">
              <span>You said</span> {answerSummary(card, answer)}
            </p>
            {impact && <p className="fcard-impact">{card.impact}</p>}
          </>
        ) : (
          <>
            <p className="fcard-ctx">{card.context}</p>
            {card.rate !== undefined && (
              <Meter
                rate={card.rate}
                label={`ACAPS: ${card.rate}% of the way`}
              />
            )}
            <div className="fcard-foot">
              <span>
                <Clock size={14} aria-hidden /> {EST[card.kind]}
              </span>
              <span>
                <Users size={14} aria-hidden /> {card.peers.length} experts
                answered
              </span>
            </div>
          </>
        )}
      </motion.div>
    </motion.button>
  )
}
