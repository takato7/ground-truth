# Ground Truth — frontend (design prototype)

React + TypeScript + Vite. Runs **without a backend**: `src/api/mockApi.ts` is an
in-browser stand-in that returns the shapes in `src/api/types.ts`, which mirror the
project brief (stances, 0–100 step-5 probability, 280-char reason, anonymity levels,
answer-first). Swap `mockApi` for real `fetch` calls / generated OpenAPI types later;
the screens shouldn't need to change.

```bash
cd frontend && npm install && npm run dev
```

- Demo invite codes: `CHAD-E1` … `CHAD-E6`, `ACAPS`. The dark bar at the bottom is a dev user switcher.
- `src/mocks/r1043.json` is R1043 extracted from `data/risk-radar-export.csv` (3 triggers).
- State lives in localStorage; "reset data" restores the seeded peer responses.
