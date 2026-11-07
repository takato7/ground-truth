import { Award, BadgeCheck, EyeOff, UserRound } from "lucide-react"
import { motion } from "motion/react"
import { FeedCard } from "../components/FeedCard"
import { PageHeader, SectionTitle } from "../components/ui"
import { PANEL } from "../data/cards"
import { useStore } from "../data/store"
import { CardSlot, type OpenSheet } from "./FeedPage"

const roundLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })

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
  const { state, dispatch, answered, impacts } = useStore()
  const known = state.identity === "known"

  return (
    <div className="page-inner">
      <PageHeader title="You" />

      <div className="profile">
        <span className="avatar">
          {known ? "MO" : <UserRound size={22} aria-hidden />}
        </span>
        <div>
          <strong>{known ? "Mira Okonde" : "Anonymous expert"}</strong>
          <span>{PANEL} panel</span>
        </div>
        <button
          className="identity-toggle"
          onClick={() =>
            dispatch({
              type: "identity",
              identity: known ? "anonymous" : "known",
            })
          }
        >
          {known ? (
            <BadgeCheck size={16} aria-hidden />
          ) : (
            <EyeOff size={16} aria-hidden />
          )}
          {known ? "Known to ACAPS" : "Anonymous"}
        </button>
      </div>

      {/* Shown only when it's true. A weak record gets no card rather than a discouraging one. */}
      {state.goodStanding && (
        <motion.div
          className="standing"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Award size={24} aria-hidden />
          <div>
            <strong>Your estimates carry weight</strong>
            <p>
              Your recent calls on eastern Chad have been close to what
              happened. ACAPS gives them more weight.
            </p>
          </div>
        </motion.div>
      )}

      <div className="you-stats">
        <div>
          <strong>{answered.length}</strong>
          <span>answers</span>
        </div>
        {impacts > 0 && (
          <div className="good">
            <strong>{impacts}</strong>
            <span>changed ACAPS’s view</span>
          </div>
        )}
      </div>

      <SectionTitle>Your answers</SectionTitle>
      {answered.length === 0 ? (
        <p className="muted empty">
          Answers you give show up here, with what the panel said.
        </p>
      ) : (
        <div className="card-list">
          {answered.map(({ card, answer }) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="round-label">{roundLabel(answer.at)}</p>
              <CardSlot active={activeId === card.id} height={activeHeight}>
                <FeedCard
                  card={card}
                  answer={answer}
                  layoutId={`you-${card.id}`}
                  onOpen={(el) => onOpen(card, "you", el)}
                />
              </CardSlot>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
