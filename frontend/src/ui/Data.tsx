// Small data displays: progress meter, stat tile, bar list, quote.

import type { ReactNode } from "react"
import { Chip } from "./Chip"
import { cx } from "./cx"
import { Surface } from "./Surface"
import { Text } from "./Text"
import "./Data.css"

const PERCENT = 100

/** A 0–100 progress bar with a trailing label. */
export function Meter({ value, label }: { value: number; label?: ReactNode }) {
  return (
    <div className="meter">
      <span className="meter-track">
        <span
          className="meter-fill"
          style={{ width: `${Math.min(PERCENT, value)}%` }}
        />
      </span>
      {label !== undefined && (
        <Text as="span" role="label">
          {label}
        </Text>
      )}
    </div>
  )
}

/** One big number with a caption. */
export function Stat({
  value,
  label,
  tone,
}: {
  value: ReactNode
  label: string
  tone?: "brand"
}) {
  return (
    <Surface pad="sm" className="stat">
      <Text
        as="strong"
        role="title"
        className={tone === "brand" ? "stat-brand" : undefined}
      >
        {value}
      </Text>
      <Text as="span" role="meta">
        {label}
      </Text>
    </Surface>
  )
}

export interface BarRow {
  label: string
  count: number
  /** The viewer's own answer: bold, with a "you" marker. */
  mine?: boolean
  /** Extra marker, such as where ACAPS sits. */
  tag?: string
}

/** Horizontal bars, scaled to the largest row. */
export function BarList({ rows, well }: { rows: BarRow[]; well?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <Surface as="ul" pad="sm" well={well} className="bar-list">
      {rows.map((r) => (
        <li key={r.label} className={cx("bar-row", r.mine && "mine")}>
          <span className={"bar-label type-body"}>
            {r.label}
            {r.mine && <Chip variant="solid">you</Chip>}
            {r.tag && <Chip variant="outline">{r.tag}</Chip>}
          </span>
          <span className="meter-track">
            <span
              className="meter-fill"
              style={{ width: `${(r.count / max) * PERCENT}%` }}
            />
          </span>
          <Text as="span" role="meta" className="bar-count">
            {r.count}
          </Text>
        </li>
      ))}
    </Surface>
  )
}

/** Something an expert wrote, with who wrote it. */
export function Quote({
  text,
  author,
  well,
}: {
  text: string
  author: string
  well?: boolean
}) {
  return (
    <Surface as="li" pad="sm" well={well}>
      <Text role="body">{text}</Text>
      <Text role="meta" className="quote-author">
        {author}
      </Text>
    </Surface>
  )
}
