import { ArrowLeft, ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState, type ReactNode } from "react"
import { IDENTITY, IDENTITY_ORDER } from "../components/kind"
import { GroundlineLogo } from "../components/Brand"
import { useStore } from "../data/store"
import type { Identity, OnboardingStep } from "../data/types"
import {
  Button,
  IconButton,
  Illustration,
  Logo,
  OptionCard,
  Text,
  TextField,
  cx,
  type IllustrationName,
} from "../ui"
import "./Onboarding.css"

const step = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

const STEPS = ["welcome", "invite", "identity"] as const

/** What answering gets you back. The welcome screen's whole argument. */
const PROMISES: { illo: IllustrationName; title: string; body: string }[] = [
  {
    illo: "lightbulb",
    title: "Tell us what you see",
    body: "A few short questions about your area. Skip any you can’t speak to.",
  },
  {
    illo: "searching-file",
    title: "See what ACAPS sees",
    body: "Answering keeps you on the latest analysis for your region.",
  },
  {
    illo: "two-hands",
    title: "Watch it make a difference",
    body: "See where your answers sharpen the picture, week by week.",
  },
]

/** Welcome, invite code, then one choice about identity. Identity can change later on the You page. */
export function Onboarding() {
  const { state, dispatch } = useStore()
  const [code, setCode] = useState("")
  const [identity, setIdentity] = useState<Identity>("known")
  const current = state.onboarding as Exclude<OnboardingStep, "done">
  const index = STEPS.indexOf(current)
  const go = (to: OnboardingStep) => dispatch({ type: "onboarding", step: to })

  // Demo: any code gets in, so a reviewer can type whatever they like.
  const redeem = () => {
    if (code.trim()) dispatch({ type: "invite" })
  }

  return (
    <main className="onboarding">
      <header className="onboarding-top">
        <span className="onboarding-back">
          {index > 0 && (
            <IconButton
              icon={ArrowLeft}
              label="Back"
              onClick={() => go(STEPS[index - 1])}
            />
          )}
        </span>
        <ol className="onboarding-dots" aria-label={`Step ${index + 1} of 3`}>
          {STEPS.map((s, i) => (
            <li key={s} className={cx(i === index && "current")} />
          ))}
        </ol>
        <span className="onboarding-back" />
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {current === "welcome" && (
          <Step
            key="welcome"
            top={
              <div className="onboarding-acaps">
                <Logo />
              </div>
            }
            head={<GroundlineLogo />}
            title="Your view sharpens the picture"
            body="ACAPS analysts see the big picture from afar. You see what’s happening on the ground. Share it, and the analysis you rely on gets better for you too."
            actions={
              <Button iconEnd={ArrowRight} onClick={() => go("invite")}>
                Get started
              </Button>
            }
          >
            <ul className="onboarding-promises">
              {PROMISES.map((p) => (
                <li key={p.title}>
                  <Illustration name={p.illo} size="spot" />
                  <span className="stack gap-1">
                    <Text role="heading">{p.title}</Text>
                    <Text role="meta">{p.body}</Text>
                  </span>
                </li>
              ))}
            </ul>
          </Step>
        )}

        {current === "invite" && (
          <Step
            key="invite"
            head={<Illustration name="mail-feed" />}
            title="Enter your invite code"
            body="You’ve been invited to the eastern Chad expert panel."
            actions={
              <>
                <Button
                  iconEnd={ArrowRight}
                  disabled={!code.trim()}
                  onClick={redeem}
                >
                  Continue
                </Button>
                <Text role="meta">Demo: any code works</Text>
              </>
            }
          >
            <div className="stack gap-2">
              <TextField
                label="Invite code"
                value={code}
                autoFocus
                placeholder="e.g. CHAD-R1043"
                onChange={setCode}
                onEnter={redeem}
              />
            </div>
          </Step>
        )}

        {current === "identity" && (
          <Step
            key="identity"
            title="Choose how you appear"
            body="You can change this any time from the You page."
            actions={
              <Button
                iconEnd={ArrowRight}
                onClick={() =>
                  dispatch({ type: "identity", identity, finish: true })
                }
              >
                Start
              </Button>
            }
          >
            <div className="stack gap-3">
              {IDENTITY_ORDER.map((id) => (
                <OptionCard
                  key={id}
                  icon={IDENTITY[id].icon}
                  title={IDENTITY[id].label}
                  body={IDENTITY[id].body}
                  selected={identity === id}
                  onSelect={() => setIdentity(id)}
                />
              ))}
            </div>
          </Step>
        )}
      </AnimatePresence>
    </main>
  )
}

/** One screen: centred head, title and lead, the step's content, then actions pinned to the bottom. */
function Step({
  top,
  head,
  title,
  body,
  actions,
  children,
}: {
  /** Pinned above the centred content (the small ACAPS mark on the welcome step). */
  top?: ReactNode
  head?: ReactNode
  title: string
  body: string
  actions: ReactNode
  children: ReactNode
}) {
  return (
    <motion.div className="onboarding-step" {...step}>
      {top}
      <div className="onboarding-content">
        <div className="onboarding-intro">
          {head && <div className="onboarding-head">{head}</div>}
          <Text as="h1" role="title">
            {title}
          </Text>
          <Text color="secondary">{body}</Text>
        </div>
        {children}
      </div>
      <div className="onboarding-actions">{actions}</div>
    </motion.div>
  )
}
