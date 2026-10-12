# Cursor collaboration protocol

Strategy first. Execution only after approval.

ChatGPT is the strategy and review partner. Ken brings findings and proposed plans into that conversation before authorizing implementation.

Cursor inspects the project, reports accurate findings, and proposes one practical plan. Cursor does not start a new feature or a redesign before Ken approves the plan.

## Phase 1 — Inspect and report

1. Read `docs/CORE_VALUES.md` and `docs/SHOWCASE_LIBRARY.md` when the task touches the public site.
2. Inspect the actual source, structure, and affected parts.
3. Identify the current behavior, constraints, and what stays untouched.
4. Name risks, missing facts, and assumptions.
5. Recommend the strongest practical solution from the project as it is.

Do not guess about files, behavior, or status. Verify what can be verified.

## Phase 2 — One copy-paste strategy

Before any implementation, return the whole plan in one Markdown code block labeled `CURSOR IMPLEMENTATION PROPOSAL`, with these sections:

1. Task
2. Current Findings
3. Recommended Solution
4. Planned Changes
5. User Experience
6. Risks and Dependencies
7. Verification Plan
8. Acceptance Criteria
9. Assumptions and Decisions Needed
10. Execution Scope

Every reply to Ken includes one Markdown code block he can read and copy into ChatGPT. Keep the lines short enough to read without cutting words off. Do not answer in plain prose only. Do not hide the note in a four-line box. The block's copy control is at the top right. A brief sentence may sit outside the block. Essential content stays inside it.

## Phase 3 — Wait

After the proposal, stop. Do not edit source, install dependencies, migrate, or implement. A proposal is not approval. A revised plan is followed only after Ken approves it.

## Phase 4 — Execute only when authorized

1. Implement the approved scope only.
2. Leave unrelated behavior in place.
3. Verify the result.
4. Report files changed, checks run, results, and anything still open.
5. If a serious unforeseen risk changes the plan, stop and propose the adjustment first.

## Rules

- Inspect, propose, wait, execute, verify.
- Read-only inspection is allowed before approval.
- Do not claim a change or a check that did not happen.
- `docs/CORE_VALUES.md` still governs public claims. `docs/SHOWCASE_LIBRARY.md` is the evidence file.
