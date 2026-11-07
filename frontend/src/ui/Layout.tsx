// Page scaffolding: page body, headers, avatar, logo.

import type { ReactNode } from "react"
import { Text } from "./Text"
import "./Layout.css"

/** One full-height page inside the phone: gutters, top inset, room for the tab bar. */
export function Page({ children }: { children: ReactNode }) {
  return <div className="page-body">{children}</div>
}

/** Heading above a group of content (News, You). */
export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <Text as="h2" role="heading" className="section-header">
      {children}
    </Text>
  )
}

/** Small label that splits a list into groups ("Risk", "Triggers", a date). */
export function Divider({ children }: { children: ReactNode }) {
  return (
    <Text as="h3" role="label" className="divider">
      {children}
    </Text>
  )
}

/** Vertical list with the standard gap between cards. */
export function CardList({ children }: { children: ReactNode }) {
  return <div className="card-list">{children}</div>
}

export function Avatar({
  size = "md",
  children,
}: {
  /** lg: the profile header on the You page. */
  size?: "md" | "lg"
  children: ReactNode
}) {
  return (
    <span
      className={
        size === "lg" ? "avatar avatar-lg type-title" : "avatar type-heading"
      }
    >
      {children}
    </span>
  )
}

/** ACAPS wordmark; the ink swaps for dark mode. */
export function Logo() {
  return (
    <span className="logo">
      <img className="logo-light" src="/acaps-wordmark.svg" alt="ACAPS" />
      <img
        className="logo-dark"
        src="/acaps-wordmark-dark.svg"
        alt=""
        aria-hidden
      />
    </span>
  )
}
