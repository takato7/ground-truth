import type { Brief } from '../api/types'
import { Screen } from '../components'

const fmt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const label = (b: Brief) => (b.kind === 'panel' ? 'Panel brief' : 'ACAPS update')
const credit = (b: Brief) => (b.kind === 'panel' ? `ACAPS expert panel · ${b.panelSize} experts · ${fmt(b.date)}` : `ACAPS · ${fmt(b.date)}`)

/** Plain text for sharing. Pooled numbers only; nothing that identifies an expert. */
function shareText(b: Brief) {
  return `${b.headline}\n\n${b.body.join('\n')}\n\n${credit(b)}`
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

export function BriefCard({ brief, onOpen }: { brief: Brief; onOpen: () => void }) {
  return (
    <article className={`card brief brief-${brief.kind}`}>
      <p className="eyebrow">{label(brief)} · {fmt(brief.date)}</p>
      <h4 className="brief-head">{brief.headline}</h4>
      {brief.kind === 'panel' ? (
        <>
          <p className="small">{brief.body[0]}</p>
          <p className="muted small">{credit(brief)}</p>
          <div className="brief-actions">
            <button className="chip" onClick={onOpen}>Download PDF</button>
            <button className="chip" onClick={() => share(brief)}>Share</button>
          </div>
        </>
      ) : (
        <button className="link" onClick={onOpen}>Read ›</button>
      )}
    </article>
  )
}

/** Full brief, styled to print cleanly (Save as PDF). */
export function BriefScreen({ brief, onBack }: { brief: Brief; onBack: () => void }) {
  return (
    <Screen className="brief-screen">
      <header className="topbar no-print">
        <button className="back" onClick={onBack}>‹ Back</button>
      </header>
      <article className="doc">
        <p className="doc-brand">acaps</p>
        <p className="eyebrow">{label(brief)} · Eastern Chad</p>
        <h1 className="doc-head">{brief.headline}</h1>
        {brief.body.map((p, i) => <p key={i}>{p}</p>)}
        <p className="doc-credit">{credit(brief)}</p>
        {brief.kind === 'panel' && (
          <p className="doc-fine">Pooled, anonymous answers from ACAPS’s moderated expert panel. Individual responses are never published.{brief.demo ? ' Demo data.' : ''}</p>
        )}
      </article>
      <div className="brief-actions no-print">
        <button className="primary" onClick={() => window.print()}>Save as PDF</button>
        <button className="choice" onClick={() => share(brief)}>Share</button>
      </div>
    </Screen>
  )
}
