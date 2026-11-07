# Learnings inbox

Reusable lessons and harness issues, triaged by `/retro`. Add new entries below the `---` line.

```markdown
### <short title>

- Source: <where it was seen>
- What happened: <facts>
- Generalised rule: <the rule to adopt, or "none yet">
- Suggested target: <lint/test, hook, skill, rule, CLAUDE.md, or RDR/ADR>
```

---

### An interrupted command may have partly run

- Source: issue #2, AC2 port check. A tool call was reported as rejected, yet its script had left a container holding 8041. The next check measured that container instead of the intended listener, until `lsof` and `docker ps` showed it.
- What happened: the helper listener died on bind, and the failure looked like the expected result.
- Generalised rule: after an interrupted command, look for what it started. In a check that sets up a precondition, confirm the holder is your own process before reading the result.
- Suggested target: `.claude/rules/workflow.md`. Do not change the harness during the hackathon.

### A user's waiver of an acceptance criterion belongs on the issue

- Source: PR #5 review. The instruction to verify one case was in the plan only, so the reviewer rightly treated the criterion as standing.
- What happened: a must-fix was raised that recording the decision on the issue would have avoided.
- Generalised rule: when the user narrows or waives a criterion, record it on the issue when it happens, not only in the plan.
- Suggested target: implement skill, or plan-tracking skill. Do not change the harness during the hackathon.

### sandbox.sh's empty HOME hides the docker compose plugin

- Source: issue #2, running `make up` in `.claude/scripts/sandbox.sh` to test a missing env file.
- What happened: with HOME empty, `docker compose` fails with "unknown command: docker compose", because the plugin is found through `~/.docker`. A compose check in the sandbox therefore fails for the wrong reason. Worked around with an empty `--project-directory` outside the sandbox, not by passing the real HOME.
- Generalised rule: when a check is meant to fail, read why it failed before counting it as evidence.
- Suggested target: `.claude/rules/workflow.md`, or a note in `sandbox.sh`. Do not change the harness during the hackathon.

### sandbox.sh copies the gitignored .claude/ into the sandbox, including its own directory

- Source: application scaffold proposal, reading `.claude/scripts/sandbox.sh` and `.claude/hooks/tests/run.sh`.
- What happened: in this repo `.claude/` is intentionally gitignored, so `sandbox.sh -i .claude` takes the "ignored input" branch and runs `cp -Rp` on the whole directory. That includes `.claude/.cache/sandbox/`, which holds the sandbox being built. Self-test cases that expect an empty sandbox dir fail: `run.sh` lines 724-725, 739 (one per signal) and 765. A `cp -Rp` run on a fake tree confirmed the nested copy; the self-test itself had not been run when this entry was written.
- Generalised rule: an input copied whole must exclude the sandbox's own directory, whether or not the input is ignored.
- Suggested target: `.claude/scripts/sandbox.sh` and its self-test. Do not change the harness during the hackathon.

### check-hooks is always skipped when .claude/ is gitignored

- Source: application scaffold proposal, reading `.claude/hooks/tests/run.sh` and running its two git queries in this repo.
- What happened: `selftest_needed` looks for changes with `git diff -- .claude` and `git ls-files -o --exclude-standard -- .claude`. Both are empty when `.claude/` is ignored, so it is false and `make check-hooks` always skips the self-test, even after a harness edit. `make check` passing therefore says nothing about the hooks; only `run.sh --all` runs them.
- Generalised rule: a "did this change?" check must not depend on the path being tracked; when it cannot tell, it runs the check.
- Suggested target: `.claude/hooks/tests/run.sh`. Do not change the harness during the hackathon.

### A cast on `res.json()` hides a missing field from the type checker

- Source: PR #6 review, `frontend/src/api/health.ts`.
- What happened: the response was cast to the generated type and only `status` was checked, so a 200 with no count showed success. `tsc` could not see it, because the cast claims the field exists.
- Generalised rule: when a success state depends on a field, check that field at runtime. A generated type describes the contract, not the bytes that arrived.
- Suggested target: `.claude/rules/frontend.md` (it currently says to validate `res.json()` by typing it). Do not change the harness during the hackathon.
