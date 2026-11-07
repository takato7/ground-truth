import { House, Newspaper, UserRound } from "lucide-react"
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react"
import { useEffect, useState } from "react"
import { AppTitleBar } from "./components/AppTitleBar"
import { CardSheet } from "./components/CardSheet"
import { DeviceFrame } from "./components/DeviceFrame"
import { ArticleSheet } from "./components/ArticleSheet"
import { Pager, TabBar, usePager, type PageDef } from "./components/Pager"
import { SCENARIOS, type ScenarioId } from "./data/scenarios"
import { StoreProvider, useStore } from "./data/store"
import type { Article, Card } from "./data/types"
import { FeedPage } from "./pages/FeedPage"
import { NewsPage } from "./pages/NewsPage"
import { Onboarding } from "./pages/Onboarding"
import { YouPage } from "./pages/YouPage"
import { useTheme, type ThemeMode } from "./ui"
import "./App.css"

interface Sheet {
  card: Card
  from: "feed" | "you"
  height: number
}

function Main() {
  const { state, dispatch, open } = useStore()
  const { ref, progress, index, goTo } = usePager(3)
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [article, setArticle] = useState<{
    article: Article
    height: number
  } | null>(null)

  // Opening the You page clears its "new answers" badge.
  useEffect(() => {
    if (index === 2) dispatch({ type: "seen" })
  }, [index, dispatch])

  const onOpen = (card: Card, from: Sheet["from"], el: HTMLElement) =>
    setSheet({ card, from, height: el.getBoundingClientRect().height })

  const active = (from: Sheet["from"]) =>
    sheet?.from === from ? sheet.card.id : undefined
  const answer = sheet && state.answers[sheet.card.id]
  // Answered from the feed, the card has left the list, so the sheet flies off instead of shrinking back.
  const returning =
    !sheet || sheet.from === "you" || open.some((c) => c.id === sheet.card.id)

  const pages: PageDef[] = [
    {
      id: "feed",
      label: "Feed",
      icon: House,
      badge: open.length,
      content: (
        <FeedPage
          activeId={active("feed")}
          activeHeight={sheet?.height}
          onOpen={onOpen}
          onGoNews={() => goTo(1)}
        />
      ),
    },
    {
      id: "news",
      label: "News",
      icon: Newspaper,
      content: (
        <NewsPage
          activeId={article?.article.id}
          activeHeight={article?.height}
          onOpen={(a, el) =>
            setArticle({
              article: a,
              height: el.getBoundingClientRect().height,
            })
          }
          onGoFeed={() => goTo(0)}
        />
      ),
    },
    {
      id: "you",
      label: "You",
      icon: UserRound,
      badge: state.unseen,
      content: (
        <YouPage
          activeId={active("you")}
          activeHeight={sheet?.height}
          onOpen={onOpen}
        />
      ),
    },
  ]

  return (
    <LayoutGroup>
      <div className="app-column">
        <AppTitleBar labels={pages.map((p) => p.label)} progress={progress} />
        <Pager pagerRef={ref} pages={pages} />
      </div>
      <TabBar pages={pages} progress={progress} index={index} onSelect={goTo} />
      <AnimatePresence>
        {sheet && (
          <CardSheet
            key={`${sheet.from}-${sheet.card.id}`}
            card={sheet.card}
            layoutId={`${sheet.from}-${sheet.card.id}`}
            // From the feed the sheet asks first, even mid-flow after this card was just answered.
            answer={sheet.from === "you" ? (answer ?? undefined) : undefined}
            identity={state.identity}
            returning={returning}
            onAnswer={(a) => dispatch({ type: "answer", answer: a })}
            onClose={() => setSheet(null)}
          />
        )}
        {article && (
          <ArticleSheet
            key={`news-${article.article.id}`}
            article={article.article}
            layoutId={`news-${article.article.id}`}
            openQuestions={open.length}
            onGoFeed={() => goTo(0)}
            onClose={() => setArticle(null)}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}

/** Dev-only: jump to any demo situation. Replaces login and the old reset button. */
function DevBar({ onJump }: { onJump: () => void }) {
  const { scenario, dispatch } = useStore()
  const { mode, setMode } = useTheme()
  const jump = (id: ScenarioId) => {
    dispatch({ type: "scenario", id })
    onJump()
  }
  return (
    <div className="devbar">
      <select
        value={scenario}
        onChange={(e) => jump(e.target.value as ScenarioId)}
        aria-label="Demo scenario"
      >
        {Object.entries(SCENARIOS).map(([id, s]) => (
          <option key={id} value={id}>
            {s.label}
          </option>
        ))}
      </select>
      <button onClick={() => jump(scenario)}>Restart</button>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as ThemeMode)}
        aria-label="Theme"
      >
        <option value="system">System theme</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}

function Shell() {
  const { state } = useStore()
  // Remount on every jump so pages, scroll and any open sheet start clean.
  const [epoch, setEpoch] = useState(0)
  return (
    <div className="shell">
      <DeviceFrame screenKey={epoch}>
        {state.onboarding === "done" ? <Main /> : <Onboarding />}
      </DeviceFrame>
      <DevBar onJump={() => setEpoch((n) => n + 1)} />
    </div>
  )
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </MotionConfig>
  )
}
