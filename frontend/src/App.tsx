import { useEffect, useState } from 'react'
import { api, USERS } from './api/mockApi'
import type { RiskPost, User } from './api/types'
import { AnonymityScreen, InviteScreen } from './screens/Onboarding'
import { TriggerScreen } from './screens/TriggerScreen'
import { HomeScreen } from './screens/HomeScreen'

type Step = { name: 'invite' } | { name: 'anonymity' } | { name: 'trigger'; index: number } | { name: 'home' }

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [post, setPost] = useState<RiskPost | null>(null)
  const [step, setStep] = useState<Step>({ name: 'invite' })

  useEffect(() => {
    if (user) api.getPost(user.id).then(setPost)
  }, [user])

  const switchTo = (id: string) => {
    if (!id) { setUser(null); setStep({ name: 'invite' }); return }
    const u = api.me(id)
    setUser(u)
    setStep(u.role === 'acaps' ? { name: 'home' } : { name: 'trigger', index: 0 })
  }

  let screen
  if (!user || step.name === 'invite') {
    screen = <InviteScreen onDone={(u) => { setUser(u); setStep(u.role === 'acaps' ? { name: 'home' } : { name: 'anonymity' }) }} />
  } else if (step.name === 'anonymity') {
    screen = <AnonymityScreen user={user} onDone={(u) => { setUser(u); setStep({ name: 'trigger', index: 0 }) }} />
  } else if (!post) {
    screen = <main className="screen center"><p className="muted">Loading…</p></main>
  } else if (step.name === 'trigger') {
    screen = (
      <TriggerScreen
        user={user}
        post={post}
        index={step.index}
        onNext={() => setStep(step.index + 1 < post.triggers.length ? { name: 'trigger', index: step.index + 1 } : { name: 'home' })}
      />
    )
  } else {
    screen = <HomeScreen user={user} post={post} onAnswer={(i) => setStep({ name: 'trigger', index: i })} />
  }

  return (
    <div className="shell">
      <div className="phone">{screen}</div>
      {/* Dev-only user switcher: replaces login for the demo. */}
      <div className="devbar">
        <select value={user?.id ?? ''} onChange={(e) => switchTo(e.target.value)}>
          <option value="">— sign out —</option>
          {USERS.map((u) => <option key={u.id} value={u.id}>{u.role === 'acaps' ? 'ACAPS analyst' : `${u.realName} (${u.id})`}</option>)}
        </select>
        <button onClick={() => { api.reset(); switchTo(user?.id ?? '') }}>reset data</button>
      </div>
    </div>
  )
}
