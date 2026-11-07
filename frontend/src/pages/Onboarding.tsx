import { ArrowRight, BadgeCheck, EyeOff } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { useStore } from "../data/store"
import type { Identity } from "../data/types"

const OPTIONS: {
  id: Identity
  icon: typeof BadgeCheck
  title: string
  body: string
}[] = [
  {
    id: "known",
    icon: BadgeCheck,
    title: "Known to ACAPS",
    body: "ACAPS and the panel see your name. You can add notes others can read.",
  },
  {
    id: "anonymous",
    icon: EyeOff,
    title: "Anonymous",
    body: "Nobody sees your name. Your answers count, but your notes go to ACAPS only.",
  },
]

function Logo() {
  return <img className="logo" src="/acaps-wordmark.svg" alt="ACAPS" />
}

/** Invite code, then one choice about identity. Changeable later on the You page. */
export function Onboarding() {
  const { state, dispatch } = useStore()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [identity, setIdentity] = useState<Identity>("known")

  const redeem = () => {
    if (/^chad-/i.test(code.trim())) dispatch({ type: "invite" })
    else setError("That code isn’t valid. Check the invite you were sent.")
  }

  return (
    <main className="onboarding">
      <Logo />
      <AnimatePresence mode="wait" initial={false}>
        {state.onboarding === "invite" ? (
          <motion.div
            key="invite"
            className="onb-step"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <h1>Enter your invite code</h1>
            <p className="muted">
              You’ve been invited to the {`eastern Chad`} expert panel.
            </p>
            <input
              className="field"
              value={code}
              autoFocus
              placeholder="e.g. CHAD-E1"
              aria-label="Invite code"
              onChange={(e) => {
                setCode(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && redeem()}
            />
            {error && <p className="error">{error}</p>}
            <button
              className="primary"
              disabled={!code.trim()}
              onClick={redeem}
            >
              Continue <ArrowRight size={18} aria-hidden />
            </button>
            <p className="muted small">Demo code: CHAD-E1</p>
          </motion.div>
        ) : (
          <motion.div
            key="identity"
            className="onb-step"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <h1>How should you appear?</h1>
            <p className="muted">You can change this any time.</p>
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                className={`option ${identity === o.id ? "selected" : ""}`}
                onClick={() => setIdentity(o.id)}
                aria-pressed={identity === o.id}
              >
                <o.icon size={22} aria-hidden />
                <span>
                  <strong>{o.title}</strong>
                  <span>{o.body}</span>
                </span>
              </button>
            ))}
            <button
              className="primary"
              onClick={() =>
                dispatch({ type: "identity", identity, finish: true })
              }
            >
              Start <ArrowRight size={18} aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
