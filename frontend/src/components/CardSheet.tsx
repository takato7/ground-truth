import { ChevronLeft, X } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "motion/react"
import { useEffect, useRef, useState } from "react"
import { LIKELIHOOD, STANCE } from "../data/cards"
import type { Answer, Card, Identity, Stance } from "../data/types"
import { CARD_RADIUS, SPRING, answerSummary } from "./FeedCard"
import { PanelResults } from "./PanelResults"
import { KindChip, Meter } from "./ui"

type Step = "likelihood" | "stance" | "note" | "result"

const STEPS: Record<Card["kind"], Step[]> = {
  risk: ["likelihood", "note", "result"],
  trigger: ["stance", "note", "result"],
  open: ["note", "result"],
}

const slide = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
}

/** Exit once answered from the feed: the card has left the list, so fly toward the You tab. */
export const sheetExit = {
  away: {
    opacity: 0,
    scale: 0.4,
    x: 120,
    y: 260,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
} as const

function Choices<T>({
  options,
  selected,
  onPick,
}: {
  options: { label: string; value: T; quiet?: boolean }[]
  selected: T | undefined
  onPick: (v: T) => void
}) {
  return (
    <div className="choices">
      {options.map((o) => (
        <motion.button
          key={o.label}
          whileTap={{ scale: 0.97 }}
          className={`choice ${selected === o.value ? "selected" : ""} ${o.quiet ? "quiet" : ""}`}
          onClick={() => onPick(o.value)}
        >
          {o.label}
        </motion.button>
      ))}
    </div>
  )
}

/**
 * A card opened full-height: one or two questions, then the panel's answers as the reward.
 * Opened from an answered card it goes straight to the results.
 */
export function CardSheet({
  card,
  layoutId,
  answer,
  identity,
  returning,
  onAnswer,
  onClose,
}: {
  card: Card
  layoutId: string
  answer?: Answer
  identity: Identity
  /** The card is still in its list, so closing shrinks back into it. */
  returning: boolean
  onAnswer: (a: Omit<Answer, "at">) => void
  onClose: () => void
}) {
  const steps = STEPS[card.kind]
  const [step, setStep] = useState(answer ? steps.length - 1 : 0)
  const [dir, setDir] = useState(1)
  const [likelihood, setLikelihood] = useState<number | null | undefined>()
  const [stance, setStance] = useState<Stance | undefined>()
  const [note, setNote] = useState("")
  const [wording, setWording] = useState(false)
  const timer = useRef(0)
  const drag = useDragControls()
  const current = steps[step]
  const asking = steps.slice(0, -1)

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const go = (d: number) => {
    setDir(d)
    setStep((s) => s + d)
  }
  // Brief pause so the selection registers before the next question slides in.
  const pickThenNext = () => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => go(1), 200)
  }
  const submit = () => {
    onAnswer({ cardId: card.id, likelihood, stance, note: note.trim() })
    go(1)
  }
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose()
  }

  const mine: Answer = answer ?? {
    cardId: card.id,
    at: "",
    likelihood,
    stance,
    note: note.trim(),
  }
  const noteRequired = card.kind === "open"
  const noteTitle =
    card.kind === "open"
      ? card.question
      : stance === "something_else"
        ? "What’s going on that ACAPS should know?"
        : "Anything you’d add?"

  return (
    <>
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.section
        role="dialog"
        aria-label={card.question}
        layoutId={layoutId}
        transition={SPRING}
        className={`sheet kind-${card.kind}`}
        style={{ borderRadius: CARD_RADIUS }}
        drag="y"
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={onDragEnd}
        // Returning: no exit of its own, so the card that re-mounts with this layoutId animates out of it.
        exit={returning ? undefined : sheetExit.away}
      >
        <motion.div
          className="sheet-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
        >
          <div className="sheet-grab" onPointerDown={(e) => drag.start(e)}>
            <span className="grabber" />
            <div className="sheet-top">
              {step > 0 && current !== "result" ? (
                <button
                  className="icon-btn"
                  onClick={() => go(-1)}
                  aria-label="Back"
                >
                  <ChevronLeft size={22} />
                </button>
              ) : (
                <KindChip kind={card.kind} />
              )}
              {current !== "result" && asking.length > 1 && (
                <div
                  className="dots"
                  aria-label={`Question ${step + 1} of ${asking.length}`}
                >
                  {asking.map((s, i) => (
                    <span key={s} className={i <= step ? "on" : ""} />
                  ))}
                </div>
              )}
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="sheet-scroll">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={current}
                className="step"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 500, damping: 42 }}
              >
                {current === "likelihood" && (
                  <>
                    <p className="step-topic">{card.topic}</p>
                    <h2 className="step-q">{card.question}</h2>
                    <p className="step-ctx">{card.context}</p>
                    <Choices
                      options={LIKELIHOOD.map((l) => ({
                        ...l,
                        quiet: l.value === null,
                      }))}
                      selected={likelihood}
                      onPick={(v) => {
                        setLikelihood(v)
                        pickThenNext()
                      }}
                    />
                  </>
                )}

                {current === "stance" && (
                  <>
                    <p className="step-topic">{card.topic}</p>
                    <h2 className="step-q">{card.ask}</h2>
                    <p className="step-ctx">{card.context}</p>
                    {card.rate !== undefined && <Meter rate={card.rate} />}
                    <Choices
                      options={(Object.keys(STANCE) as Stance[]).map((s) => ({
                        label: STANCE[s],
                        value: s,
                        quiet: s === "something_else",
                      }))}
                      selected={stance}
                      onPick={(v) => {
                        setStance(v)
                        pickThenNext()
                      }}
                    />
                    <button
                      className="link"
                      onClick={() => setWording((w) => !w)}
                    >
                      {wording ? "Hide ACAPS’s wording" : "ACAPS’s wording"}
                    </button>
                    {wording && (
                      <div className="wording">
                        <p>
                          <strong>{card.acapsTitle}</strong>
                        </p>
                        <p>{card.acapsGoal}</p>
                      </div>
                    )}
                  </>
                )}

                {current === "note" && (
                  <>
                    <p className="step-topic">
                      {card.kind === "open"
                        ? card.topic
                        : `${card.topic} · You said: ${answerSummary(card, mine)}`}
                    </p>
                    <h2 className="step-q">{noteTitle}</h2>
                    {card.kind === "open" && (
                      <p className="step-ctx">{card.context}</p>
                    )}
                    <textarea
                      className="field"
                      rows={5}
                      maxLength={280}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        identity === "anonymous"
                          ? "Only ACAPS sees this. It’s never shown to other experts."
                          : `${noteRequired ? "" : "Optional. "}Other experts on the panel see this under your name.`
                      }
                    />
                    <button
                      className="primary"
                      disabled={noteRequired && !note.trim()}
                      onClick={submit}
                    >
                      {noteRequired || note.trim() ? "Send" : "Skip and send"}
                    </button>
                  </>
                )}

                {current === "result" && (
                  <>
                    <p className="step-topic">
                      {answer ? "Your answer" : "Thanks, that’s in"}
                    </p>
                    <h2 className="step-q">Here’s where the panel stands</h2>
                    <PanelResults card={card} mine={mine} identity={identity} />
                    {card.impact && answer ? (
                      <p className="impact-line">{card.impact}</p>
                    ) : (
                      <p className="muted small">
                        ACAPS reviews answers every Monday. If your answer
                        changes anything, this card turns green on your You
                        page.
                      </p>
                    )}
                    <button className="primary" onClick={onClose}>
                      Done
                    </button>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.section>
    </>
  )
}
