import { useEffect, useRef, useState } from 'react'
import { api, ApiError } from '../api/mockApi'
import type { RiskPost, Stance, User } from '../api/types'
import { ANSWER, LIKELIHOOD, TRIGGER_COPY, askLine } from '../copy'
import { Button, ErrorText, Link, Screen, Stack, Steps, Text, TextArea, Title, TopBar } from '../ui'

const MAIN: Stance[] = ['agree', 'more_severe', 'less_severe']
const STEPS = 3 // 1 stance · 2 likelihood · 3 note

/** One choice per page. Tapping an answer moves on; the note page submits. */
export function TriggerScreen({ user, post, index, onNext, onSkip }: {
  user: User; post: RiskPost; index: number; onNext: () => void; onSkip: () => void
}) {
  const trigger = post.triggers[index]
  const copy = TRIGGER_COPY[trigger.id] ?? { short: trigger.title, goal: 'the 100% condition', reach: 'Will it get all the way there in the next 6 months?' }
  const [sub, setSub] = useState(0)
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const [stance, setStance] = useState<Stance | null>(null)
  const [prob, setProb] = useState<number | null | undefined>(undefined)
  const [note, setNote] = useState('')
  const [showWording, setShowWording] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef<number>(0)

  useEffect(() => {
    setSub(0); setDir('fwd'); setStance(null); setProb(undefined); setNote(''); setShowWording(false); setError('')
  }, [trigger.id])
  useEffect(() => () => clearTimeout(timer.current), [])

  // Brief pause so the selection registers before the page slides away.
  const advance = () => { clearTimeout(timer.current); timer.current = window.setTimeout(() => { setDir('fwd'); setSub((s) => s + 1) }, 220) }
  const back = () => { clearTimeout(timer.current); setDir('back'); setSub((s) => s - 1) }

  const submit = async () => {
    if (!stance) return
    try {
      await api.submitResponse(user.id, { triggerId: trigger.id, stance, probability: prob ?? null, reason: note.trim() })
      onNext()
    } catch (e) {
      if (e instanceof ApiError && e.message.startsWith('Already')) onNext()
      else setError(e instanceof ApiError ? e.message : 'Could not save that')
    }
  }

  return (
    <Screen className="survey">
      <TopBar
        left={sub > 0 && <Button variant="ghost" onClick={back}>‹ Back</Button>}
        right={<Button variant="ghost" onClick={onSkip}>Later</Button>}
      />
      <Steps count={post.triggers.length} current={index} />

      <div key={`${trigger.id}-${sub}`} className={`survey-page ui-slide-${dir}`}>
        <Stack gap={5}>
          <Text variant="meta">{copy.short} · {sub + 1}/{STEPS}</Text>

          {sub === 0 && (
            <>
              <Title>{askLine(copy.short, trigger.completionRate, copy.goal)}</Title>
              <Stack gap={2}>
                {MAIN.map((s) => (
                  <Button key={s} variant="choice" selected={stance === s} onClick={() => { setStance(s); advance() }}>{ANSWER[s]}</Button>
                ))}
                <Button variant="ghost" selected={stance === 'missing'} onClick={() => { setStance('missing'); advance() }}>{ANSWER.missing}</Button>
              </Stack>
              <Stack gap={2}>
                <Link onClick={() => setShowWording((v) => !v)}>{showWording ? 'Hide ACAPS’s wording' : 'ACAPS’s wording'}</Link>
                {showWording && (
                  <>
                    <Text variant="lead">{trigger.title}</Text>
                    <Text>100% means: {trigger.quantitativeObjective}</Text>
                  </>
                )}
              </Stack>
            </>
          )}

          {sub === 1 && (
            <>
              <Title>{copy.reach}</Title>
              <Stack gap={2}>
                {LIKELIHOOD.map((l) => l.value === null
                  ? <Button key={l.label} variant="ghost" onClick={() => { setProb(null); advance() }}>{l.label}</Button>
                  : <Button key={l.label} variant="choice" selected={prob === l.value} onClick={() => { setProb(l.value); advance() }}>{l.label}</Button>,
                )}
              </Stack>
            </>
          )}

          {sub === 2 && (
            <>
              <Title>{stance === 'missing' ? 'What are we missing?' : 'Anything you’d add?'}</Title>
              <TextArea rows={4} max={280} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional. Seen by your panel under your chosen name." />
              {error && <ErrorText>{error}</ErrorText>}
              <Button variant="primary" size="lg" block onClick={submit}>{note.trim() ? 'Send' : 'Skip and send'}</Button>
            </>
          )}
        </Stack>
      </div>
    </Screen>
  )
}
