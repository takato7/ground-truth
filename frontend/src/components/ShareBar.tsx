import {
  Check,
  Copy,
  FileDown,
  Mail,
  Share2,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { copyText, emailLink, fullText, printReport } from "../data/share"
import type { Article, Report } from "../data/types"
import { Button, Text } from "../ui"
import "./ShareBar.css"

const COPIED_MS = 1600

/** Shows a check for a moment after a copy lands. */
function useCopied() {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(t)
  }, [copied])
  const copy = (text: string) => {
    void copyText(text).then(setCopied)
  }
  return { copied, copy }
}

/** Ways to pass a Radar post on: the system share sheet, copy, email, or save as PDF. */
export function ShareBar({
  article,
  report,
}: {
  article: Article
  report: Report
}) {
  const { copied, copy } = useCopied()
  const text = fullText(article, report)
  const canShare = typeof navigator.share === "function"

  const actions: { label: string; icon: LucideIcon; onClick: () => void }[] = [
    ...(canShare
      ? [
          {
            label: "Share",
            icon: Share2,
            onClick: () => {
              navigator
                .share({ title: article.headline, text })
                .catch(() => undefined)
            },
          },
        ]
      : []),
    {
      label: copied ? "Copied" : "Copy",
      icon: copied ? Check : Copy,
      onClick: () => copy(text),
    },
    {
      label: "Email",
      icon: Mail,
      onClick: () => {
        window.location.href = emailLink(article, report)
      },
    },
    {
      label: "PDF",
      icon: FileDown,
      onClick: () => printReport(article, report),
    },
  ]

  return (
    <div className="share-bar" role="group" aria-label="Share this post">
      {actions.map((a) => (
        <Button
          key={a.label}
          variant="secondary"
          size="sm"
          icon={a.icon}
          onClick={a.onClick}
        >
          {a.label}
        </Button>
      ))}
    </div>
  )
}

/** A section heading with a small copy action for just that section. */
export function CopyHeader({ title, text }: { title: string; text: string }) {
  const { copied, copy } = useCopied()
  return (
    <div className="copy-header">
      <Text as="h2" role="heading">
        {title}
      </Text>
      <button
        type="button"
        className="copy-header-btn"
        onClick={() => copy(text)}
        aria-label={copied ? "Copied" : `Copy ${title}`}
      >
        {copied ? (
          <Check size={16} aria-hidden />
        ) : (
          <Copy size={16} aria-hidden />
        )}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  )
}
