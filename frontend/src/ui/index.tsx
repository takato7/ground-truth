// Shared UI components. Screens compose these; they shouldn't need their own CSS.
// Styling lives in ./components.css and only uses tokens from ./tokens.css.

import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import './tokens.css'
import './components.css'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export type Tone = 'plain' | 'rose' | 'butter' | 'mint' | 'sky' | 'lilac'

// ---- layout ----------------------------------------------------------------

export function Screen({ children, className, center }: { children: ReactNode; className?: string; center?: boolean }) {
  return <main className={cx('ui-screen', center && 'ui-screen--center', className)}>{children}</main>
}

export function Stack({ children, gap = 3, className }: { children: ReactNode; gap?: 1 | 2 | 3 | 4 | 5 | 6; className?: string }) {
  return <div className={cx('ui-stack', className)} style={{ gap: `var(--space-${gap})` }}>{children}</div>
}

export function Row({ children, wrap, end, className }: { children: ReactNode; wrap?: boolean; end?: boolean; className?: string }) {
  return <div className={cx('ui-row', wrap && 'ui-row--wrap', end && 'ui-row--end', className)}>{children}</div>
}

/** Three-slot bar: left / centre / right. */
export function TopBar({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return (
    <header className="ui-topbar">
      <div className="ui-topbar__side">{left}</div>
      <div className="ui-topbar__center">{center}</div>
      <div className="ui-topbar__side ui-topbar__side--end">{right}</div>
    </header>
  )
}

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return <span className={cx('ui-logo', size === 'lg' && 'ui-logo--lg')}>acaps</span>
}

// ---- type ------------------------------------------------------------------

/** Serif display heading, as on the highlighted cards. */
export function Title({ children, size = 'lg', center, as: Tag = 'h1' }: { children: ReactNode; size?: 'md' | 'lg' | 'xl'; center?: boolean; as?: 'h1' | 'h2' | 'h3' }) {
  return <Tag className={cx('ui-title', `ui-title--${size}`, center && 'ui-center')}>{children}</Tag>
}

export function Text({ children, variant = 'body', center, className }: { children: ReactNode; variant?: 'lead' | 'body' | 'meta'; center?: boolean; className?: string }) {
  return <p className={cx('ui-text', `ui-text--${variant}`, center && 'ui-center', className)}>{children}</p>
}

/** Small coloured marker, e.g. before a card's meta line. */
export function Dot({ tone, ring }: { tone: Tone; ring?: boolean }) {
  return <i className={cx('ui-dot', `ui-dot--${tone}`, ring && 'ui-dot--ring')} aria-hidden />
}

// ---- actions ---------------------------------------------------------------

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'choice'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  selected?: boolean
}

/**
 * All buttons are rounded pills.
 * primary: dark fill · secondary: soft grey · ghost: text only · choice: large answer option.
 */
export function Button({ variant = 'secondary', size = 'md', block, selected, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      aria-pressed={variant === 'choice' ? !!selected : rest['aria-pressed']}
      className={cx('ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, block && 'ui-btn--block', selected && 'is-selected', className)}
    />
  )
}

/** Large option with a title and a line of explanation (e.g. anonymity levels). */
export function Option({ title, description, selected, onClick }: { title: string; description: string; selected?: boolean; onClick: () => void }) {
  return (
    <button className={cx('ui-option', selected && 'is-selected')} aria-pressed={!!selected} onClick={onClick}>
      <span className="ui-option__title">{title}</span>
      <span className="ui-option__desc">{description}</span>
    </button>
  )
}

/** Text-sized link button. */
export function Link({ children, onClick, center }: { children: ReactNode; onClick: () => void; center?: boolean }) {
  return <button className={cx('ui-link', center && 'ui-link--center')} onClick={onClick}>{children}</button>
}

// ---- containers --------------------------------------------------------------

/** Rounded card. `tone` gives the highlighter tint; `plain` is white/raised. */
export function Card({ children, tone = 'plain', className, center }: { children: ReactNode; tone?: Tone; className?: string; center?: boolean }) {
  return <article className={cx('ui-card', `ui-card--${tone}`, center && 'ui-card--center', className)}>{children}</article>
}

/** The tappable top part of a card (meta, headline, summary). */
export function CardTap({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="ui-card__tap" onClick={onClick}>{children}</button>
}

/** Feed card: meta line with a dot, serif headline, optional summary, pill actions. */
export function FeedCard({ tone, meta, title, summary, onOpen, actions, center }: {
  tone: Tone; meta: ReactNode; title: ReactNode; summary?: ReactNode; onOpen: () => void; actions: ReactNode; center?: boolean
}) {
  return (
    <Card tone={tone} center={center} className="ui-feedcard">
      <CardTap onClick={onOpen}>
        <span className="ui-text ui-text--meta"><Dot tone={tone === 'plain' ? 'lilac' : tone} />{meta}</span>
        <span className="ui-title ui-title--md">{title}</span>
        {summary && <span className="ui-text ui-text--body ui-clamp">{summary}</span>}
      </CardTap>
      <Row wrap className={center ? 'ui-row--center' : undefined}>{actions}</Row>
    </Card>
  )
}

// ---- inputs ------------------------------------------------------------------

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx('ui-field', props.className)} />
}

export function TextArea({ max, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { max?: number }) {
  const len = typeof props.value === 'string' ? props.value.length : 0
  return (
    <div className="ui-textarea">
      <textarea {...props} maxLength={max} className={cx('ui-field', props.className)} />
      {max && <span className="ui-text ui-text--meta ui-textarea__count">{max - len}</span>}
    </div>
  )
}

/** iOS-style switch. */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={cx('ui-toggle', on && 'is-on')} onClick={() => onChange(!on)}>
      <span className="ui-toggle__knob" />
    </button>
  )
}

/** Light/dark switch. Remembers the choice; defaults to the OS setting. */
export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('gt-theme')
      if (saved) return saved === 'dark'
    } catch { /* ignore */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try { localStorage.setItem('gt-theme', dark ? 'dark' : 'light') } catch { /* ignore */ }
  }, [dark])
  return <Toggle on={dark} onChange={setDark} label="Dark mode" />
}

// ---- data display --------------------------------------------------------------

/** Segmented progress, e.g. which topic of the survey you're on. */
export function Steps({ count, current }: { count: number; current: number }) {
  return (
    <div className="ui-steps" aria-label={`${current + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => <span key={i} className={cx(i < current && 'is-done', i === current && 'is-current')} />)}
    </div>
  )
}

/** Single labelled bar, 0–100. */
export function Meter({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="ui-meter">
      <div className="ui-meter__label"><span>{label}</span><strong>{value === null ? 'not rated' : `${value}%`}</strong></div>
      <div className="ui-meter__track">{value !== null && <div className="ui-meter__fill" style={{ width: `${value}%` }} />}</div>
    </div>
  )
}

/** Stacked proportion bar with a legend. */
export function StackBar({ parts }: { parts: { label: string; value: number; tone: Tone }[] }) {
  const shown = parts.filter((p) => p.value > 0)
  return (
    <div className="ui-stackbar">
      <div className="ui-stackbar__bar" aria-hidden>
        {shown.map((p) => <span key={p.label} className={`ui-fill--${p.tone}`} style={{ flex: p.value }} />)}
      </div>
      <div className="ui-stackbar__legend">
        {shown.map((p) => <span key={p.label}><Dot tone={p.tone} />{p.value} {p.label}</span>)}
      </div>
    </div>
  )
}

/** List of short attributed notes. */
export function Notes({ items }: { items: { id: string; who: string; tag?: string; text?: string }[] }) {
  return (
    <ul className="ui-notes">
      {items.map((n) => (
        <li key={n.id}>
          <span className="ui-text ui-text--meta"><strong>{n.who}</strong>{n.tag && ` · ${n.tag}`}</span>
          {n.text && <p className="ui-text ui-text--body">{n.text}</p>}
        </li>
      ))}
    </ul>
  )
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="ui-badge">{children}</span>
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="ui-text ui-text--meta ui-error">{children}</p>
}
