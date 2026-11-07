# Groundline

**Hackathon for Good #8 · ACAPS "Ground Truth" challenge** · The Hague, 6–8 November 2026

A lightweight app that keeps ACAPS analysts and the experts on the ground in short, regular loops. Experts answer a few focused questions in under a minute, and get ACAPS's latest analysis and the impact of their answers back straight away.

## The problem, as we read it

ACAPS and its experts both want good data, but their incentives don't line up. Analysts look at the big picture from outside the room; experts are busy with day-to-day decisions. Today their knowledge reaches ACAPS through one-off conversations and email chains, then disappears.

Groundline turns that into a small, frictionless exchange: **experts give a minute of ground truth, and get back ACAPS data that helps them plan.** Shorter loops mean ACAPS's picture stays closer to what's happening, and experts see a clearer view of what's coming.

## How it works

The demo is built around the brief's live risk, **R1043: Sudan conflict spillover into eastern Chad**, using the real Risk Radar export.

**Three pages**

- **Feed**: this week's questions. Each card stands on its own, so an expert answers only what they know about. They can target where ACAPS might be wrong, instead of filling in a whole survey.
- **News**: ACAPS's latest updates for the region (R1043, R1066, R1055), taken verbatim from the export.
- **You**: the expert's answer history, and what changed at ACAPS because of it.

**Question types**, all generated from ACAPS's own fields:

- *Risk*: "Will this get clearly worse in six months?" on ACAPS's five-step probability scale. This makes the answers forecasts that can be scored once the risk resolves.
- *Trigger*: "ACAPS rates this trigger X% complete. Does that match what you see?" (about right / further / not as far / something else). This is ground truthing against the triggers analysts already track.
- *Open*: "What is ACAPS not watching?"

**The loop**

1. **Answer first.** Peer answers stay hidden until you've answered, so you aren't anchored by the group (Delphi-style).
2. **See the panel.** After answering you see how the 5–10 experts on the panel split, so you can tell whether others see the same thing.
3. **See the impact.** The You page shows when a round changed ACAPS's analysis.
4. **Stay current.** Answering keeps the News page unlocked. Experts who skip a round lose access until they answer again. They get value for their input, not engagement for its own sake.

**Anonymity** (expert-controlled, can be changed at any time)

- **Known to ACAPS**: named to peers on the panel.
- **Anonymous**: counted in panel results but never named or quoted, and their notes never appear for other experts.
- Panel results stay hidden until at least 3 people have answered, so a small panel can't be used to work out who said what.
- Nothing is attributed to an individual publicly.

## Try it

Requires Node 24.

```bash
cd frontend
npm install
npm run dev
```

The demo bar in the bottom-left corner jumps between seven scenarios: onboarding a new invite, first week, regular expert, halfway through the week, all caught up, lapsed (News locked), and anonymous expert. Any invite code works. State is saved in `localStorage`; **Restart** resets the current scenario.

Checks: `npm run lint && npm run typecheck && npm test`.

## Built with the data

- `frontend/scripts/build_reports.py` turns `data/risk-radar-export.csv` into `frontend/src/mocks/risk-radar-active.json`: every active risk, with ACAPS's text kept verbatim and inline citations moved into source lists.
- Trigger completion rates, probability ratings and risk titles on the cards come straight from the R1043 record. Only the peer experts and their answers are made up (no real personal data).

## Not built yet (pilot roadmap)

- **Track record**: Brier-score the risk forecasts as they resolve, to learn whose judgement to weight more in which context. The export's resolved risks can be used to test this before any expert joins.
- **Notifications** that follow a healthy rhythm: more rounds for active experts, a gentle nudge for those who've lapsed.
- **Translation** of the whole app and its notifications into each expert's working language (French first).
- **Invite links** that let a new expert answer one question before signing up, to show how quick it is.
- **Moderator view** for ACAPS, with AI-assisted synthesis of the panel's input behind the scenes.

Open questions we'd test with experts: how to word questions so they're easy to answer, and whether a dashboard of cards or a single guided questionnaire works better.

## Repository

```
frontend/          React + TypeScript + Vite prototype (runs without a backend)
data/              ACAPS Risk Radar export (organiser-provided)
docs/              Challenge brief, evaluation criteria, data dictionary, methodology
notebooks/         Organiser's data-exploration notebook (pip install -r requirements.txt)
references/        ACAPS risk methodology
```

MIT licensed. ACAPS data is used under [ACAPS' terms of use](https://www.acaps.org/en/about/terms-of-use).
