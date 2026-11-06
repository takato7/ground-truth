import type { User } from '../api/types'
import { Avatar, Button, Row, Stack, Text, ThemeToggle, Title } from '../ui'

const LEVEL_LABEL = { known_to_acaps: 'Known to ACAPS', pseudonymous: 'Pseudonym', per_post: 'Anonymous' } as const

/** Side menu. Mostly placeholders for now. */
export function MenuContent({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const isAcaps = user.role === 'acaps'
  return (
    <Stack gap={6}>
      <Row>
        <Avatar size="lg" />
        <Stack gap={1}>
          <Title size="md" as="h2">{isAcaps ? 'ACAPS analyst' : user.displayName}</Title>
          {!isAcaps && user.anonymity && <Text variant="meta">{LEVEL_LABEL[user.anonymity]} · change any time</Text>}
        </Stack>
      </Row>
      <Stack gap={1}>
        {['Home', 'Your answers', 'Anonymity', 'Notifications'].map((item) => (
          <Button key={item} variant="ghost" size="lg" className="menu-item">{item}</Button>
        ))}
      </Stack>
      <Row className="menu-row">
        <Text variant="lead">Dark mode</Text>
        <ThemeToggle />
      </Row>
      <Button onClick={onSignOut}>Sign out</Button>
    </Stack>
  )
}
