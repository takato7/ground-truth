import { useState } from 'react'
import { api, ApiError } from '../api/mockApi'
import type { AnonymityLevel, User } from '../api/types'
import { Button, ErrorText, Input, Logo, Option, Screen, Stack, Text, Title } from '../ui'

export function InviteScreen({ onDone }: { onDone: (u: User) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const submit = async () => {
    try {
      onDone(await api.redeemInvite(code))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong')
    }
  }
  return (
    <Screen center>
      <Stack gap={5}>
        <div className="ui-center"><Logo size="lg" /></div>
        <Title center>Enter your invite code</Title>
        <Stack gap={3}>
          <Input
            value={code}
            onChange={(e) => { setCode(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && code.trim() && submit()}
            placeholder="e.g. CHAD-E1"
            autoFocus
          />
          {error && <ErrorText>{error}</ErrorText>}
          <Button variant="primary" size="lg" block onClick={submit} disabled={!code.trim()}>Continue</Button>
          <Text variant="meta" center>Demo codes: CHAD-E1 … CHAD-E6, ACAPS</Text>
        </Stack>
      </Stack>
    </Screen>
  )
}

const LEVELS: { level: AnonymityLevel; title: string; body: (u: User) => string }[] = [
  { level: 'known_to_acaps', title: 'Known to ACAPS', body: (u) => `ACAPS sees your name. Peers see “${u.displayName}”.` },
  { level: 'pseudonymous', title: 'Pseudonym', body: (u) => `Everyone, including ACAPS, sees “${u.displayName}”.` },
  { level: 'per_post', title: 'Anonymous', body: () => 'A new alias for every risk. Nobody can link your answers together.' },
]

export function AnonymityScreen({ user, onDone }: { user: User; onDone: (u: User) => void }) {
  const [level, setLevel] = useState<AnonymityLevel>(user.anonymity ?? 'pseudonymous')
  return (
    <Screen center>
      <Stack gap={5}>
        <Stack gap={2}>
          <Title center>How visible do you want to be?</Title>
          <Text center>You can make this more private at any time. Answers are never public.</Text>
        </Stack>
        <Stack gap={2}>
          {LEVELS.map((l) => (
            <Option key={l.level} title={l.title} description={l.body(user)} selected={level === l.level} onClick={() => setLevel(l.level)} />
          ))}
        </Stack>
        <Button variant="primary" size="lg" block onClick={async () => onDone(await api.setAnonymity(user.id, level))}>Continue</Button>
      </Stack>
    </Screen>
  )
}
