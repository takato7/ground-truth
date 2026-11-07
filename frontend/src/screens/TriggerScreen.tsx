import { useEffect, useRef, useState } from "react"
import { api, ApiError } from "../api/mockApi"
import type { RiskPost, Stance, User } from "../api/types"
import { ANSWER, LIKELIHOOD, TRIGGER_COPY, askLine } from "../copy"
import { Screen } from "../components"

const MAIN: Stance[] = ["agree", "more_severe", "less_severe"]
const STEPS = 3 // 1 stance · 2 likelihood · 3 note

/** One choice per page. Tapping an answer moves on; the note page submits. */
export function TriggerScreen({
  user,
  post,
  index,
  onNext,
  onSkip,
}: {
  user: User
  post: RiskPost
  index: number
  onNext: () => void
  onSkip: () => void
}) {
  const trigger = post.triggers[index]
  const copy = TRIGGER_COPY[trigger.id] ?? {
    short: trigger.title,
    goal: "the 100% condition",
    reach: "Will it get all the way there in the next 6 months?",
  }
  const [sub, setSub] = useState(0)
  const [dir, setDir] = useState<"fwd" | "back">("fwd")
  const [stance, setStance] = useState<Stance | null>(null)
  const [prob, setProb] = useState<number | null | undefined>(undefined)
  const [note, setNote] = useState("")
  const [showWording, setShowWording] = useState(false)
  const [error, setError] = useState("")
  const timer = useRef<number>(0)

  // State resets per trigger because App keys this screen by trigger index.
  useEffect(() => () => clearTimeout(timer.current), [])

  // Brief pause so the selection registers before the page slides away.
  const advance = () => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setDir("fwd")
      setSub((s) => s + 1)
    }, 220)
  }
  const back = () => {
    clearTimeout(timer.current)
    setDir("back")
    setSub((s) => s - 1)
  }

  const submit = async () => {
    if (!stance) return
    try {
      await api.submitResponse(user.id, {
        triggerId: trigger.id,
        stance,
        probability: prob ?? null,
        reason: note.trim(),
      })
      onNext()
    } catch (e) {
      if (e instanceof ApiError && e.message.startsWith("Already")) onNext()
      else setError(e instanceof ApiError ? e.message : "Could not save that")
    }
  }

  return (
    <Screen className="survey">
      <header className="topbar">
        {sub > 0 ? (
          <button className="back" onClick={back}>
            ‹ Back
          </button>
        ) : (
          <span />
        )}
        <button className="link" onClick={onSkip}>
          Later
        </button>
      </header>
      <div
        className="tabs"
        aria-label={`Topic ${index + 1} of ${post.triggers.length}`}
      >
        {post.triggers.map((t, i) => (
          <span
            key={t.id}
            className={i < index ? "done" : i === index ? "on" : ""}
          />
        ))}
      </div>

      <div key={`${trigger.id}-${sub}`} className={`page slide-${dir}`}>
        <p className="step">
          {copy.short} · {sub + 1}/{STEPS}
        </p>

        {sub === 0 && (
          <>
            <h1 className="q-ask">
              {askLine(copy.short, trigger.completionRate, copy.goal)}
            </h1>
            <div className="choices">
              {MAIN.map((s) => (
                <button
                  key={s}
                  className={`choice ${stance === s ? "selected" : ""}`}
                  onClick={() => {
                    setStance(s)
                    advance()
                  }}
                >
                  {ANSWER[s]}
                </button>
              ))}
              <button
                className={`link center-link ${stance === "missing" ? "on" : ""}`}
                onClick={() => {
                  setStance("missing")
                  advance()
                }}
              >
                {ANSWER.missing}
              </button>
            </div>
            <button
              className="link wording"
              onClick={() => setShowWording((v) => !v)}
            >
              {showWording ? "Hide" : "ACAPS’s wording"}
            </button>
            {showWording && (
              <div className="small muted">
                <p>
                  <strong>{trigger.title}</strong>
                </p>
                <p>100% means: {trigger.quantitativeObjective}</p>
              </div>
            )}
          </>
        )}

        {sub === 1 && (
          <>
            <h1 className="q-ask">{copy.reach}</h1>
            <div className="choices">
              {LIKELIHOOD.map((l) => (
                <button
                  key={l.label}
                  className={`choice ${prob === l.value ? "selected" : ""} ${l.value === null ? "quiet" : ""}`}
                  onClick={() => {
                    setProb(l.value)
                    advance()
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </>
        )}

        {sub === 2 && (
          <>
            <h1 className="q-ask">
              {stance === "missing"
                ? "What are we missing?"
                : "Anything you’d add?"}
            </h1>
            <textarea
              className="field"
              rows={4}
              maxLength={280}
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional. Seen by your panel under your chosen name."
            />
            {error && <p className="error">{error}</p>}
            <button className="primary" onClick={() => void submit()}>
              {note.trim() ? "Send" : "Skip and send"}
            </button>
          </>
        )}
      </div>
    </Screen>
  )
}
