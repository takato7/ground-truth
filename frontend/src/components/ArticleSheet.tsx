import { ArrowRight } from "lucide-react"
import { motion, useDragControls, type PanInfo } from "motion/react"
import { useEffect, useState, type ReactNode } from "react"
import { PANEL_RISK, STATS, reportById } from "../data/reports"
import { sections, withSource } from "../data/share"
import type { Article } from "../data/types"
import {
  Button,
  Chip,
  DISMISS,
  Meter,
  Stat,
  Surface,
  Text,
  cx,
  layoutRadius,
  spring,
  surfaceClass,
} from "../ui"
import { ARTICLE_PILL, articleSource } from "./ArticleCard"
import { CardMeta, SourceLine } from "./CardHeader"
import { SheetTop } from "./CardSheet"
import { ImpactScale, RiskLevel } from "./RiskMarks"
import { CopyHeader, ShareBar } from "./ShareBar"
import "./ArticleSheet.css"

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

/** ACAPS's longer text, clamped until opened, with the sources it cited. */
function Passage({ text, sources }: { text: string; sources: string[] }) {
  const [more, setMore] = useState(false)
  return (
    <>
      <Text className={cx("report-text", !more && "clamp-5")}>{text}</Text>
      <Button variant="link" size="sm" onClick={() => setMore((m) => !m)}>
        {more ? "Show less" : "Read more"}
      </Button>
      {more && sources.length > 0 && (
        <Text role="meta">Sources: {sources.join(", ")}</Text>
      )}
    </>
  )
}

function Fact({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? "report-facts-wide" : undefined}>
      <Text role="meta">{label}</Text>
      {typeof children === "string" ? (
        <Text role="label" color="primary">
          {children}
        </Text>
      ) : (
        children
      )}
    </div>
  )
}

/**
 * One ACAPS post opened full-height: the post itself in full, then the risk it belongs to,
 * laid out like the ACAPS risk page (rating, triggers, rationale, expected impact). Every
 * field comes from the export. Grows out of its ArticleCard.
 */
export function ArticleSheet({
  article,
  layoutId,
  openQuestions,
  onGoFeed,
  onClose,
}: {
  article: Article
  layoutId: string
  /** Questions left this week, offered at the end of the panel's own risk. */
  openQuestions: number
  onGoFeed: () => void
  onClose: () => void
}) {
  const r = reportById(article.riskId)
  const drag = useDragControls()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS.distance || info.velocity.y > DISMISS.velocity)
      onClose()
  }
  const rated = r.triggers.some((t) => t.completionRate !== null)
  const stats = STATS[article.id]
  const parts = sections(article, r)
  const copyable = (title: string, text: string) => (
    <CopyHeader title={title} text={withSource(r, title, text)} />
  )

  return (
    <>
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.section
        role="dialog"
        aria-label={article.headline}
        layoutId={layoutId}
        transition={spring.layout}
        className={cx(surfaceClass({ pad: "none" }), "sheet")}
        style={layoutRadius}
        drag="y"
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={onDragEnd}
      >
        <motion.div
          className="sheet-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
        >
          <SheetTop
            step={0}
            questions={0}
            onClose={onClose}
            onDragStart={(e) => drag.start(e)}
          />
          <div className="sheet-scroll">
            <div className="sheet-step report">
              <div className="stack gap-3">
                <CardMeta
                  {...ARTICLE_PILL[article.kind]}
                  date={longDate(article.date)}
                />
                <Text as="h2" role="title">
                  {article.headline}
                </Text>
                <SourceLine id={r.id} text={articleSource(article)} full />
              </div>
              <ShareBar article={article} report={r} />
              {article.body && (
                <Text className="report-text">{article.body}</Text>
              )}
              {article.sources.length > 0 && (
                <Text role="meta">Sources: {article.sources.join(", ")}</Text>
              )}

              {stats && (
                <div className="stats">
                  {stats.map((s) => (
                    <Stat key={s.label} value={s.value} label={s.label} />
                  ))}
                </div>
              )}

              {copyable(`About ${r.id}`, parts.about)}
              <Surface well pad="sm" className="report-facts">
                {r.riskLevel && (
                  <Fact label="Risk level">
                    <RiskLevel level={r.riskLevel} />
                  </Fact>
                )}
                {r.probability && (
                  <Fact label="Probability">{r.probability}</Fact>
                )}
                {r.impact !== null && (
                  <Fact label="Impact">
                    <ImpactScale value={r.impact} />
                  </Fact>
                )}
                {r.exposure && (
                  <Fact label="Expected exposure">{r.exposure}</Fact>
                )}
                <Fact label="Status">{r.status}</Fact>
                {r.trend && <Fact label="Trend">{r.trend}</Fact>}
                {r.riskType && (
                  <Fact label="Risk type" wide>
                    {r.riskType}
                  </Fact>
                )}
              </Surface>

              {r.triggers.length > 0 && (
                <>
                  {copyable("Triggers", parts.triggers)}
                  <ul className="stack gap-3">
                    {r.triggers.map((t) => (
                      <Surface
                        as="li"
                        well
                        pad="sm"
                        key={t.id}
                        className="report-trigger"
                      >
                        <Text role="heading" as="span">
                          {t.title}
                        </Text>
                        {t.completionRate !== null && (
                          <Meter
                            value={t.completionRate}
                            label={`${t.completionRate}% completed`}
                          />
                        )}
                        <Text role="meta">{t.id}</Text>
                      </Surface>
                    ))}
                  </ul>
                  {rated && (
                    <Text role="meta">
                      Completion is how close a trigger is to its 100%
                      condition, not how likely it is.
                    </Text>
                  )}
                </>
              )}

              {article.kind === "update" && (
                <>
                  {copyable("Rationale", parts.rationale)}
                  <Passage text={r.rationale} sources={r.rationaleSources} />
                </>
              )}
              {r.expectedImpact && (
                <>
                  {copyable("Expected impact", parts.expectedImpact)}
                  <Passage
                    text={r.expectedImpact}
                    sources={r.expectedImpactSources}
                  />
                </>
              )}
              {r.priorityNeeds.length > 0 && (
                <div className="stack gap-2">
                  <Text role="meta">Expected priority needs</Text>
                  <div className="report-chips">
                    {r.priorityNeeds.map((n) => (
                      <Chip key={n}>{n}</Chip>
                    ))}
                  </div>
                </div>
              )}

              {r.id === PANEL_RISK && openQuestions > 0 && (
                <Button
                  iconEnd={ArrowRight}
                  onClick={() => {
                    onClose()
                    onGoFeed()
                  }}
                >
                  Answer this week’s questions
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.section>
    </>
  )
}
