import { useEffect, useRef, useState } from 'react'
import { api, USERS } from './api/mockApi'
import type { Brief, RiskPost, User } from './api/types'
import { AnonymityScreen, InviteScreen } from './screens/Onboarding'
import { TriggerScreen } from './screens/TriggerScreen'
import { HomeScreen } from './screens/HomeScreen'
import { BriefScreen } from './screens/Briefs'
import { Drawer, Screen, Text } from './ui'
import { MenuContent } from './screens/Menu'

// invite → anonymity → survey (skippable, opens straight away if questions are waiting) → home.
// Home is always reachable; only peers' answers stay hidden until you've answered.
type Step = { name: 'invite' } | { name: 'anonymity' } | { name: 'survey'; index: number } | { name: 'home'; justFinished?: boolean } | { name: 'brief'; brief: Brief; print?: boolean }

/** Indexes of triggers this expert hasn't answered yet. */
async function pending(user: User, post: RiskPost): Promise<number[]> {
  if (user.role !== 'expert') return []
  const rs = await Promise.all(post.triggers.map((t) => api.getResponses(user.id, t.id)))
  return rs.flatMap((r, i) => (r.locked ? [i] : []))
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [post, setPost] = useState<RiskPost | null>(null)
  const [step, setStep] = useState<Step>({ name: 'invite' })
  const [refresh, setRefresh] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  // Every screen change starts at the top of the phone's scroll area.
  useEffect(() => { scroller.current?.scrollTo(0, 0) }, [step])

  useEffect(() => {
    if (user) api.getPost(user.id).then(setPost)
  }, [user])

  const enter = async (u: User) => {
    setUser(u)
    const p = post ?? (await api.getPost(u.id))
    setPost(p)
    const todo = await pending(u, p)
    setStep(todo.length ? { name: 'survey', index: todo[0] } : { name: 'home' })
  }

  const next = async () => {
    if (!user || !post) return
    const todo = await pending(user, post)
    setStep(todo.length ? { name: 'survey', index: todo[0] } : { name: 'home', justFinished: true })
  }

  const switchTo = (id: string) => {
    if (!id) { setUser(null); setStep({ name: 'invite' }); return }
    enter(api.me(id))
  }

  let screen
  if (!user || step.name === 'invite') {
    screen = <InviteScreen onDone={(u) => (u.role === 'acaps' ? enter(u) : (setUser(u), setStep({ name: 'anonymity' })))} />
  } else if (step.name === 'anonymity') {
    screen = <AnonymityScreen user={user} onDone={enter} />
  } else if (!post) {
    screen = <Screen center><Text center>Loading…</Text></Screen>
  } else if (step.name === 'survey') {
    screen = <TriggerScreen user={user} post={post} index={step.index} onNext={next} onSkip={() => setStep({ name: 'home' })} />
  } else if (step.name === 'brief') {
    screen = <BriefScreen brief={step.brief} autoPrint={step.print} onBack={() => setStep({ name: 'home' })} />
  } else {
    screen = <HomeScreen key={refresh} user={user} post={post} justFinished={step.justFinished} onStartSurvey={next} onPostChanged={() => api.getPost(user.id).then(setPost)} onMenu={() => setMenuOpen(true)} onOpenBrief={(brief, print) => setStep({ name: 'brief', brief, print })} />
  }

  return (
    <div className="shell">
      <div className="phone">
        <div className="phone-scroll" ref={scroller}>{screen}</div>
        {user && (
          <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
            <MenuContent user={user} onSignOut={() => { setMenuOpen(false); switchTo('') }} />
          </Drawer>
        )}
      </div>
      {/* Dev-only user switcher: replaces login for the demo. */}
      <div className="devbar">
        <select value={user?.id ?? ''} onChange={(e) => switchTo(e.target.value)}>
          <option value="">— sign out —</option>
          {USERS.map((u) => <option key={u.id} value={u.id}>{u.role === 'acaps' ? 'ACAPS analyst' : `${u.realName} (${u.id})`}</option>)}
        </select>
        <button onClick={() => { api.reset(); setRefresh((n) => n + 1); if (user) enter(user) }}>reset data</button>
      </div>
    </div>
  )
}
