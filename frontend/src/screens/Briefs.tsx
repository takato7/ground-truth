import { useEffect } from 'react'
import type { Brief } from '../api/types'
import { Button, Dot, FeedCard, Row, Screen, Stack, Text, Title, TopBar, type Tone } from '../ui'

const fmt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const fmtLong = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** Each kind of thing in the feed has one tint. */
export const KIND_TONE: Record<Brief['kind'] | 'ask', Tone> = { ask: 'rose', panel: 'mint', rating: 'butter', update: 'plain' }

const meta = (b: Brief) =>
  b.kind === 'panel' ? `Panel brief · ${b.panelSize} experts · ${fmt(b.date)}`
  : b.kind === 'rating' ? `Rating change · ${fmt(b.date)}`
  : `ACAPS update · ${fmt(b.date)}`
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

export function BriefCard({ brief, onOpen, onDownload }: { brief: Brief; onOpen: () => void; onDownload: () => void }) {
  return (
    <FeedCard
      tone={KIND_TONE[brief.kind]}
      meta={meta(brief)}
      title={brief.headline}
      summary={brief.body[0]}
      onOpen={onOpen}
      actions={<>
        <Button size="sm" onClick={onOpen}>Read</Button>
        <Button size="sm" onClick={onDownload}>Download PDF</Button>
        <Button size="sm" onClick={() => share(brief)}>Share</Button>
      </>}
    />
  )
}

/** The survey invite: same card shape, centred like a call to action. */
export function AskCard({ place, todo, onStart }: { place: string; todo: number; onStart: () => void }) {
  return (
    <FeedCard
      tone={KIND_TONE.ask}
      center
      meta={`${todo} quick ${todo === 1 ? 'question' : 'questions'} · about ${todo} min`}
      title={`ACAPS would like your read on ${place}`}
      summary="Answer on your own first, then see where your panel landed."
      onOpen={onStart}
      actions={<Button variant="primary" size="lg" onClick={onStart}>Start</Button>}
    />
  )
}

/** Full brief. Prints cleanly via Save as PDF. */
export function BriefScreen({ brief, onBack, autoPrint }: { brief: Brief; onBack: () => void; autoPrint?: boolean }) {
  // "Download PDF" from a card opens the brief and goes straight to the print dialog.
  useEffect(() => { if (autoPrint) { const t = setTimeout(() => window.print(), 300); return () => clearTimeout(t) } }, [autoPrint])
  return (
    <Screen>
      <div className="no-print"><TopBar left={<Button variant="ghost" onClick={onBack}>‹ Back</Button>} /></div>
      <article className="doc">
        <Stack gap={4}>
          <Text variant="meta"><Dot tone={KIND_TONE[brief.kind] === 'plain' ? 'lilac' : KIND_TONE[brief.kind]} />{meta(brief)}</Text>
          <Title size="xl">{brief.headline}</Title>
          {brief.body.map((p, i) => <Text key={i} variant="lead">{p}</Text>)}
          {brief.kind === 'panel' && (
            <Text variant="meta">Pooled, anonymous answers from ACAPS’s expert panel. Individual responses are never published.{brief.demo && ' Demo data.'}</Text>
          )}
        </Stack>
      </article>
      <Row className="no-print">
        <Button onClick={() => window.print()}>Save as PDF</Button>
        <Button onClick={() => share(brief)}>Share</Button>
      </Row>
    </Screen>
  )
}
