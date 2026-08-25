import * as core from "./index.js";

const fail = [];
const ok = (label, cond, extra="") => { console.log((cond?"PASS":"FAIL")+"  "+label+(extra?"  "+extra:"")); if(!cond) fail.push(label); };

// 1. Everything exported and callable
const expected = ["STRENGTH","SCHEDULE","MOBILITY","NUTRITION_TARGETS","CATEGORIES","APP_VERSION",
  "getISOWeek","dateKey","daysBetween","getMonthMatrix","getCycleStart","getWeekMonday",
  "isInBodyDue","isVo2maxDue","isDeloadWeek","withBpm","resolveSchedule","buildSections",
  "buildHistoryRows","computeWeightSeries","computeStreak","buildHeatmapCells","createStore"];
ok("all symbols exported", expected.every(n => core[n] !== undefined),
   expected.filter(n=>core[n]===undefined).join(",") || "");

// 2. Date maths
const mon = new Date(2026, 7, 24); // Mon 24 Aug 2026
ok("dateKey", core.dateKey(mon) === "2026-08-24", core.dateKey(mon));
ok("daysBetween", core.daysBetween(new Date(2026,7,24), new Date(2026,7,31)) === 7);
ok("getWeekMonday lands on Monday", core.getWeekMonday(new Date(2026,7,27)).getDay() === 1);

// 3. Schedule — Monday must be Tennis/Zone 2 per the v3.1 program
const info = core.resolveSchedule(mon, "auto", {});
ok("Mon = cardio, no strength", info.cardio !== null && info.strength === null,
   JSON.stringify({s:info.strength,c:info.cardio}));
const tue = core.resolveSchedule(new Date(2026,7,25), "auto", {});
ok("Tue = upper strength", tue.strength === "upper", String(tue.strength));

// 4. Overrides still win over the base schedule
const ov = { "2026-08-25": { strength: "lower" } };
ok("override applied", core.resolveSchedule(new Date(2026,7,25), "auto", ov).strength === "lower");

// 5. buildSections produces real task lists
const secs = core.buildSections(new Date(2026,7,25), "A", false, {}, false, 175);
const keys = secs.map(s => s.key);
ok("sections built", keys.includes("strength") && keys.includes("mobility") && keys.includes("nutrition"), keys.join(","));
ok("tasks present", secs.reduce((n,s)=>n+s.tasks.length,0) > 15,
   String(secs.reduce((n,s)=>n+s.tasks.length,0))+" tasks");

// 6. HR maths
ok("withBpm", core.withBpm("4 min @ 90–95% HRmax", 90, 95, 180) === "4 min @ 90–95% HRmax (162–171 bpm)",
   core.withBpm("4 min @ 90–95% HRmax", 90, 95, 180));

// 7. Deload wave: 4th week from anchor
ok("deload week 4 true", core.isDeloadWeek(new Date(2026,7,17)) === true);
ok("deload week 1 false", core.isDeloadWeek(new Date(2026,6,27)) === false);

// 8. History pipeline on a synthetic log
const log = {
  "2026-08-24": { done:{"cv-z2":true}, weight:88.2, weekType:"A", deload:false, nutrition:{cal:2800} },
  "2026-08-25": { done:{"up-1":true,"up-2":true}, weight:88.0, weekType:"A", deload:false,
                  loads:{"up-1":[{w:30,r:8},{w:30,r:8}]} },
};
const rows = core.buildHistoryRows(log, {});
ok("history rows", rows.length === 2 && rows[0].total > 0, JSON.stringify(rows.map(r=>[r.date,r.doneCount,r.total])));
const ws = core.computeWeightSeries(rows);
ok("weight series + 7d avg", ws.length === 2 && ws[1].avg7 === 88.1, JSON.stringify(ws.map(w=>w.avg7)));
ok("heatmap 12 weeks", core.buildHeatmapCells(rows,12).length >= 12);

// 9. Storage adapter round-trip (memory = stand-in for RN AsyncStorage)
const store = core.createStore(core.memoryAdapter(), "ptAppParent_");
await store.saveJSON("log", log);
const back = await store.loadJSON("log", {});
ok("store round-trip", JSON.stringify(back) === JSON.stringify(log));
const dump = await store.exportAll();
ok("exportAll shape", "settings" in dump && "log" in dump && "overrides" in dump);
ok("loadJSON fallback", (await store.loadJSON("nope", "fb")) === "fb");

console.log(fail.length ? "\n"+fail.length+" FAILED" : "\nAll checks passed.");
process.exit(fail.length ? 1 : 0);
