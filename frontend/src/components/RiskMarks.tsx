import { Text, cx } from "../ui"
import "./RiskMarks.css"

/** ACAPS's risk-level legend: triangle high, circle medium, square low. */
export function RiskLevel({ level }: { level: string }) {
  return (
    <span className="risk-level">
      <span
        className={cx("risk-mark", `risk-${level.toLowerCase()}`)}
        aria-hidden
      />
      <Text as="span" role="label" color="primary">
        {level} risk
      </Text>
    </span>
  )
}

/** Five squares, filled up to ACAPS's impact score. */
export function ImpactScale({ value }: { value: number }) {
  return (
    <span
      className="impact-scale"
      role="img"
      aria-label={`Impact ${value} of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={cx(i < value && "on")} />
      ))}
    </span>
  )
}
