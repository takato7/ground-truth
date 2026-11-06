import { useEffect, useState } from 'react'
import { api } from '../api/mockApi'
import type { Brief, RiskPost, Stance, Trigger, TriggerResponses, User } from '../api/types'
import { ANSWER_SHORT, RISK_COPY, TRIGGER_COPY } from '../copy'
import { Badge, Button, Card, Link, Logo, Meter, Notes, Row, Screen, Stack, StackBar, Text, ThemeToggle, Title, Toggle, TopBar, type Tone } from '../ui'
import { AskCard, BriefCard } from './Briefs'

const ORDER: Stance[] = ['more_severe', 'agree', 'less_severe', 'missing']
const STANCE_TONE: Record<Stance, Tone> = { more_severe: 'rose', agree: 'mint', less_severe: 'sky', missing: 'butter' }
type Unlocked = Extract<TriggerResponses, { locked: false }>
const today = () => new Date().toISOString().slice(0, 10)
const short = (t: Trigger) => TRIGGER_COPY[t.id]?.short ?? t.title

export function HomeScreen({ user, post, justFinished, onStartSurvey, onOpenBrief, onPostChanged }: {
  user: User; post: RiskPost; justFinished?: boolean; onStartSurvey: () => void; onOpenBrief: (b: Brief, print?: boolean) => void; onPostChanged: () => void
}) {
  const [byTrigger, setByTrigger] = useState<Record<string, TriggerResponses>>({})
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [publishing, setPublishing] = useState(false)
  const isAcaps = user.role === 'acaps'
  const place = RISK_COPY[post.id]?.short ?? post.country

  const load = () => {
    Promise.all(post.triggers.map((t) => api.getResponses(user.id, t.id))).then((rs) =>
      setByTrigger(Object.fromEntries(post.triggers.map((t, i) => [t.id, rs[i]]))),
    )
    api.listBriefs(user.id).then(setBriefs)
  }
  useEffect(load, [user.id, post])

  const loaded = Object.keys(byTrigger).length === post.triggers.length
  const todo = post.triggers.filter((t) => byTrigger[t.id]?.locked).length

  const publish = async () => {
    setPublishing(true)
    const b = await api.publishBrief(user.id)
    setPublishing(false)
    load()
    onOpenBrief(b)
  }

  return (
    <Screen>
      <TopBar
        left={<Text variant="meta">{isAcaps ? 'ACAPS analyst' : user.displayName}</Text>}
        center={<Logo />}
        right={<ThemeToggle />}
      />

      {loaded && !isAcaps && todo < post.triggers.length && (
        <YourStand post={post} byTrigger={byTrigger} justFinished={justFinished} />
      )}

      {isAcaps && loaded && (
        <Stack gap={3}>
          <Title size="md" as="h2">Panel this round</Title>
          {post.triggers.map((t) => (
            <PanelRow key={t.id} user={user} trigger={t} data={byTrigger[t.id] as Unlocked} onRated={() => { onPostChanged(); load() }} />
          ))}
          <Button variant="primary" size="lg" block onClick={publish} disabled={publishing}>Close round and publish brief</Button>
          <Text variant="meta" center>Pooled numbers only. Topics with fewer than 3 answers are left out.</Text>
        </Stack>
      )}

      <Stack gap={3}>
        {loaded && !isAcaps && todo > 0 && <AskCard place={place} todo={todo} onStart={onStartSurvey} />}
        {briefs.map((b) => <BriefCard key={b.id} brief={b} onOpen={() => onOpenBrief(b)} onDownload={() => onOpenBrief(b, true)} />)}
        {!isAcaps && loaded && todo === 0 && !briefs.some((b) => b.kind === 'panel' && b.date >= today()) && (
          <Text variant="meta" center>This round’s brief comes out when ACAPS closes the round.</Text>
        )}
      </Stack>
    </Screen>
  )
}

/** The personal bit: what you said, and how many peers said the same. */
function YourStand({ post, byTrigger, justFinished }: { post: RiskPost; byTrigger: Record<string, TriggerResponses>; justFinished?: boolean }) {
  const [open, setOpen] = useState(false)
  const rows = post.triggers.flatMap((t) => {
    const d = byTrigger[t.id]
    if (!d || d.locked) return []
    const mine = d.responses.find((r) => r.isMine)
    if (!mine) return []
    const peers = d.responses.filter((r) => !r.isMine)
    return [{ t, d, mine, peers, same: peers.filter((r) => r.stance === mine.stance).length }]
  })
  if (!rows.length) return null
  const said = (r: (typeof rows)[number]) => {
    const s = short(r.t).toLowerCase()
    return r.mine.stance === 'agree' ? `You said ACAPS has ${s} about right.`
      : r.mine.stance === 'missing' ? `You said something else is going on with ${s}.`
      : `You said ${s} ${r.mine.stance === 'more_severe' ? 'are further along' : 'aren’t as far along'}.`
  }
  const peersLine = (r: (typeof rows)[number]) => `${r.same} of your ${r.peers.length} peers said the same.`

  return (
    <Stack gap={3}>
      <Card tone="lilac" center>
        {justFinished && <Text variant="meta">Thanks, your answers are in</Text>}
        <Title size="lg">{said(rows[0])}</Title>
        <Text>{peersLine(rows[0])}</Text>
        <Link center onClick={() => setOpen((v) => !v)}>{open ? 'Hide' : rows.length > 1 ? `See all ${rows.length}` : 'See your peers’ notes'}</Link>
      </Card>
      {open && rows.map((r) => (
        <Card key={r.t.id}>
          <Stack gap={2}>
            <Title size="md" as="h3">{short(r.t)}</Title>
            <Text>{said(r)} {peersLine(r)}{r.d.aggregate.split && ' Your panel was divided on this one.'}</Text>
          </Stack>
          <Notes items={r.peers.filter((p) => p.reason).map((p) => ({ id: p.id, who: p.displayName, tag: ANSWER_SHORT[p.stance], text: p.reason }))} />
        </Card>
      ))}
    </Stack>
  )
}

/** ACAPS-only: the analyst's numbers and the rating control. */
function PanelRow({ user, trigger, data, onRated }: { user: User; trigger: Trigger; data: Unlocked; onRated: () => void }) {
  const [open, setOpen] = useState(false)
  const current = trigger.completionRate ?? 0
  const [rate, setRate] = useState(current)
  const [informed, setInformed] = useState(true)
  useEffect(() => setRate(trigger.completionRate ?? 0), [trigger.completionRate])
  const save = async () => { await api.updateRating(user.id, trigger.id, rate, informed); onRated() }
  const agg = data.aggregate

  return (
    <Card>
      <Title size="md" as="h3">{short(trigger)}{agg.split && <Badge>split</Badge>}</Title>
      <Meter label="ACAPS progress" value={trigger.completionRate} />
      <Row wrap>
        <Button size="sm" onClick={() => setRate((r) => Math.max(0, r - 5))} aria-label="Lower rating">−</Button>
        <strong className="rate-val">{rate}%</strong>
        <Button size="sm" onClick={() => setRate((r) => Math.min(100, r + 5))} aria-label="Raise rating">+</Button>
        <Row><Toggle on={informed} onChange={setInformed} label="Informed by panel" /><Text variant="meta">Informed by panel</Text></Row>
      </Row>
      {rate !== current && <Button variant="primary" onClick={save}>Update rating to {rate}%</Button>}

      {data.count === 0 ? <Text variant="meta">No answers yet</Text> : (
        <>
          <StackBar parts={ORDER.map((s) => ({ label: ANSWER_SHORT[s], value: agg.stances[s], tone: STANCE_TONE[s] }))} />
          <Text variant="meta">
            {agg.probability
              ? `Chance of reaching 100% in 6 months: median ${agg.probability.median}% (${agg.probability.min}–${agg.probability.max}%, n=${agg.probability.n})`
              : 'No estimates'}
          </Text>
          <Link onClick={() => setOpen((v) => !v)}>{open ? 'Hide answers' : `All ${data.count} answers`}</Link>
          {open && (
            <Notes items={data.responses.map((r) => ({
              id: r.id, who: r.displayName, tag: `${ANSWER_SHORT[r.stance]}${r.probability !== null ? ` · ${r.probability}%` : ''}`, text: r.reason || undefined,
            }))} />
          )}
        </>
      )}
    </Card>
  )
}
