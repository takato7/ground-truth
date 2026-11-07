import { ChevronLeft, X } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { LIKELIHOOD, STANCE } from "../data/cards"
import type { Answer, Card, Identity, Stance } from "../data/types"
import {
  Button,
  ChoiceList,
  DISMISS,
  IconButton,
  Meter,
  SELECT_DELAY_MS,
  Text,
  TextField,
  cx,
  layoutRadius,
  spring,
  surfaceClass,
} from "../ui"
import { PanelResults } from "./PanelResults"
import { answerSummary } from "./QuestionCard"
import "./CardSheet.css"

type Step = "likelihood" | "stance" | "note" | "result"

/** One or two questions per card, then the panel's answers. */
const STEPS: Record<Card["kind"], Step[]> = {
  risk: ["likelihood", "note", "result"],
  trigger: ["stance", "note", "result"],
  open: ["note", "result"],
}

const SLIDE = 48
const slide = {
  enter: (dir: number) => ({ x: dir * SLIDE, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -SLIDE, opacity: 0 }),
}

/** Exit once answered from the feed: the card has left the list, so fly toward the You tab. */
const flyToYou = {
  opacity: 0,
  scale: 0.4,
  x: 120,
  y: 260,
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
} as const

/** Shared top of every step: an optional recap line, the question, optional context. */
function Ask({
  recap,
  question,
  context,
}: {
  recap?: string
  question: string
  context?: string
}) {
  return (
    <>
      {recap && <Text role="meta">{recap}</Text>}
      <Text as="h2" role="title">
        {question}
      </Text>
      {context && <Text color="secondary">{context}</Text>}
    </>
  )
}

function AcapsWording({ card }: { card: Card }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="link" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide ACAPS’s wording" : "ACAPS’s wording"}
      </Button>
      {open && (
        <div className="stack gap-1">
          <Text role="meta" color="primary">
            {card.acapsTitle}
          </Text>
          <Text role="meta">{card.acapsGoal}</Text>
        </div>
      )}
    </>
  )
}

/** Header row: grabber (drag handle), back, progress dots, close. */
export function SheetTop({
  step,
  questions,
  onBack,
  onClose,
  onDragStart,
}: {
  step: number
  questions: number
  onBack?: () => void
  onClose: () => void
  onDragStart: (e: React.PointerEvent) => void
}) {
  return (
    <div className="sheet-grab" onPointerDown={onDragStart}>
      <span className="grabber" />
      <div className="sheet-top">
        {onBack ? (
          <IconButton icon={ChevronLeft} label="Back" onClick={onBack} />
        ) : (
          <span className="sheet-top-spacer" />
        )}
        {questions > 1 && (
          <div
            className="dots"
            aria-label={`Question ${step + 1} of ${questions}`}
          >
            {Array.from({ length: questions }, (_, i) => (
              <span key={i} className={cx(i <= step && "on")} />
            ))}
          </div>
        )}
        <IconButton icon={X} label="Close" onClick={onClose} />
      </div>
    </div>
  )
}

/**
 * A card opened full-height. Grows out of its QuestionCard via the shared layoutId;
 * drag down, Escape or X closes it. Opened from an answered card it shows the results.
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
  const questions = steps.length - 1
  const [step, setStep] = useState(answer ? questions : 0)
  const [dir, setDir] = useState(1)
  const [likelihood, setLikelihood] = useState<number | null | undefined>()
  const [stance, setStance] = useState<Stance | undefined>()
  const [note, setNote] = useState("")
  const timer = useRef(0)
  const drag = useDragControls()
  const current = steps[step]

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
  const pickThenNext = () => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => go(1), SELECT_DELAY_MS)
  }
  const submit = () => {
    onAnswer({ cardId: card.id, likelihood, stance, note: note.trim() })
    go(1)
  }
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS.distance || info.velocity.y > DISMISS.velocity)
      onClose()
  }

  const mine: Answer = answer ?? {
    cardId: card.id,
    at: "",
    likelihood,
    stance,
    note: note.trim(),
  }

  let body: ReactNode
  if (current === "likelihood") {
    body = (
      <>
        <Ask question={card.question} context={card.context} />
        <ChoiceList
          options={LIKELIHOOD.map((l) => ({ ...l, quiet: l.value === null }))}
          selected={likelihood}
          onPick={(v) => {
            setLikelihood(v)
            pickThenNext()
          }}
        />
      </>
    )
  } else if (current === "stance") {
    body = (
      <>
        <Ask question={card.ask ?? card.question} context={card.context} />
        {card.rate !== undefined && (
          <Meter value={card.rate} label={`${card.rate}% of the way`} />
        )}
        <ChoiceList
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
        <AcapsWording card={card} />
      </>
    )
  } else if (current === "note") {
    const open = card.kind === "open"
    body = (
      <>
        <Ask
          recap={open ? undefined : `You said: ${answerSummary(card, mine)}`}
          question={
            open
              ? card.question
              : stance === "something_else"
                ? "What should ACAPS know?"
                : "Add context (optional)"
          }
          context={open ? card.context : undefined}
        />
        <TextField
          multiline
          label="Your note"
          maxLength={280}
          value={note}
          onChange={setNote}
          placeholder={
            identity === "anonymous"
              ? "Visible to ACAPS only. Never shown to the panel."
              : "Visible to the panel under your name."
          }
        />
        <Button disabled={open && !note.trim()} onClick={submit}>
          {open || note.trim() ? "Send" : "Send without a note"}
        </Button>
      </>
    )
  } else {
    body = (
      <>
        <Ask
          recap={answer ? undefined : "Answer recorded"}
          question="Panel responses"
        />
        <PanelResults card={card} mine={mine} identity={identity} />
        {card.impact && answer ? (
          <Text className="sheet-impact tone-brand">{card.impact}</Text>
        ) : (
          <Text role="meta">
            ACAPS reviews responses weekly. Answers that inform its analysis are
            marked on your profile.
          </Text>
        )}
        <Button onClick={onClose}>Done</Button>
      </>
    )
  }

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
        transition={spring.layout}
        className={cx(surfaceClass({ pad: "none" }), "sheet")}
        style={layoutRadius}
        drag="y"
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={onDragEnd}
        // Returning: no exit of its own, so the card that re-mounts with this layoutId animates out of it.
        exit={returning ? undefined : flyToYou}
      >
        <motion.div
          className="sheet-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
        >
          <SheetTop
            step={step}
            questions={questions}
            onBack={step > 0 && current !== "result" ? () => go(-1) : undefined}
            onClose={onClose}
            onDragStart={(e) => drag.start(e)}
          />
          <div className="sheet-scroll">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={current}
                className="sheet-step"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={spring.step}
              >
                {body}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.section>
    </>
  )
}
