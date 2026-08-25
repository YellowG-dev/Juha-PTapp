import { getISOWeek, dateKey } from "./dates.js";
import { buildSections, resolveSchedule } from "./schedule.js";

// Extracted verbatim from pt-program-live.jsx v3.1 — no logic changes.
// Pure JavaScript: no React, no DOM, no browser APIs. Safe to import from
// the web app, a React Native app, or a Node script.


// Turns the raw { 'YYYY-MM-DD': { done, weekType, deload } } log into one row
// per logged day, reconstructing that day's actual task list so percentages
// are accurate even if today's settings have since changed.
function buildHistoryRows(log, overrides) {
  return Object.keys(log)
    .sort()
    .map((dstr) => {
      const [y, m, d] = dstr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const rec = log[dstr] || {};
      const weekType = rec.weekType || (getISOWeek(dateObj) % 2 === 0 ? "A" : "B");
      const deload = Boolean(rec.deload);
      const doneMap = rec.done || {};
      const hasLoggedTest = (Boolean(rec.inbody) && Object.values(rec.inbody).some((v) => v != null)) || typeof rec.vo2max === "number";
      const sections = buildSections(dateObj, weekType, deload, overrides, hasLoggedTest);

      const byCat = {};
      let total = 0;
      let doneCount = 0;
      sections.forEach((sec) => {
        if (!sec.tasks.length) return;
        if (!byCat[sec.cat]) byCat[sec.cat] = { total: 0, done: 0 };
        sec.tasks.forEach((t) => {
          if (t.type === "notes") return; // journal field, never counted
          byCat[sec.cat].total += 1;
          total += 1;
          let isDone;
          if (t.type === "weight") isDone = typeof rec.weight === "number";
          else if (t.type === "knee") isDone = typeof rec.knee === "string";
          else if (t.type === "inbody") isDone = Boolean(rec.inbody) && Object.values(rec.inbody).some((v) => v != null);
          else if (t.type === "vo2max") isDone = typeof rec.vo2max === "number";
          else if (t.type === "macro") isDone = typeof rec.nutrition?.[t.field] === "number";
          else if (t.type === "cardioHR") isDone = Boolean(rec.cardioHR) && (rec.cardioHR.peak != null || rec.cardioHR.avg != null);
          else isDone = Boolean(doneMap[t.id]) || Boolean(rec.subs?.[t.id]?.name);
          if (isDone) {
            byCat[sec.cat].done += 1;
            doneCount += 1;
          }
        });
      });

      const info = resolveSchedule(dateObj, weekType, overrides);
      const isTrainingDay = Boolean(info.strength || info.cardio || info.activities.length > 0);

      return {
        date: dstr,
        dateObj,
        total,
        doneCount,
        pct: total ? doneCount / total : 0,
        byCat,
        weight: typeof rec.weight === "number" ? rec.weight : null,
        nutrition: rec.nutrition || null,
        isTrainingDay,
        walkHit: Boolean(doneMap["chk-walk"]),
      };
    });
}

// Finds the Mon–Sun 14-day A/B cycle containing `date` — the even ISO week

function computeWeightSeries(rows) {
  const byDate = {};
  rows.forEach((r) => {
    if (r.weight != null) byDate[r.date] = r.weight;
  });
  return rows
    .filter((r) => r.weight != null)
    .map((r) => {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(r.dateObj);
        d.setDate(d.getDate() - i);
        const w = byDate[dateKey(d)];
        if (w != null) {
          sum += w;
          count += 1;
        }
      }
      return {
        date: r.date,
        label: r.dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        weight: r.weight,
        avg7: count ? Math.round((sum / count) * 10) / 10 : null,
      };
    });
}

function computeStreak(rows, threshold = 0.8) {
  if (!rows.length) return 0;
  const byDate = {};
  rows.forEach((r) => (byDate[r.date] = r));
  const cursor = new Date(rows[rows.length - 1].dateObj);
  let streak = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = dateKey(cursor);
    const r = byDate[key];
    if (r && r.pct >= threshold) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

function buildHeatmapCells(rows, weeksBack = 12) {
  const byDate = {};
  rows.forEach((r) => (byDate[r.date] = r));

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (weeksBack * 7 - 1));
  start.setDate(start.getDate() - start.getDay()); // snap back to Sunday

  const cells = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = dateKey(cursor);
    cells.push({ date: key, dow: cursor.getDay(), pct: byDate[key] ? byDate[key].pct : null });
    cursor.setDate(cursor.getDate() + 1);
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export { buildHistoryRows, computeWeightSeries, computeStreak, buildHeatmapCells };
