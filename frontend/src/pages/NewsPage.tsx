import { Lock } from "lucide-react"
import { motion } from "motion/react"
import { ArticleCard } from "../components/ArticleCard"
import { ARTICLES, REGION } from "../data/reports"
import { useStore } from "../data/store"
import type { Article } from "../data/types"
import { Button, Callout, CardList, Page, Text, cx } from "../ui"
import { CardSlot } from "./FeedPage"
import "./NewsPage.css"

/**
 * ACAPS's own posts for the panel's region, newest first: each dated update to a risk there,
 * and the day each risk was added. Locked for experts who stopped answering.
 */
export function NewsPage({
  activeId,
  activeHeight,
  onOpen,
  onGoFeed,
}: {
  activeId?: string
  activeHeight?: number
  onOpen: (article: Article, el: HTMLElement) => void
  onGoFeed: () => void
}) {
  const { newsLocked } = useStore()

  return (
    <Page>
      <div
        className={cx("news stack gap-3", newsLocked && "locked")}
        aria-hidden={newsLocked}
      >
        <Text role="meta">
          ACAPS Risk Radar · {REGION.length} risks in and around eastern Chad
        </Text>
        <CardList>
          {ARTICLES.map((a) => (
            <CardSlot
              key={a.id}
              active={activeId === a.id}
              height={activeHeight}
            >
              <ArticleCard
                article={a}
                layoutId={`news-${a.id}`}
                onOpen={(el) => onOpen(a, el)}
              />
            </CardSlot>
          ))}
        </CardList>
      </div>

      {newsLocked && (
        <motion.div
          className="news-lock"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Callout
            layout="center"
            elevated
            icon={Lock}
            title="Update locked"
            action={<Button onClick={onGoFeed}>View open questions</Button>}
          >
            Answer one open question to read ACAPS’s latest updates.
          </Callout>
        </motion.div>
      )}
    </Page>
  )
}
