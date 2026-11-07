import { Chip, Text, cx, type Hue } from "../ui"
import "./CardHeader.css"

/** "2 Nov": the day something was posted. */
export const postDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })

/** The top row of every card and sheet: what it is, and when. */
export function CardMeta({
  pill,
  hue,
  date,
}: {
  pill: string
  hue: Hue
  date: string
}) {
  return (
    <div className="card-meta">
      <Chip variant="highlight" hue={hue}>
        {pill}
      </Chip>
      <Text as="span" role="meta">
        {date}
      </Text>
    </div>
  )
}

/**
 * Where the card comes from: ACAPS's ID and original wording, quoted under a hairline so it
 * reads as source material. Sits under the card's title.
 */
export function SourceLine({
  id,
  text,
  full,
}: {
  id: string
  text: string
  /** Sheets show it whole; cards clamp it to two lines. */
  full?: boolean
}) {
  return (
    <Text role="meta" className={cx("card-source", !full && "clamp-2")}>
      <span className="card-source-id">{id}</span> {text}
    </Text>
  )
}
