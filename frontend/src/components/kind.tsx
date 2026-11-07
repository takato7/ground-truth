// Product vocabulary in one place: how each card kind and each identity is named.

import { BadgeCheck, EyeOff, type LucideIcon } from "lucide-react"
import type { CardKind, Identity } from "../data/types"
import type { Hue } from "../ui"

/**
 * The pill on each card, and its highlighter colour: coral and amber sit opposite the ACAPS
 * teal, so a risk, a trigger and an open question read as different things at a glance.
 */
export const KIND: Record<CardKind, { pill: string; hue: Hue }> = {
  risk: { pill: "Risk", hue: "coral" },
  trigger: { pill: "Trigger", hue: "amber" },
  open: { pill: "Open question", hue: "teal" },
}
export const KIND_ORDER: CardKind[] = ["risk", "trigger", "open"]

export const IDENTITY: Record<
  Identity,
  { label: string; icon: LucideIcon; body: string }
> = {
  known: {
    label: "Known to ACAPS",
    icon: BadgeCheck,
    body: "ACAPS and the panel see your name, the public never does. You can add notes the panel can read.",
  },
  anonymous: {
    label: "Anonymous",
    icon: EyeOff,
    body: "The panel and the public never see your name. Your answers count, but your notes go to ACAPS only.",
  },
}
export const IDENTITY_ORDER: Identity[] = ["known", "anonymous"]
