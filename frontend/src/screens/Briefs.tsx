import { useEffect } from 'react'
import type { Brief } from '../api/types'
import { Screen } from '../components'

const fmt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const fmtLong = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** One meta line for every kind of brief. */
const meta = (b: Brief) => (b.kind === 'panel' ? `Panel brief · ${b.panelSize} experts · ${fmt(b.date)}` : `ACAPS update · ${fmt(b.date)}`)
const source = (b: Brief) => (b.kind === 'panel' ? `ACAPS expert panel, ${b.panelSize} experts, ${fmtLong(b.date)}` : `ACAPS, ${fmtLong(b.date)}`)

/** Plain text for sharing. Pooled numbers only; nothing that identifies an expert. */
function shareText(b: Brief) {
  return `${b.headline}\n\n${b.body.join('\n\n')}\n\n${source(b)}`
}

async function share(b: Brief) {
  // Phone share sheet if there is one; otherwise a draft in the user's own mail app.
  // Either way the app itself sends nothing.
  const text = shareText(b)
  if (navigator.share) {
    try { await navigator.share({ title: b.headline, text }); return } catch { /* cancelled */ }
  }
  window.location.href = `mailto:?subject=${encodeURIComponent(b.headline)}&body=${encodeURIComponent(text)}`
}

/** Every brief looks the same in the feed: meta, headline, a short summary, and the same three actions. */
export function BriefCard({ brief, onOpen, onDownload }: { brief: Brief; onOpen: () => void; onDownload: () => void }) {
  return (
    <article className="card brief">
      <button className="brief-tap" onClick={onOpen}>
        <span className="meta">{meta(brief)}</span>
        <span className="brief-head">{brief.headline}</span>
        <span className="brief-sum">{brief.body[0]}</span>
      </button>
      <div className="pills">
        <button className="pill-btn" onClick={onOpen}>Read</button>
        <button className="pill-btn" onClick={onDownload}>Download PDF</button>
        <button className="pill-btn" onClick={() => share(brief)}>Share</button>
      </div>
    </article>
  )
}

/** Full brief. Two text sizes only; prints cleanly via Save as PDF. */
export function BriefScreen({ brief, onBack, autoPrint }: { brief: Brief; onBack: () => void; autoPrint?: boolean }) {
  // "Download PDF" from a card opens the brief and goes straight to the print dialog.
  useEffect(() => { if (autoPrint) { const t = setTimeout(() => window.print(), 300); return () => clearTimeout(t) } }, [autoPrint])
  return (
    <Screen className="brief-screen">
      <header className="topbar no-print">
        <button className="back" onClick={onBack}>‹ Back</button>
      </header>
      <article className="doc">
        <p className="meta">{meta(brief)}</p>
        <h1 className="doc-head">{brief.headline}</h1>
        {brief.body.map((p, i) => <p key={i}>{p}</p>)}
        {brief.kind === 'panel' && (
          <p className="meta">Pooled, anonymous answers from ACAPS’s expert panel. Individual responses are never published.{brief.demo && ' Demo data.'}</p>
        )}
      </article>
      <div className="doc-actions no-print">
        <button className="pill-btn" onClick={() => window.print()}>Save as PDF</button>
        <button className="pill-btn" onClick={() => share(brief)}>Share</button>
      </div>
    </Screen>
  )
}
