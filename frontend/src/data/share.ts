// Turning a Radar post into something an expert can pass on: plain text for copying and
// email, and a printable page for "Save as PDF". Everything is ACAPS's own published text.

import type { Article, Report } from "./types"

const RISK_LIST = "https://www.acaps.org/en/thematics/all-topics/risk-list"

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

const cited = (text: string, sources: string[]) =>
  sources.length ? `${text}\n\nSources: ${sources.join(", ")}` : text

/** The parts of a post that can be copied on their own. */
export function sections(article: Article, r: Report) {
  const facts = [
    r.riskLevel && `Risk level: ${r.riskLevel}`,
    r.probability && `Probability: ${r.probability}`,
    r.impact !== null && `Impact: ${r.impact}/5`,
    r.exposure && `Expected exposure: ${r.exposure}`,
    `Status: ${r.status}`,
    r.trend && `Trend: ${r.trend}`,
    r.riskType && `Risk type: ${r.riskType}`,
  ].filter(Boolean)
  return {
    post: [
      article.headline,
      article.body,
      article.sources.length && `Sources: ${article.sources.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    about: `${r.id}: ${r.title}\n${facts.join("\n")}`,
    triggers: r.triggers
      .map(
        (t) =>
          `• ${t.title}${t.completionRate !== null ? ` (${t.completionRate}% completed)` : ""}`,
      )
      .join("\n"),
    rationale: cited(r.rationale, r.rationaleSources),
    expectedImpact: r.expectedImpact
      ? cited(r.expectedImpact, r.expectedImpactSources)
      : "",
  }
}

/** One heading line, so a pasted section still says where it came from. */
export const withSource = (r: Report, label: string, text: string) =>
  `${label} · ${r.id} (${r.country})\n\n${text}`

function footer(article: Article) {
  return `ACAPS Risk Radar · ${longDate(article.date)}\n${RISK_LIST}`
}

/** The whole post and its risk, as plain text. */
export function fullText(article: Article, r: Report) {
  const s = sections(article, r)
  return [
    s.post,
    s.about,
    s.triggers && `Triggers\n${s.triggers}`,
    article.kind === "update" && `Rationale\n${s.rationale}`,
    s.expectedImpact && `Expected impact\n${s.expectedImpact}`,
    r.priorityNeeds.length &&
      `Expected priority needs: ${r.priorityNeeds.join(", ")}`,
    footer(article),
  ]
    .filter(Boolean)
    .join("\n\n")
}

/** mailto: link with a short version (mail clients cut off long bodies). */
export function emailLink(article: Article, r: Report) {
  const body = [article.headline, `${r.id}: ${r.title}`, footer(article)].join(
    "\n\n",
  )
  const subject = `ACAPS Risk Radar: ${r.country}, ${r.id}`
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Clipboard API first; a hidden textarea where it's blocked (embedded views, older browsers). */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.cssText = "position:fixed;opacity:0;pointer-events:none"
    document.body.appendChild(area)
    area.select()
    // Deprecated but still the only fallback that works without clipboard permission.
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  }
}

const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  )

const para = (text: string) =>
  text
    .split(/\n+/)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("")

/** A clean A4 page of the post, printed from a hidden frame (the browser offers Save as PDF). */
export function printReport(article: Article, r: Report) {
  const s = sections(article, r)
  const block = (title: string, html: string) =>
    html ? `<h2>${esc(title)}</h2>${html}` : ""
  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>${esc(`${r.id} ${r.country} · ACAPS Risk Radar`)}</title>
<style>
  @page { margin: 18mm; }
  body { font: 11pt/1.5 -apple-system, "Segoe UI", Roboto, sans-serif; color: #111; }
  .meta { color: #555; font-size: 9pt; text-transform: uppercase; letter-spacing: .04em; }
  h1 { font-size: 17pt; line-height: 1.25; margin: 4pt 0 8pt; }
  h2 { font-size: 12pt; margin: 16pt 0 4pt; }
  p { margin: 0 0 6pt; }
  .sources, footer { color: #555; font-size: 9pt; }
  footer { margin-top: 24pt; border-top: 1px solid #ccc; padding-top: 6pt; }
</style></head><body>
<div class="meta">${esc(article.kind === "update" ? "Update" : "New risk")} · ${esc(longDate(article.date))}</div>
<h1>${esc(article.headline)}</h1>
${article.body ? para(article.body) : ""}
${article.sources.length ? `<p class="sources">Sources: ${esc(article.sources.join(", "))}</p>` : ""}
${block(`About ${r.id}`, para(s.about))}
${block("Triggers", para(s.triggers))}
${article.kind === "update" ? block("Rationale", para(s.rationale)) : ""}
${block("Expected impact", s.expectedImpact && para(s.expectedImpact))}
${r.priorityNeeds.length ? block("Expected priority needs", para(r.priorityNeeds.join(", "))) : ""}
<footer>${para(footer(article))}</footer>
</body></html>`

  const frame = document.createElement("iframe")
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0"
  frame.srcdoc = html
  frame.onload = () => {
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    // Give the print dialog time to take its copy before the frame goes.
    setTimeout(() => frame.remove(), 1000)
  }
  document.body.appendChild(frame)
}
