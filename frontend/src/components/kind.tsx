// Product vocabulary in one place: how each card kind and each identity is named.

import { BadgeCheck, EyeOff, type LucideIcon } from "lucide-react"
import type { CardKind, Identity } from "../data/types"

/** Feed order, divider labels and the pill on each card. */
export const KIND: Record<CardKind, { divider: string; pill: string }> = {
  risk: { divider: "Risk", pill: "Risk" },
  trigger: { divider: "Triggers", pill: "Trigger" },
  open: { divider: "Open question", pill: "Open question" },
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
