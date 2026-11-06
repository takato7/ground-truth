import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/mockApi'
import type { RiskPost, Stance, User } from '../api/types'
import { ANSWER, LIKELIHOOD, TRIGGER_COPY } from '../copy'
import { Screen } from '../components'

const MAIN: Stance[] = ['agree', 'more_severe', 'less_severe']

/** One question per trigger. Tap an answer, optionally add a likelihood and a note, next. */
export function TriggerScreen({ user, post, index, onNext, onSkip }: {
  user: User; post: RiskPost; index: number; onNext: () => void; onSkip: () => void
}) {
  const trigger = post.triggers[index]
  const copy = TRIGGER_COPY[trigger.id]
  const rate = trigger.completionRate === null ? 'an unknown share' : `${trigger.completionRate}%`
  const [stance, setStance] = useState<Stance | null>(null)
  const [prob, setProb] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setStance(null); setProb(null); setNote(''); setNoteOpen(false); setError('') }, [trigger.id])

  const pick = (s: Stance) => { setStance(s); if (s === 'missing') setNoteOpen(true) }

  const submit = async () => {
    if (!stance) return
    try {
      await api.submitResponse(user.id, { triggerId: trigger.id, stance, probability: prob, reason: note.trim() })
      onNext()
    } catch (e) {
      // Already answered (e.g. coming back after a reload): just move on.
      if (e instanceof ApiError && e.message.startsWith('Already')) onNext()
      else setError(e instanceof ApiError ? e.message : 'Could not save that')
    }
  }

  return (
    <Screen className="survey">
      <header className="topbar">
        <div className="dots" aria-label={`Question ${index + 1} of ${post.triggers.length}`}>
          {post.triggers.map((t, i) => <span key={t.id} className={i <= index ? 'on' : ''} />)}
        </div>
        <button className="link" onClick={onSkip}>Later</button>
      </header>

      <div className="q">
        <p className="eyebrow">{copy?.short ?? trigger.title}</p>
        <p className="q-context">{copy ? copy.question(rate) : trigger.description}</p>
        <h1 className="q-ask">Does that match what you’re seeing?</h1>
      </div>

      <div className="choices">
        {MAIN.map((s) => (
          <button key={s} className={`choice ${stance === s ? 'selected' : ''}`} onClick={() => pick(s)}>{ANSWER[s]}</button>
        ))}
        <button className={`link center-link ${stance === 'missing' ? 'on' : ''}`} onClick={() => pick('missing')}>{ANSWER.missing}</button>
      </div>

      {stance && (
        <div className="followup">
          <p className="small muted">Will it get all the way there in the next 6 months?</p>
          <div className="chips">
            {LIKELIHOOD.map((l) => (
              <button key={l.value} className={`chip ${prob === l.value ? 'selected' : ''}`} onClick={() => setProb(prob === l.value ? null : l.value)}>{l.label}</button>
            ))}
          </div>

          {noteOpen ? (
            <textarea
              className="field"
              rows={3}
              maxLength={280}
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={stance === 'missing' ? 'What are we missing?' : 'What are you seeing? (optional)'}
            />
          ) : (
            <button className="link" onClick={() => setNoteOpen(true)}>Add a note</button>
          )}

          {error && <p className="error">{error}</p>}
          <button className="primary" onClick={submit}>{index + 1 < post.triggers.length ? 'Next' : 'Done'}</button>
        </div>
      )}
    </Screen>
  )
}
