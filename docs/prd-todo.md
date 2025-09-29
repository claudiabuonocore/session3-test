# Product Requirements Document (PRD) - Todo App Enhancements (Due Dates, Priority, Filters)

## 1. Overview

We are upgrading the existing minimal Todo application (currently: `title`, `completed`) to improve task organization, urgency signaling, and instructional value. The MVP introduces optional due dates, priority levels, and simple filtering—all stored locally without backend changes. This keeps complexity low while enabling core planning behaviors (identify what's due today, what's overdue, and what's most important). The design intentionally defers visual polish and advanced workflow features to later phases.

Supporting artifacts:
- Meeting transcript (Sept 16): `docs/artifacts/09162025-requirements-meeting.vtt`
- Slack confirmation (Sept 17): `docs/artifacts/09172025-slack-conversation-export.txt`

Success Criteria (MVP):
- User can add a task with optional due date and priority; defaults applied correctly.
- Filters (All, Today, Overdue) behave per definitions below.
- Data persisted across browser refresh via local storage.
- Invalid inputs (bad date, invalid priority) do not break the app and degrade gracefully.

---

## 2. MVP Scope

Core Functional Requirements:
- Add `dueDate` (optional) stored as ISO `YYYY-MM-DD` string when valid.
- Add `priority` enum with allowed values: `P1`, `P2`, `P3`; default = `P3` if omitted/invalid.
- Provide filter controls for: All, Today, Overdue.
  - All: show all tasks (completed + incomplete).
  - Today: show only incomplete tasks where `dueDate == today`.
  - Overdue: show only incomplete tasks where `dueDate < today`.
- Persist full task list (including new fields) in local storage (no backend / network calls).
- Maintain existing ability to mark tasks completed.

Data Model (MVP):
- Task object fields:
  - `id`: unique identifier (implementation detail—e.g., timestamp or UUID).
  - `title`: string, required (non-empty after trim).
  - `completed`: boolean (default false).
  - `priority`: `"P1" | "P2" | "P3"` (default `"P3"`).
  - `dueDate`: optional string (ISO date). Invalid or empty input → omitted.

Validation & Behavior Rules:
- Trimming: `title` trimmed; if empty post-trim, reject task creation.
- Date parsing: accept only `YYYY-MM-DD` (length 10, numeric year/month/day, basic validity). If invalid → ignore.
- Priority normalization: if not one of `P1|P2|P3`, set to `P3`.
- Local storage key: `todos` (exact string) or equivalent documented constant.
- Overdue definition: `dueDate < today` (date-only compare) AND `completed == false`.
- Today definition: `dueDate == today` (date-only compare) AND `completed == false`.

Non-Functional (MVP):
- Performance: Should handle at least 200 tasks without noticeable lag in filtering (basic array operations acceptable).
- Accessibility: Basic semantic HTML; advanced keyboard nav explicitly deferred.
- Browser Support: Modern Chromium-based browsers (codespace dev assumption).

Outcomes / Metrics (informal):
- Manual QA confirms filters produce disjoint logical sets (Today ⊆ All, Overdue ⊆ All; Today and Overdue mutually exclusive).
- No console errors during standard create / filter / complete flows.

---

## 3. Post-MVP Scope

Deferred (approved for later iteration):
- Visual highlighting of overdue tasks (e.g., red text/background/badge).
- Sorting order: Overdue first → priority (P1→P3) → due date ascending → undated last.
- Color-coded priority indicators (e.g., P1 red, P2 orange, P3 gray badges).
- Additional UI affordances (icons, subtle animations, improved spacing).

---

## 4. Out of Scope

Explicitly excluded from MVP & Post-MVP (for now):
- Notifications (email, push, in-app reminders).
- Recurring tasks / repetition rules.
- Multi-user or authentication.
- Keyboard navigation enhancements / advanced accessibility features.
- External / cloud / server storage (remain local only).
- Subtasks, attachments, comments, tags.
- Bulk edit or batch operations.

---

## 5. Open Questions / Assumptions

Assumptions:
- Time zone = user’s local system; no UTC normalization required.
- No soft-deletion; tasks are either present or manually removed (delete action TBD—not required for MVP).
- Display format for dates can mirror input (no localization needed).
- Sorting (within MVP) may remain “in insertion order” until Post-MVP sorting is implemented.

Potential Future Clarifications:
- Max `title` length (recommend soft limit ~140 chars?).
- Should completed tasks optionally hide in All via a toggle? (Not requested.)
- Whether to expose a “No due date” explicit badge for clarity.

---

## 6. Success Evaluation & Rollout

Rollout: Single release; no migration since existing tasks lack new fields and will gain defaults lazily (missing fields handled defensively).

Test Strategy (lightweight):
- Unit tests for: filter logic, date validation, priority defaulting.
- Integration/UI test: create tasks across scenarios (with/without due date, invalid date, each priority) and verify filter outputs.

Acceptance Criteria (Representative):
- Given a task with due date today, it appears only in Today (and All) when incomplete.
- Given a task with past due date and incomplete, it appears only in Overdue (and All).
- Given a task with invalid due date input, it stores without `dueDate` and never appears in Today/Overdue.
- Given omitted priority, task stores with `priority === "P3"`.

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incorrect date edge handling (timezone midnight issues) | Misclassification of Today vs Overdue | Use date-only (YYYY-MM-DD) comparisons, avoid time components |
| Local storage quota edge (unlikely) | Data loss on very large lists | Scope limited; 200 items << typical limits |
| Future backend integration changes shape | Refactor cost | Keep data model simple, version optional wrapper later |

---

## 8. Glossary
- P1 / P2 / P3: Priority levels (High / Medium / Low semantic mapping).
- Overdue: dueDate earlier than today and task not completed.
- Today: dueDate equals today’s date and task not completed.

---

## 9. Change Log
- v1 (2025-09-29): Initial PRD drafted from Sept 16 meeting + Sept 17 Slack confirmation.
