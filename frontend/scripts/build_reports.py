"""Build src/mocks/risk-radar-active.json from the ACAPS export (data/risk-radar-export.csv).

Every active risk, with its text kept verbatim apart from inline citations, which are moved
into a `sources` list ("UNHCR 25/09/2026"). Run from frontend/: python3 scripts/build_reports.py
"""

import csv
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "data" / "risk-radar-export.csv"
OUT = ROOT / "frontend" / "src" / "mocks" / "risk-radar-active.json"

LINK = r"\[[^\]]+\]\s?\(.*?\)"
# A run of cited links, however it's punctuated: "(… , …)", "; …; …", or an unclosed "(… , …".
CITATION = re.compile(r"[\s.,;]*\(?\s*" + LINK + r"(?:\s*[,;]\s*" + LINK + r")*\s*\)?")
NAME = re.compile(r"\[([^\]]+)\]\s?\(")


def clean(text: str) -> tuple[str, list[str]]:
    """Text without its inline citations, and the cited source names in order."""
    sources: list[str] = []
    for m in CITATION.finditer(text):
        for n in NAME.findall(m.group(0)):
            if n not in sources:
                sources.append(n)
    # Keep the sentence's own full stop: a citation run swallows the punctuation before it.
    body = CITATION.sub(lambda m: "." if "." in m.group(0).split("[")[0] else "", text)
    body = re.sub(r"\s*\(\s*\)", "", body)
    body = re.sub(r"[ \t]+\n", "\n", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    body = re.sub(r"\s+\.", ".", body)
    body = re.sub(r"(?<!\.)\.\.(?!\.)", ".", body)
    return body.strip(), sources


def iso(date: str, sep: str) -> str:
    return datetime.strptime(date.strip(), f"%d{sep}%m{sep}%Y").date().isoformat()


def updates(text: str):
    parts = re.split(r"(?im)^\s*update\s+(\d{1,2}/\d{1,2}/\d{4})\s*$", text)
    out = []
    for date, body in zip(parts[1::2], parts[2::2]):
        body, sources = clean(body)
        if body:
            out.append({"date": iso(date, "/"), "text": body, "sources": sources})
    return sorted(out, key=lambda u: u["date"], reverse=True)


def field(block: str, name: str, nxt: str) -> str:
    m = re.search(rf"{name}:(.*?)(?=^{nxt}:|\Z)", block, re.S | re.M)
    return m.group(1).strip() if m else ""


def triggers(text: str):
    out = []
    for block in re.split(r"(?m)^(?=Trigger ID:)", text):
        m = re.match(r"Trigger ID:\s*(R\d+)\s*-\s*(T\d+)", block)
        if not m:
            continue
        description, _ = clean(field(block, "Description", "Sources").lstrip(":").strip())
        rate = re.search(r"Completion rate:\s*(\d+)%", block)
        history = re.findall(
            r"^(\d\d-\d\d-\d{4}):\s*(\d+)%",
            field(block, "Completion rate history", "Quantitative objective to meet 100%"),
            re.M,
        )
        objective = field(block, "Quantitative objective to meet 100%", "Trend")
        objective = re.sub(r"^(Yes|No)\.\s*", "", objective)
        entered = re.search(r"Date entered:\s*(\d\d-\d\d-\d{4})", block)
        last = re.search(r"Last update:\s*(\d\d-\d\d-\d{4})", block)
        out.append(
            {
                "id": m.group(2),
                "title": field(block, "Title", "Description"),
                "description": description,
                "completionRate": int(rate.group(1)) if rate else None,
                "completionHistory": [{"date": iso(d, "-"), "rate": int(r)} for d, r in history],
                "objective": objective or None,
                "entered": iso(entered.group(1), "-") if entered else None,
                "lastUpdate": iso(last.group(1), "-") if last else None,
            }
        )
    return out


def build(row: dict) -> dict:
    rationale, r_src = clean(row["Rationale"])
    impact_text, i_src = clean(row["Expected impact"])
    ups = updates(row["Rationale update"])
    trigs = triggers(row["Triggers"])
    # Date shown in lists: the latest update, else the latest trigger change.
    dates = [u["date"] for u in ups] or [
        d for t in trigs for d in (t["lastUpdate"], t["entered"]) if d
    ]
    return {
        "id": row["Risk ID"],
        "country": row["Country"].strip(),
        "iso": row["ISO"].strip(),
        "title": row["Risk Title"].strip(),
        "riskType": row["Risk Type"].strip() or None,
        "status": row["Status"].strip(),
        "riskLevel": row["Risk Level"].strip() or None,
        "probability": row["Probability"].strip() or None,
        "impact": int(row["Impact"]) if row["Impact"].strip() else None,
        "trend": row["Risk trend"].strip() or None,
        "exposure": row["Expected exposure"].strip() or None,
        "updated": max(dates) if dates else None,
        "rationale": rationale,
        "rationaleSources": r_src,
        "expectedImpact": impact_text or None,
        "expectedImpactSources": i_src,
        "priorityNeeds": [n.strip() for n in row["Expected priority needs"].split(",") if n.strip()],
        "updates": ups,
        "triggers": trigs,
    }


rows = list(csv.DictReader(SRC.open(encoding="utf-8")))
reports = [build(r) for r in rows if r["Status"].strip() == "Active"]
OUT.write_text(json.dumps(reports, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(reports)} active risks -> {OUT.relative_to(ROOT)}")
