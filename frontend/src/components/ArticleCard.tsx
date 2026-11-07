import { motion } from "motion/react"
import { reportById } from "../data/reports"
import type { Article } from "../data/types"
import {
  Text,
  cx,
  type Hue,
  layoutRadius,
  press,
  spring,
  surfaceClass,
} from "../ui"
import { CardMeta, SourceLine, postDate } from "./CardHeader"
import "./ArticleCard.css"

export const ARTICLE_PILL: Record<Article["kind"], { pill: string; hue: Hue }> =
  {
    update: { pill: "Update", hue: "teal" },
    added: { pill: "New risk", hue: "coral" },
  }

/**
 * The quoted line under an article's title: the risk an update belongs to, or, for a new
 * risk (whose title is already the headline), where it is and how ACAPS rated it.
 */
export function articleSource(article: Article) {
  const r = reportById(article.riskId)
  if (article.kind === "update") return r.title
  return [r.country, r.riskLevel && `${r.riskLevel} risk`]
    .filter(Boolean)
    .join(" · ")
}

/**
 * One ACAPS post in the News feed, built like a question card: kind and date, the headline,
 * then the risk it belongs to. Opens into an ArticleSheet.
 */
export function ArticleCard({
  article,
  layoutId,
  onOpen,
}: {
  article: Article
  layoutId: string
  onOpen: (el: HTMLElement) => void
}) {
  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      transition={spring.layout}
      className={cx(surfaceClass({ pad: "none" }), "acard")}
      style={layoutRadius}
      whileTap={press}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      <motion.div layout="position" className="acard-body">
        <CardMeta
          {...ARTICLE_PILL[article.kind]}
          date={postDate(article.date)}
        />
        <Text role="heading" className="clamp-3">
          {article.headline}
        </Text>
        <SourceLine id={article.riskId} text={articleSource(article)} />
      </motion.div>
    </motion.button>
  )
}
