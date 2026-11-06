import type { ReactNode } from 'react'
import { STANCE_LABEL, type Stance, type TriggerAggregate } from './api/types'

export function Logo() {
  return <div className="logo">acaps</div>
}

export function NextButton({ onClick, disabled, label = 'Next' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button className="next" onClick={onClick} disabled={disabled} aria-label={label}>
      →
    </button>
  )
}

/** ACAPS progress: how far reality is toward the trigger's 100% condition. Not a probability. */
export function ProgressMeter({ rate }: { rate: number | null }) {
  return (
    <div className="meter">
      <div className="meter-label">
        <span>ACAPS progress</span>
        <strong>{rate === null ? 'not rated' : `${rate}%`}</strong>
      </div>
      <div className="meter-track">
        {rate !== null && <div className="meter-fill" style={{ width: `${rate}%` }} />}
      </div>
    </div>
  )
}

const ORDER: Stance[] = ['agree', 'more_severe', 'less_severe', 'missing']

export function StanceBars({ agg, mine }: { agg: TriggerAggregate; mine?: Stance }) {
  if (agg.count === 0) return <p className="muted">No responses yet</p>
  return (
    <div className="bars">
      {ORDER.map((s) => (
        <div key={s} className={`bar-row ${mine === s ? 'mine' : ''}`}>
          <span className="bar-name">{STANCE_LABEL[s]}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(agg.stances[s] / agg.count) * 100}%` }} />
          </div>
          <span className="bar-n">{agg.stances[s]}</span>
        </div>
      ))}
      <p className="muted small">
        {agg.probability
          ? `Chance of reaching 100% in 6 months: median ${agg.probability.median}% (range ${agg.probability.min}–${agg.probability.max}%, ${agg.probability.n} estimates)`
          : 'No estimates'}
        {agg.split && <span className="badge">split</span>}
      </p>
    </div>
  )
}

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`screen ${className}`}>{children}</main>
}
