# Brief — Step 8 Phases 7 and 8: history scoring and the programme-updated notice

**For Claude Code, as a cloud session.** Read `CLAUDE.md` in each repo root
first. Everything needed is here; you should not have to search to work out the
design. If something in this brief is wrong about the code, say so plainly
rather than working around it — that has been the most valuable part of the last
two briefs.

**Repositories in scope — FIVE this time.** The four client repos
`Juha-PTapp`, `Henna-PTapp`, `Joonatan-PTapp`, `Ville-PTapp`, **plus
`Coach-PTapp`**, because `src/core/engine.js` is byte-identical across all five
(`91B2B9E3663A9999`) and this brief changes it.

**Push a branch. Never push to `main`.** Fresh clones have no `node_modules`;
run `npm install` per repo before verifying or building.

---

## Phase 7 — score every day against the programme in force on that date

### The problem

`buildHistoryRows`, `buildSections`, `resolveSchedule` and `resolveTesting` all
take a single `program`. The client passes `PROGRAM` — the one resolved at
startup for *today*. So a day logged under Block 1 is re-scored against Block 2
once Block 2 starts, and the Calendar paints past days with the current
programme's sessions.

Ville gets Block 2 on 15 November, so this is dated.

### The design

One resolver, used everywhere a date is involved.

**7a. `src/core/engine.js` — one backwards-compatible change, ×5 repos**

`buildHistoryRows(log, overrides, program)` accepts a **function** as well as an
object:

```js
export function buildHistoryRows(log, overrides, program) {
  const programFor = typeof program === "function" ? program : () => program;
  // ...then inside the per-day map, replace every use of `program` with:
  const p = programFor(dateObj);
```

Both the `buildSections(...)` and `resolveSchedule(...)` calls inside the map use
`p`. Passing an object behaves exactly as today, which is why Coach-PTapp needs
no code change — but its `engine.js` must still be updated so the five stay
byte-identical. Rebuild Coach too.

Do the same for `buildSections`, `resolveSchedule` and `resolveTesting`: each
accepts a function or an object for its `program` argument, resolved with the
date it was given. Keep it to that one-line normalisation per function.

**7b. `src/core/programs.js` — a memoised resolver, ×4 client repos**

```js
export function makeProgramResolver({ compiled, prefix, userId, clientName })
```

- Read the cached rows **once** with `cachedRows(prefix)`.
- Run `selectRows({ rows, userId, clientName })` **once** and keep `kept`.
  Validation walks the whole definition; doing it per day would run it 57 times
  for John.
- Return `function programForDate(date)` that memoises by `YYYY-MM-DD` and
  returns `resolveForDate(kept, date)?.definition` or `compiled`.
- Export it alongside the existing functions.

**7c. `src/app.jsx` — pass the resolver at every date-bearing site, ×4**

Build it once near `PROGRAM_SOURCE` (about line 84):

```js
const programForDate = makeProgramResolver({
  compiled: COMPILED_PROGRAM, prefix: STORAGE_PREFIX, clientName: CLIENT_NAME,
});
```

Then replace `PROGRAM` with `programForDate` at exactly these twelve sites.
Line numbers are from `app.jsx` at `81b10da3518ee4b1`:

| Line | Current | Why it is date-bearing |
|---|---|---|
| 571 | `resolveSchedule(a, "auto", overrides, PROGRAM)` | comparing two dates when moving a session |
| 572 | `resolveSchedule(b, "auto", overrides, PROGRAM)` | same |
| 652-655 | `buildSections(viewedDate, {...}, PROGRAM)` | Today, and `viewedDate` moves with `dayOffset` |
| 660 | `resolveSchedule(viewedDate, "auto", overrides, PROGRAM)` | same |
| 678 | `resolveSchedule(d, "auto", overrides, PROGRAM)` | the next-strength-session lookahead |
| 690 | `buildHistoryRows(log, overrides, PROGRAM)` | **the main one** |
| 2032 | `resolveSchedule(p.calSelected, ...)` | Calendar's selected day |
| 2089 | `resolveSchedule(weekMonday, ...)` | the week's deload state |
| 2113 | `resolveSchedule(d, ...)` | every cell of the month grid |
| 2131 | `resolveTesting(d, p.overrides, PROGRAM)` | testing due on a grid day |
| 2266 | `resolveTesting(p.calSelected, ...)` | testing on the selected day |

Line 678-681 also reads `PROGRAM.slots` and `PROGRAM.blocks[slot][v]` inside the
lookahead loop — those should come from the resolved programme for that day `d`,
through `blocksFor`.

`CalendarView` and the other components receive `PROGRAM` implicitly today; pass
`programForDate` down as a prop rather than making it a module global inside
those components.

**Leave these alone — they are not date-bearing** and must keep using the
current `PROGRAM`: line 643 (`PROGRAM.slots` when cleaning an override), 713
(exercise-name lookup for load keys), 748 (`PROGRAM.tracking`, chart config),
963 (`usesHeartRate`), 1956-1957 (`programView`, the Program tab shows the
*current* programme), 2093 (`showDeloadToggle`), 2146-2148 (the legend), 2154
and 2258 (`PROGRAM.testing` presence), 2190-2231 (day-detail slot list — it
renders `p.calSelected`, so it SHOULD use the resolver; treat it as date-bearing
and add it to the table above).

### What must not change

For every client today, this produces **identical output**. Each client has one
programme version except John, who has two whose schedules are identical — I
verified that in the database. So Phase 7 ships with zero visible change, and
that is the acceptance bar.

---

## Phase 8 — tell the client their programme changed

Phase 5 already sets `programUpdate` state (app.jsx:203) when a refresh finds a
newer row than the one running, and shows a terse Settings line (app.jsx:1186).
Phase 8 makes it a real notice. The locked principle is that **a client is never
handed a different session silently**, and equally that a programme never
changes mid-session — so the notice says what is waiting, it does not swap
anything.

**8a. `src/core/programs.js`** — the `programs` table has a human-readable
`name` column (for example `Ville — Block 1 (28 Sep – 15 Nov 2026)`). Add
`name` to the select, carry it through `pickActive`, and return it from
`refreshPrograms` as `name` alongside `rowId`.

**8b. `src/app.jsx`** — when `programUpdate` is set, show a dismissible banner at
the top of the **Today** view:

> **New programme ready** — *Ville — Block 2*. Reopen the app to start it.

- Style it like the existing `p.moveSource` banner (app.jsx ~2069): tinted
  background, `borderColor: ACCENT`, `rounded-xl border px-3 py-2 mb-3`,
  `text-xs`.
- A dismiss control that clears it for this session only. It must reappear on the
  next open while the new programme is still unapplied — this is not a
  "seen once" flag.
- Offer a **Reopen now** action that calls `window.location.reload()`. Safe: the
  app persists to localStorage on every change, so nothing is lost. Do not apply
  the new programme without the client asking.
- Extend the Settings line (1186) to name the waiting programme rather than just
  saying "update ready".

---

## Acceptance criteria

### A. Equivalence — the bar for Phase 7

Write `test-history-versions.mjs` at the repo root, running under plain node
against the real `engine.js`:

1. With a **single** programme version, `buildHistoryRows(log, overrides, fn)`
   returns output **deeply equal** to `buildHistoryRows(log, overrides, obj)`.
   Use a synthetic log of at least 60 days spanning several weeks.
2. Same for `buildSections`, `resolveSchedule` and `resolveTesting` — function
   form equals object form.
3. With **two** versions whose `effective_from` are `-infinity` and a mid-range
   date, and whose schedules differ, each day resolves to the correct version:
   days before the switch score against the old one, days on or after against
   the new.
4. An **override naming a block absent from the version in force** must not
   throw. I verified today's engine already handles this — `resolveSchedule`
   reports the slot, `buildSections` emits no section, `buildHistoryRows` counts
   only what existed. Lock that behaviour in a test.
5. The resolver validates **once**, not per day: assert `selectRows` runs a
   single time for a 60-day log (spy on it, or expose a counter in the test).

### B. Structure — extend `verify-program-delivery.mjs`

- `programs.js` exports `makeProgramResolver`
- `app.jsx` builds the resolver and passes it at the date-bearing sites
- `app.jsx` contains **no** `buildHistoryRows(log, overrides, PROGRAM)`
- `engine.js` normalises a function argument in all four functions
- the Phase 8 banner exists and reads `programUpdate`

### C. Per repo

```
npm install
node verify-program-delivery.mjs
node test-program-view.mjs
node test-history-versions.mjs
node verify-start.mjs && node verify-train.mjs && node verify-theme.mjs \
  && node verify-time.mjs && node verify-wearables.mjs
npm run build
```

Coach-PTapp gets the new `engine.js` and a rebuild; its own verify scripts must
still pass.

Confirm `src/app.jsx`, `src/core/program-view.jsx` and `src/core/programs.js`
are byte-identical across the four clients, and `src/core/engine.js` across all
five. Report each hash.

Bump `APP_VERSION` to `5.5.0-beta1` in the four `src/core/program-<client>.js`,
and `COACH_VERSION` in Coach-PTapp to match its own convention.

---

## What NOT to do

- Do not write anything to the database.
- Do not change `STORAGE_PREFIX`, `package.json`, or hand-edit `bundle.js` or
  `styles.css`.
- Do not make the programme change mid-session. Phase 8 notifies; it does not
  swap.
- Do not push or merge to `main`.
- A cloud session is assigned its own branch — use it; do not invent a second
  branch name.

## Report back

Branch and commit per repo, the four confirmed hashes, test counts per repo,
and every place the brief turned out to be wrong about the code.
