// Spot illustrations (src/assets/illustrations). The source SVGs are drawn in four flat colours;
// each one is swapped for an --illo-* token so the drawings follow the theme and stay quiet.

import data from "../assets/illustrations/data.svg?raw"
import lightbulb from "../assets/illustrations/lightbulb.svg?raw"
import mailFeed from "../assets/illustrations/mail-feed.svg?raw"
import searchingFile from "../assets/illustrations/searching-file.svg?raw"
import twoHands from "../assets/illustrations/two-hands-hurrah.svg?raw"
import { cx } from "./cx"
import "./Illustration.css"

const SOURCES = {
  data,
  lightbulb,
  "mail-feed": mailFeed,
  "searching-file": searchingFile,
  "two-hands": twoHands,
}

export type IllustrationName = keyof typeof SOURCES

/** Source colour → token. Anything else in a file is left as drawn. */
const COLOURS: Record<string, string> = {
  "#010306": "var(--illo-ink)",
  "#0196ba": "var(--illo-accent)",
  "#bee9e6": "var(--illo-tint)",
  "#f6fbfc": "var(--illo-paper)",
}

const themed = Object.fromEntries(
  Object.entries(SOURCES).map(([name, svg]) => [
    name,
    svg
      .replace(/fill="(#[0-9a-f]{6})"/gi, (m, hex: string) => {
        const token = COLOURS[hex.toLowerCase()]
        return token ? `fill="${token}"` : m
      })
      // Size comes from CSS; the viewBox keeps the proportions.
      .replace(/<svg([^>]*?)\swidth="[^"]*"\sheight="[^"]*"/, "<svg$1"),
  ]),
) as Record<IllustrationName, string>

/** Decorative: always hidden from assistive tech, the copy beside it carries the meaning. */
export function Illustration({
  name,
  size = "hero",
  className,
}: {
  name: IllustrationName
  /** hero: top of an onboarding step. spot: beside a line of copy. */
  size?: "hero" | "spot"
  className?: string
}) {
  return (
    <span
      className={cx("illo", `illo-${size}`, className)}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: themed[name] }}
    />
  )
}
