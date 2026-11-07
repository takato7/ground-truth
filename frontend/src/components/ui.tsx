// Small shared pieces. Kept together for now; the design-system pass splits them out.

import {
  BadgeCheck,
  Crosshair,
  EyeOff,
  Gauge,
  MessageCircleQuestion,
} from "lucide-react"
import type { ReactNode } from "react"
import { KIND_LABEL } from "../data/cards"
import type { CardKind, Identity } from "../data/types"

export const KIND_ICON = {
  risk: Gauge,
  trigger: Crosshair,
  open: MessageCircleQuestion,
} satisfies Record<CardKind, unknown>

export function KindChip({ kind }: { kind: CardKind }) {
  const Icon = KIND_ICON[kind]
  return (
    <span className={`kind-chip kind-${kind}`}>
      <Icon size={14} strokeWidth={2.2} aria-hidden />
      {KIND_LABEL[kind]}
    </span>
  )
}

export function IdentityChip({ identity }: { identity: Identity }) {
  return identity === "known" ? (
    <span className="identity-chip">
      Known to ACAPS <BadgeCheck size={16} aria-hidden />
    </span>
  ) : (
    <span className="identity-chip">
      Anonymous <EyeOff size={16} aria-hidden />
    </span>
  )
}

export function PageHeader({
  title,
  right,
}: {
  title: string
  right?: ReactNode
}) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {right}
    </header>
  )
}

/** ACAPS's completion %: how far reality is toward the trigger's 100% condition. Not a probability. */
export function Meter({ rate, label }: { rate: number; label?: string }) {
  return (
    <div className="meter">
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${rate}%` }} />
      </div>
      <span className="meter-label">{label ?? `${rate}% of the way`}</span>
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="section-title">{children}</h2>
}
