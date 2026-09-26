# Brief — Step 8 Phase 6: render the Program tab from the definition

**For Claude Code, running as a cloud session with all four client repos added.**
Everything needed is here; you should not have to search the repos to work out
the design. Read `CLAUDE.md` in each repo root first — its hard rules apply,
especially the branch policy and the byte-identical `app.jsx`.

**Repositories in scope**, all under the `yellowg-dev` org:
`Juha-PTapp`, `Henna-PTapp`, `Joonatan-PTapp`, `Ville-PTapp`.

**Push a branch called `step8-phase6` in each repo. Never push to `main`** — it is
what GitHub Pages serves to four people who use these apps daily.

**Each repo is a fresh clone with no `node_modules`.** Run `npm install` in a repo
before running the verify script or the build there.

**Source files you need are committed in `Juha-PTapp/phase6/`:**
- `phase6/program-schema.js` — copy UNCHANGED into every repo's `src/core/`
- `phase6/ville-programview.json` — fixture for the render test; leave it where it is

---

## 1. The problem

Each client's Program tab is a hand-written `ProgramView` React component in
`src/config.jsx`. It reads the programme's structure directly and with hardcoded
keys. Ville's, for example, does:

```jsx
{["a", "b", "c"].map((k) => (
  <Section title={BLOCKS.strength[k].label} subtitle={BLOCKS.strength[k].subtitle} ...>
    <ExerciseList exercises={BLOCKS.strength[k].exercises} ... />
```

plus `BLOCKS.strength.nogym`, `BLOCKS.run.easy`, `BLOCKS.run.long`,
`BLOCKS.bike.tempo`, `BLOCKS.bike.easy`, `BLOCKS.yoga.session`, `MOBILITY`,
`SCHEDULE.A`, `SLOT_META[slot].label` and `SLOT_OPTIONS[slot]`.

Since Step 8 Phase 5 the programme is **delivered from the database**, so a coach
can publish a programme whose blocks are renamed or removed. When that happens
`BLOCKS.strength[k]` is `undefined` and `.label` throws — a white screen on the
Program tab. Ville gets a new block on **15 November**, so this is not theoretical.

## 2. What to build

Three things, in this order.

### 2a. New shared file `src/core/program-view.jsx`

Byte-identical in all four client repos. Exports one component:

```jsx
export function GeneratedProgramView({ program, Section, ExerciseList, theme })
```

It renders `program.programView` — an array of cards. Return `null` if
`program.programView` is not a non-empty array.

`Section` and `ExerciseList` are passed in from `app.jsx` (they already exist
there and are already passed to the compiled `ProgramView`). Do not reimplement
them. `Section` takes `{ title, subtitle, color, defaultOpen, children }`.
`ExerciseList` takes `{ exercises, color }`.

**Card shape.** Wrap the whole list in
`<div className="px-4 max-w-md mx-auto space-y-3">` — that is what the existing
`ProgramView` components use, so spacing stays identical.

For each card:
- `title` — the card title. If `titleFrom: { group, key }` is present instead,
  take the title from `blocksFor(program, group)[key].label` and the subtitle from
  its `.subtitle`. If that block is missing, fall back to `card.title` if given,
  otherwise skip the card entirely — never throw.
- `subtitle` — optional, passed through.
- `color` — a **token**, resolved by `resolveColor` below. Never a hex.
- `defaultOpen` — boolean, passed through.
- `body` — ordered array of parts, rendered in order inside the Section.

**Colour resolution.** Write this helper in the same file:

```js
function resolveColor(token, theme) {
  if (token === "accent2") return theme.ACCENT_2;
  if (typeof token === "string" && token.startsWith("cat:")) {
    const cat = theme.CATS && theme.CATS[token.slice(4)];
    return (cat && cat.color) || theme.ACCENT;
  }
  return theme.ACCENT;                     // "accent", undefined, anything odd
}
```

A `cat:` name that does not exist in this client's `CATS` must fall back to
`theme.ACCENT`, not crash. Ville uses `cat:activity`, `cat:bike`, `cat:check`,
`cat:mobility`, `cat:run`, `cat:yoga`; other clients' `CATS` differ.

**Body part types.** All eight must be handled. Match the existing styling in
`config.jsx` so the tab looks unchanged:

| `type` | Fields | Render as |
|---|---|---|
| `heading` | `text` | `<p className="text-xs font-semibold" style={{ color: TEXT_SECONDARY }}>` |
| `paragraph` | `text`, `strong?`, `muted?` | `<p className="text-xs">`, colour `TEXT_MUTED` when `muted`. When `strong` is set, render it first as `<span className="font-semibold" style={{ color: TEXT_SECONDARY }}>` then a space then `text` |
| `lines` | `items[]` | one `<p className="text-xs">` per item, colour `TEXT_MUTED`, inside a `space-y-1` wrapper |
| `exercises` | `group`, `keys?`, `excludeTyped?`, `groupByBlock?`, `color?` | see below |
| `mobility` | — | `<ExerciseList exercises={mobilityFor(program)} color={partColor} />` |
| `week` | `week?` (`"A"` default) | the week table, see below |
| `table` | `columns?`, `rows[][]` | see below |
| `nutrition` | — | see below |

A part may carry its own `color` token, which overrides the card's.

**`exercises`.** Collect the exercises of the named blocks:

```js
const grp = blocksFor(program, part.group);
const keys = Array.isArray(part.keys) ? part.keys : Object.keys(grp);
```

For each key, skip it silently if `grp[key]` is missing. Concatenate
`grp[key].exercises || []`. If `excludeTyped` is true, drop entries with a
truthy `.type` (those are prose notes inside a block, not movements — the
existing code filters them with `.filter((e) => !e.type)`). Render one
`<ExerciseList>` with the result.

If `groupByBlock` is true, render each block separately, preceded by a
`heading`-styled line showing that block's `label`.

**`week`.** A row per weekday in the order Mon…Sun, generated from
`program.schedule[part.week || "A"]`. Copy the shape from Ville's current
`config.jsx` — it already generates this:

```jsx
const DOW = [[1,"Mon"],[2,"Tue"],[3,"Wed"],[4,"Thu"],[5,"Fri"],[6,"Sat"],[0,"Sun"]];
```

For each day, build the line by walking `program.slots` in order; for each slot
with a value, produce `` `${slotMetaFor(program, slot).label} — ${optionLabel}` ``
where `optionLabel` comes from the matching entry in
`slotOptionsFor(program, slot)` (`o.value === value`), falling back to the raw
value. Join multiple slots with `" + "`. If a day has no slots set, show
`day.note` if present, otherwise `"Rest"`. Layout: day name in
`FONT_MONO`, `width: 44`, `shrink-0`, colour `TEXT_SECONDARY`; the line in
`flex-1`.

**`table`.** `FONT_MONO`, `text-xs`. If `columns` is present render a header row
in `TEXT_SECONDARY`; then one row per entry. First cell `TEXT_SECONDARY`, the
rest normal, last cell `TEXT_MUTED`. Use a flex row per line like the existing
heart-rate zone table, not an HTML `<table>`.

**`nutrition`.** Render `program.nutritionTargets` — an object keyed by day type
(`training`, `rest`), each `{ cal, protein, fat, carbs }`. One block per key:
the key as a heading, then `< {cal} kcal` and
`P >{protein}g · F <{fat}g · C <{carbs}g` in `FONT_MONO`. Only Juha has this;
render nothing if absent.

**Never throw.** Use `blocksFor`, `slotMetaFor`, `slotOptionsFor` and
`mobilityFor` from `./program-schema.js` for every lookup. A missing block, slot
or list renders nothing or a fallback, never an exception.

### 2b. Wire it into `src/app.jsx`

`app.jsx` currently imports `ProgramView` from `./config.jsx` and renders it.
Change it to prefer the generated view:

- Import `GeneratedProgramView` from `./core/program-view.jsx`.
- Where `ProgramView` is rendered, render `GeneratedProgramView` instead **when
  `PROGRAM.programView` is a non-empty array**, passing the same
  `Section`/`ExerciseList`/`theme` props plus `program={PROGRAM}`. Otherwise
  render the compiled `ProgramView` exactly as today.
- Keep the `ProgramView` import — it is the fallback and must still work.

This is the whole `app.jsx` change. Do not restructure anything else in it.

### 2c. Make the three compiled `ProgramView`s defensive

`Henna-PTapp`, `Joonatan-PTapp` and `Juha-PTapp` keep their hand-written
`ProgramView` for now. In each of those three `src/config.jsx` files, make every
block read safe so a restructured programme degrades instead of white-screening:

- `BLOCKS.strength[k].label` → optional-chain it, and skip the Section when the
  block is missing.
- Same for every other direct block read: `BLOCKS.<group>.<key>.exercises` →
  `BLOCKS.<group>?.<key>?.exercises || []`.
- `SLOT_META[slot].label` → `(SLOT_META[slot] || {}).label || slot`.
- `SLOT_OPTIONS[slot]` → `(SLOT_OPTIONS[slot] || [])`.

Do **not** convert these three to `programView`. That is later work, one client
at a time, when each programme next changes.

Ville's `config.jsx` keeps its `ProgramView` too, unchanged, as his offline
fallback.

---

## 3. Acceptance criteria

Everything below must pass before you commit.

### 3a. Extend `verify-program-delivery.mjs`

Add a `STRUCTURE` block asserting:
- `src/core/program-view.jsx` exists and exports `GeneratedProgramView`
- it imports `blocksFor`, `slotMetaFor`, `slotOptionsFor`, `mobilityFor` from
  `./program-schema.js`
- it contains no hex colour literal (`/#[0-9a-fA-F]{6}/` must not match)
- `app.jsx` imports `GeneratedProgramView`
- `app.jsx` still imports `ProgramView` from `./config.jsx` (the fallback)
- `app.jsx` gates on `PROGRAM.programView`
- in the three defensive repos, `config.jsx` contains no unguarded
  `BLOCKS.<word>[` or `BLOCKS.<word>.<word>.exercises` without `?.`

The script must still pass in all four repos and must not name a client — it
discovers the repo's own `program-*.js`. Keep that property.

### 3b. New render test `test-program-view.mjs` at the repo root

Render with `react-dom/server` and stub components, so it runs under plain node:

```js
import { renderToStaticMarkup } from "react-dom/server";
```

Stub `Section` as a div rendering title, subtitle and children; stub
`ExerciseList` as a div rendering each exercise's `name`. Build a `theme` object
with `ACCENT`, `ACCENT_2`, `TEXT_MUTED`, `TEXT_SECONDARY`, `FONT_MONO` and a
`CATS` map.

Required cases:
1. Ville's real `programView` (the JSON is in `phase6/ville-programview.json`,
   shipped alongside this brief) renders **12 cards** without throwing.
2. Every prose string in that JSON appears in the output — no text silently lost.
3. The three strength cards show the block labels `A — Legs`, `B — Full body`,
   `C — Upper + core`, proving `titleFrom` resolves.
4. The week table contains all seven day names and at least one
   `Strength — ` line.
5. `excludeTyped: true` drops entries with a `type` field: add a fixture block
   with one real exercise and one `{ type: "note" }` and assert only the real one
   renders.
6. **A renamed block does not throw.** Delete `blocks.strength.a`, render again,
   assert no exception and that the remaining cards still render.
7. An unknown `cat:` token does not throw and does not emit `undefined` as a
   colour value.
8. A card whose `titleFrom` block is missing and which has no `title` is skipped,
   not rendered empty.

### 3c. Build

In each of the four repos, on the branch:

```
npm install
node verify-program-delivery.mjs
node test-program-view.mjs
npm run build
```

`npm install` is required — the clone has no `node_modules`. The VM can reach the
npm registry. Versions are pinned in `package.json`; do not change them, and do
not add dependencies. `react-dom` is already a dependency, which is what the
render test needs.

Then confirm `src/app.jsx` and `src/core/program-view.jsx` are byte-identical
across all four repos and report the two hashes.

### 3d. Version

Bump `APP_VERSION` to `5.4.0-beta1` in all four `src/core/program-<client>.js`.

---

## 4. What NOT to do

- Do not write Ville's `programView` into the database. John applies that from
  the chat session **after** this code is deployed, because the currently
  deployed validator rejects the new shape and would make his app fall back to
  the compiled programme.
- Do not modify `src/core/program-schema.js`. A new version ships with this
  work and is included in `phase6/`; copy it in unchanged.
- Do not convert Henna's, Joonatan's or Juha's `ProgramView` to data.
- Do not touch `STORAGE_PREFIX`, `bundle.js` or `styles.css` by hand.
- Do not merge to `main` or push to `main`. Report the branches and the hashes;
  John reviews the diff and merges.
- Do not change `package.json`, pinned versions, or add dependencies.
- Do not delete or edit `phase6/ville-programview.json`.

## 5. Report back

- The branch pushed in each of the four repos, and the commit on each
- `src/app.jsx` and `src/core/program-view.jsx` hashes, confirmed identical ×4
- Verify and render test results per repo
- Anything in this brief that turned out to be wrong about the code — say so
  plainly rather than working around it
