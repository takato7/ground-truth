import { useState } from "react"
import { api, ApiError } from "../api/mockApi"
import type { AnonymityLevel, User } from "../api/types"
import { Logo, NextButton, Screen } from "../components"

export function InviteScreen({ onDone }: { onDone: (u: User) => void }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const submit = async () => {
    try {
      onDone(await api.redeemInvite(code))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong")
    }
  }
  return (
    <Screen className="center">
      <Logo />
      <div className="stack">
        <h1>Invite code</h1>
        <input
          className="field"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError("")
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit()
          }}
          placeholder="e.g. CHAD-E1"
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        <div className="row-end">
          <NextButton onClick={() => void submit()} disabled={!code.trim()} />
        </div>
        <p className="muted small">Demo codes: CHAD-E1 … CHAD-E6, ACAPS</p>
      </div>
    </Screen>
  )
}

const LEVELS: {
  level: AnonymityLevel
  title: string
  body: (u: User) => string
}[] = [
  {
    level: "known_to_acaps",
    title: "Known to ACAPS",
    body: (u) => `ACAPS sees your name. Peers see “${u.displayName}”.`,
  },
  {
    level: "pseudonymous",
    title: "Pseudonym",
    body: (u) => `Everyone, including ACAPS, sees “${u.displayName}”.`,
  },
  {
    level: "per_post",
    title: "Anonymous",
    body: () =>
      "A new alias for every risk. Nobody can link your answers together.",
  },
]

export function AnonymityScreen({
  user,
  onDone,
}: {
  user: User
  onDone: (u: User) => void
}) {
  const [level, setLevel] = useState<AnonymityLevel>(
    user.anonymity ?? "pseudonymous",
  )
  return (
    <Screen className="center">
      <Logo />
      <div className="stack">
        <h1>Anonymity</h1>
        <p className="muted">
          You can make this more private at any time. Answers are never public.
        </p>
        {LEVELS.map((l) => (
          <button
            key={l.level}
            className={`option ${level === l.level ? "selected" : ""}`}
            onClick={() => setLevel(l.level)}
          >
            <span className="option-title">{l.title}</span>
            <span className="option-body">{l.body(user)}</span>
          </button>
        ))}
        <div className="row-end">
          <NextButton
            onClick={() => void api.setAnonymity(user.id, level).then(onDone)}
          />
        </div>
      </div>
    </Screen>
  )
}
