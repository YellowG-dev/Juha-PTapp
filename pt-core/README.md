# pt-core

The platform-neutral heart of the PT app, extracted from `pt-program-live.jsx` v3.1.

No React. No DOM. No browser APIs. Runs unchanged in a web app, a React Native
app, or plain Node.

## Why this exists

The v3.1 app is one 3,864-line file where the training logic and the user
interface are welded together. React Native cannot use the interface half —
it has no `<div>`, no Tailwind, no Recharts. It *can* use the logic half
verbatim.

Splitting them means the program logic exists once, not twice. Change a
prescription or the deload wave here, and the web app and the native app both
get it. Leave it welded, and the two copies drift within a month.

## Files

| File | Contents | Lines |
|---|---|---|
| `program.js` | `STRENGTH`, `SCHEDULE`, `MOBILITY`, `HARD_INTERVAL`, `ZONE2`, `NUTRITION_TARGETS`, options lists, version + changelog | ~175 |
| `dates.js` | ISO weeks, `dateKey`, `daysBetween`, month matrix, cycle/week starts, InBody + VO2max due dates, deload wave | ~100 |
| `schedule.js` | `resolveSchedule` (base schedule + per-day overrides), `buildSections` (a day's full task list), `withBpm` | ~190 |
| `history.js` | `buildHistoryRows`, `computeWeightSeries` (7-day rolling avg), `computeStreak`, `buildHeatmapCells` | ~145 |
| `storage.js` | Storage adapter — the only rewritten file, see below | ~135 |
| `index.js` | Barrel export | 6 |

## What was changed, and only this

Everything was sliced out mechanically rather than retyped, so the logic is
byte-identical to v3.1. Two deliberate exceptions:

**1. `CATS` → `CATEGORIES`.** The original carried an `Icon:` field holding a
`lucide-react` component. That is a React dependency, and React Native needs
`lucide-react-native` instead — so it cannot live in a neutral module. Labels
and colours stayed; the UI layer now maps each key to its own icon.

**2. `loadJSON` / `saveJSON` → `createStore(adapter)`.** These called
`localStorage` directly, which does not exist in React Native. Inverted: the
core defines the store's shape, the platform supplies the adapter. Both
methods were already `async` in v3.1, so nothing calling them has to change.

```js
// Web today — behaviourally identical to v3.1
const store = createStore(localStorageAdapter(), "ptAppParent_");

// React Native later — same core, different adapter
const store = createStore(asyncStorageAdapter(AsyncStorage), "ptAppParent_");

// Supabase later still — same core again
const store = createStore(supabaseAdapter(client, userId), "");
```

## Verifying it

`smoke.mjs` runs 18 checks against the extracted logic: date maths, Monday
resolving to tennis/Zone 2, Tuesday to Upper, overrides beating the base
schedule, 27 tasks built for a strength day, HR zone conversion, the 4-week
deload wave, the history pipeline and 7-day rolling average, and a storage
round-trip through the memory adapter.

```bash
node smoke.mjs
```

All 18 pass as of extraction.

**These are not a full regression suite.** They prove the extraction did not
break the logic; they do not prove v3.1 was correct in the first place. Any bug
in v3.1 was faithfully carried across.

## Using it from the existing web app

`pt-program-live.jsx` keeps its UI and loses its first ~575 lines:

```js
import {
  STRENGTH, SCHEDULE, MOBILITY, NUTRITION_TARGETS, CATEGORIES,
  resolveSchedule, buildSections, buildHistoryRows,
  computeWeightSeries, computeStreak, buildHeatmapCells,
  dateKey, daysBetween, getISOWeek, getMonthMatrix, isDeloadWeek,
  createStore, localStorageAdapter,
} from "./core/index.js";

const store = createStore(localStorageAdapter(), "ptAppParent_");
```

Then re-add the icon map that `CATEGORIES` no longer carries:

```js
import { Dumbbell, Activity, Wind, Utensils, Scale, Footprints, Gauge } from "lucide-react";
const ICONS = {
  strength: Dumbbell, cardio: Activity, mobility: Wind,
  nutrition: Utensils, check: Scale, activity: Footprints, testing: Gauge,
};
```

The esbuild command does not change — it follows the imports.

## Also worth doing

Commit `pt-program-live.jsx` itself to the repo. Right now the repo holds only
build output (`bundle.js`, `index.html`, `styles.css`, manifest), and the only
copy of the source is on one laptop. `bundle.js` is minified — recovering the
source from it is reverse engineering, not restoring a backup.
