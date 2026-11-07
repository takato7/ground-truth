import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { useStore } from "../data/store"
import type { Identity } from "../data/types"
import { Eye, EyeOff } from "lucide-react"
import { Button, OptionCard, Text, pressSmall } from "../ui"
import { IDENTITY, IDENTITY_ORDER } from "./kind"
import "./IdentitySwitch.css"

/**
 * Title-bar control for how the expert appears: an eye, crossed out when anonymous. Tapping it
 * opens a choice card and the change only applies on confirm, so a stray tap never flips identity.
 */
export function IdentitySwitch() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<Identity>(state.identity)
  const current = IDENTITY[state.identity]

  const show = () => {
    setChoice(state.identity)
    setOpen(true)
  }
  const confirm = () => {
    dispatch({ type: "identity", identity: choice })
    setOpen(false)
  }

  return (
    <>
      <motion.button
        type="button"
        className="bar-btn"
        whileTap={pressSmall}
        aria-label={`How you appear: ${current.label}`}
        aria-haspopup="dialog"
        onClick={show}
      >
        {state.identity === "anonymous" ? (
          <EyeOff size={22} aria-hidden />
        ) : (
          <Eye size={22} aria-hidden />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="identity-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="card"
              role="dialog"
              aria-label="How you appear"
              className="identity-card surface tone-neutral elevated"
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
            >
              <Text role="heading">How you appear</Text>
              <Text role="meta">Right now: {current.label}</Text>
              {IDENTITY_ORDER.map((id) => (
                <OptionCard
                  key={id}
                  icon={IDENTITY[id].icon}
                  title={IDENTITY[id].label}
                  body={IDENTITY[id].body}
                  selected={choice === id}
                  onSelect={() => setChoice(id)}
                />
              ))}
              <Button disabled={choice === state.identity} onClick={confirm}>
                {choice === state.identity
                  ? "No change"
                  : `Switch to ${IDENTITY[choice].label}`}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
