import { Lock, TrendingUp, Users } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { IdentityChip, Meter, PageHeader, SectionTitle } from "../components/ui"
import { RISK } from "../data/cards"
import { useStore } from "../data/store"

const SHORT: Record<string, string> = {
  T0618: "Cross-border attacks",
  T0619: "Attacks on airports and bases",
  T0620: "Armed groups across the border",
}

// Pulled from ACAPS's 30 Sep update text for R1043.
const STATS = [
  { value: "400+", label: "refugees crossing into Chad each day" },
  { value: "20×", label: "the rate of previous months" },
  { value: "55,000+", label: "arrivals since January" },
]

/** The latest Risk Radar post for the panel's region. Locked for experts who stopped answering. */
export function NewsPage({ onGoFeed }: { onGoFeed: () => void }) {
  const { state, newsLocked } = useStore()
  const [more, setMore] = useState(false)
  const [date, ...rest] = RISK.latestUpdate.split("\n")
  const body = rest.join(" ")

  return (
    <div className="page-inner">
      <PageHeader
        title="News"
        right={<IdentityChip identity={state.identity} />}
      />

      <div
        className={`news ${newsLocked ? "locked" : ""}`}
        aria-hidden={newsLocked}
      >
        <article className="news-hero">
          <p className="eyebrow-line">Risk Radar · {RISK.country}</p>
          <h2>Sudan’s war spilling over into eastern Chad</h2>
          <div className="news-tags">
            <span>
              <TrendingUp size={14} aria-hidden /> {RISK.trend}
            </span>
            <span>Risk: {RISK.riskLevel}</span>
            <span>
              <Users size={14} aria-hidden /> {RISK.exposure} exposed
            </span>
          </div>
        </article>

        <SectionTitle>This month in numbers</SectionTitle>
        <div className="stats">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <SectionTitle>Latest update · {date}</SectionTitle>
        <div className="news-body">
          <p className={more ? "" : "clamp"}>{body}</p>
          <button className="link" onClick={() => setMore((m) => !m)}>
            {more ? "Show less" : "Read the full update"}
          </button>
        </div>

        <SectionTitle>What ACAPS is watching</SectionTitle>
        <ul className="watch">
          {RISK.triggers.map((t) => (
            <li key={t.id}>
              <span>{SHORT[t.id] ?? t.title}</span>
              <Meter rate={t.completionRate ?? 0} />
            </li>
          ))}
        </ul>
        <p className="muted small">
          Percentages show how close each trigger is to its worst case, not how
          likely it is.
        </p>
      </div>

      {newsLocked && (
        <motion.div
          className="news-lock"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Lock size={26} aria-hidden />
          <h2>This week’s update is waiting</h2>
          <p>
            Answer any one question on your feed to unlock the latest from
            ACAPS.
          </p>
          <button className="primary" onClick={onGoFeed}>
            Go to Feed
          </button>
        </motion.div>
      )}
    </div>
  )
}
