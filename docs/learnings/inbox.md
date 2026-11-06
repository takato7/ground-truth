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
