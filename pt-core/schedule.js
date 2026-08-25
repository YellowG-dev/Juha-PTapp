import { getISOWeek, dateKey, isInBodyDue, isVo2maxDue } from "./dates.js";
import {
  SCHEDULE,
  STRENGTH,
  HARD_INTERVAL,
  ZONE2,
  MOBILITY,
  NUTRITION_TARGETS,
} from "./program.js";

// Extracted verbatim from pt-program-live.jsx v3.1 — no logic changes.
// Pure JavaScript: no React, no DOM, no browser APIs. Safe to import from
// the web app, a React Native app, or a Node script.

function withBpm(presc, pctMin, pctMax, hrMax) {
  if (pctMin == null || !hrMax) return presc;
  const bMin = Math.round((hrMax * pctMin) / 100);
  const bMax = Math.round((hrMax * pctMax) / 100);
  return `${presc} (${bMin}–${bMax} bpm)`;
}

function resolveSchedule(date, weekOverride, overrides) {
  const auto = getISOWeek(date) % 2 === 0 ? "A" : "B";
  const wt = weekOverride === "auto" ? auto : weekOverride;
  const key = dateKey(date);
  const base = SCHEDULE[wt][date.getDay()] || {};
  const ov = (overrides && overrides[key]) || {};
  const strengthMoved = Object.prototype.hasOwnProperty.call(ov, "strength");
  const cardioMoved = Object.prototype.hasOwnProperty.call(ov, "cardio");
  const strength = strengthMoved ? ov.strength || null : base.strength || null;
  const cardio = cardioMoved ? ov.cardio || null : base.cardio || null;
  const note = ov.note !== undefined ? ov.note : base.note || null;
  const activities = Array.isArray(ov.activities) ? ov.activities : [];
  const testInBodyMoved = Object.prototype.hasOwnProperty.call(ov, "testInBody");
  const testVo2maxMoved = Object.prototype.hasOwnProperty.call(ov, "testVo2max");
  const dueInBody = testInBodyMoved ? Boolean(ov.testInBody) : isInBodyDue(date);
  const dueVo2max = testVo2maxMoved ? Boolean(ov.testVo2max) : isVo2maxDue(date);
  const deloadMoved = Object.prototype.hasOwnProperty.call(ov, "deload");
  const deload = deloadMoved ? Boolean(ov.deload) : null; // null = not explicitly set
  return {
    weekType: wt,
    strength,
    cardio,
    note,
    strengthMoved,
    cardioMoved,
    activities,
    dueInBody,
    dueVo2max,
    dueInBodyMoved: testInBodyMoved,
    dueVo2maxMoved: testVo2maxMoved,
    testMoved: testInBodyMoved || testVo2maxMoved,
    deload,
    deloadMoved,
    moved: strengthMoved || cardioMoved || activities.length > 0 || testInBodyMoved || testVo2maxMoved || deloadMoved,
  };
}

function buildSections(today, weekType, deload, overrides, hasLoggedTest, hrMax) {
  const info = resolveSchedule(today, weekType, overrides);
  const sched = { strength: info.strength, cardio: info.cardio, note: info.note };
  const hasActivities = info.activities.length > 0;
  const isTrainingDay = Boolean(sched.strength || sched.cardio || hasActivities);
  const sections = [];

  const dueBoth = info.dueInBody && info.dueVo2max;
  const testDue = info.dueInBody || info.dueVo2max;
  const dueLabel = dueBoth
    ? "Due today — InBody + VO2max"
    : info.dueInBody
    ? "Due today — InBody scan"
    : info.dueVo2max
    ? "Due today — VO2max test"
    : null;

  if (!sched.strength && !sched.cardio && !hasActivities) {
    sections.push({
      key: "rest",
      cat: "check",
      title: "Rest Day",
      subtitle: sched.note || "No strength or cardio scheduled today — mobility and nutrition still apply",
      tasks: [],
    });
  }

  if (sched.strength) {
    const s = STRENGTH[sched.strength];
    sections.push({
      key: "strength",
      cat: "strength",
      title: s.label,
      subtitle: deload ? "Deload week — cut sets ~40%, same intensity" : null,
      tasks: s.exercises.map((e) => ({ id: e.id, name: e.name, presc: `${e.presc} · RPE ${e.rpe}`, video: e.video })),
    });
  }

  if (sched.cardio) {
    const effective = deload && sched.cardio === "hard" ? "zone2" : sched.cardio;
    const list = effective === "hard" ? HARD_INTERVAL : ZONE2;
    const isTennisDay = today.getDay() === 1 && effective === "zone2";
    sections.push({
      key: "cardio",
      cat: "cardio",
      title: effective === "hard" ? "Norwegian 4×4 — Hard Intervals" : isTennisDay ? "Tennis Coaching" : "Zone 2 — Steady State",
      subtitle: deload && sched.cardio === "hard" ? "Deload week — swapped from hard intervals to Zone 2" : null,
      tasks: [
        ...list.map((t) => ({
          id: t.id,
          name: isTennisDay ? "Tennis coaching session" : t.name,
          presc: withBpm(t.presc, t.pctMin, t.pctMax, hrMax),
        })),
        {
          id: "cv-hr",
          type: "cardioHR",
          name: "Actual Heart Rate",
          presc: "From your watch — peak + average",
          targetPctMax: effective === "hard" ? 95 : 70,
        },
      ],
    });
  }

  if (hasActivities) {
    sections.push({
      key: "activity",
      cat: "activity",
      title: "Extra Activity",
      subtitle: "Added from Calendar",
      tasks: info.activities.map((a) => ({ id: `act-${a.id}`, name: a.name, presc: "Logged activity" })),
    });
  }

  sections.push({
    key: "mobility",
    cat: "mobility",
    title: "Daily Mobility Flow",
    subtitle: "~10 min · evening default, morning is fine too",
    tasks: MOBILITY.map((m) => ({ id: m.id, name: m.name, presc: `${m.presc} · ${m.tool}`, video: m.video })),
  });

  const nut = isTrainingDay ? NUTRITION_TARGETS.training : NUTRITION_TARGETS.rest;

  sections.push({
    key: "nutrition",
    cat: "nutrition",
    title: `Nutrition — ${isTrainingDay ? "Training day" : "Rest day"}`,
    subtitle: null,
    tasks: [
      { id: "nut-cal", type: "macro", field: "cal", name: "Calories", target: nut.cal, direction: "under", unit: "kcal", presc: `< ${nut.cal} kcal` },
      { id: "nut-pro", type: "macro", field: "protein", name: "Protein", target: nut.protein, direction: "over", unit: "g", presc: `> ${nut.protein} g` },
      { id: "nut-fat", type: "macro", field: "fat", name: "Fat", target: nut.fat, direction: "under", unit: "g", presc: `< ${nut.fat} g` },
      { id: "nut-carb", type: "macro", field: "carbs", name: "Carbs", target: nut.carbs, direction: "under", unit: "g", presc: `< ${nut.carbs} g` },
    ],
  });

  sections.push({
    key: "check",
    cat: "check",
    title: "Daily Check",
    subtitle: null,
    tasks: [
      { id: "chk-weigh", type: "weight", name: "Morning weigh-in", presc: "7-day rolling avg" },
      { id: "chk-walk", name: "Walk 10,000 steps", presc: "Daily step target" },
      { id: "chk-water", name: "Drink 3 L water", presc: "Daily hydration target" },
      { id: "chk-knee", type: "knee", name: "Knee symptoms", presc: "None / Mild / Moderate / Severe" },
      { id: "chk-notes", type: "notes", name: "Notes", presc: "Optional — how the day felt" },
    ],
  });

  if (testDue || hasLoggedTest) {
    sections.push({
      key: "testing",
      cat: "testing",
      title: "Testing & Metrics",
      subtitle: dueLabel || "Already logged for this day",
      tasks: [
        { id: "test-inbody", type: "inbody", name: "InBody Scan", presc: "SMM, body fat %, trunk fat %, ECW" },
        { id: "test-vo2max", type: "vo2max", name: "VO2max Test", presc: "mL/kg/min" },
      ],
    });
  }

  return sections;
}

export { withBpm, resolveSchedule, buildSections };
