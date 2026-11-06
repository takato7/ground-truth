import type { ReactNode } from 'react'

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

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`screen ${className}`}>{children}</main>
}
