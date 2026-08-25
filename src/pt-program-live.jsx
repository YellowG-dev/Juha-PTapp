import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Dumbbell,
  Activity,
  Wind,
  Utensils,
  Scale,
  Settings2,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  CalendarDays,
  Footprints,
  X,
  Gauge,
  Repeat,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/* ----------------------------- Program data ----------------------------- */

const APP_VERSION = "3.1";
const CHANGELOG = [
  {
    version: "3.1",
    date: "18 Aug 2026",
    notes:
      "Fixed Calendar not reflecting the deload cardio swap. Prefilled set weights/reps from last session. Per-week deload toggle moved to Calendar (the \"D\" button). New weekly schedule: Tennis Monday (counts as Zone 2), 3 strength + 2 hard interval + 2 Zone-2-equivalent sessions, one rest day. Monday's steady-state session now displays as \"Tennis Coaching\" rather than generic Zone 2, distinguishing it from Saturday's Zone 2. Version tracking added.",
  },
  {
    version: "3.0",
    date: "15 Aug 2026",
    notes:
      "Actual heart rate logging (peak + average) per cardio session. History tab: cycle rollup (this vs. last 14-day cycle), symptom-pattern correlation, calorie/step/max-weight trend charts. Deload-week reminder system. Exercise notes carried to next session.",
  },
];

const STRENGTH = {
  upper: {
    label: "Upper — Push + Pull",
    exercises: [
      { id: "up-1", name: "Incline DB press", presc: "4×6–10", rpe: "7–9", video: "https://www.youtube.com/watch?v=hChjZQhX1Ls" },
      { id: "up-2", name: "Pull-up / lat pulldown", presc: "4×6–10", rpe: "7–9", video: "https://www.youtube.com/watch?v=vw5Xmu5CIew" },
      { id: "up-3", name: "Seated DB overhead press", presc: "3×8–12", rpe: "7–8", video: "https://www.youtube.com/watch?v=fuQpuu--bMI" },
      { id: "up-4", name: "Chest-supported / cable row", presc: "3×10–15", rpe: "7–8", video: "https://www.youtube.com/watch?v=vmX58YYK3-8" },
      { id: "up-5", name: "Lateral raise", presc: "3×12–15", rpe: "8", video: "https://www.youtube.com/watch?v=nnH63icHYXY" },
      { id: "up-8", name: "Weighted crunch or hanging knee raise", presc: "3×12–15", rpe: "7–8", video: "https://www.youtube.com/watch?v=Pxkw6dUt_Ok" },
      { id: "up-9", name: "Weighted side plank hip lift", presc: "3×12–15/side", rpe: "7", video: "https://www.youtube.com/watch?v=V4A0wIh5HNk" },
      { id: "up-6", name: "Overhead triceps extension", presc: "3×10–15", rpe: "8", video: "https://www.youtube.com/watch?v=O7e8j8K3cJo" },
      { id: "up-7", name: "Biceps curl", presc: "3×10–15", rpe: "8", video: "https://www.youtube.com/watch?v=6DeLZ6cbgWQ" },
    ],
  },
  lower: {
    label: "Lower — Knee-safe",
    exercises: [
      { id: "lo-1", name: "Bulgarian split squat", presc: "4×8–12/leg", rpe: "7–9", video: "https://www.youtube.com/watch?v=hiLF_pF3EJM" },
      { id: "lo-2", name: "Barbell hip thrust", presc: "4×8–12", rpe: "7–9", video: "https://www.youtube.com/watch?v=S_uZP4UH6J0" },
      { id: "lo-3", name: "Single-leg RDL (DB)", presc: "3×8–12/leg", rpe: "7–8", video: "https://www.youtube.com/watch?v=18CzQrq-Z7I" },
      { id: "lo-10", name: "Machine single-leg extension", presc: "3×10–15/leg", rpe: "7–8", video: "https://www.youtube.com/watch?v=tTbJBUKnWU8" },
      { id: "lo-5", name: "Machine leg curl", presc: "3×10–15", rpe: "8", video: "https://www.youtube.com/watch?v=hqI59xXChFk" },
      { id: "lo-8", name: "Weighted crunch or hanging knee raise", presc: "3×12–15", rpe: "7–8", video: "https://www.youtube.com/watch?v=Pxkw6dUt_Ok" },
      { id: "lo-9", name: "Weighted side plank hip lift", presc: "3×12–15/side", rpe: "7", video: "https://www.youtube.com/watch?v=V4A0wIh5HNk" },
      { id: "lo-11", name: "Calf raise — standing or seated, alternate", presc: "3–4×10–15", rpe: "8", video: "https://www.youtube.com/watch?v=SVtg-1loH4c" },
    ],
  },
  full: {
    label: "Full Body — Lagging parts",
    exercises: [
      { id: "fb-1", name: "Incline DB press", presc: "3×8–12", rpe: "7–8", video: "https://www.youtube.com/watch?v=hChjZQhX1Ls" },
      { id: "fb-2", name: "Dip / DB pullover", presc: "3×8–12", rpe: "7–8", video: "https://www.youtube.com/watch?v=8UugSoVJLag" },
      { id: "fb-3", name: "Face pull", presc: "3×15–20", rpe: "7", video: "https://www.youtube.com/watch?v=0Po47vvj9g4" },
      { id: "fb-4", name: "Hip thrust / single-leg press", presc: "3×10–15", rpe: "7–8", video: "https://www.youtube.com/watch?v=S_uZP4UH6J0" },
      { id: "fb-5", name: "Weighted crunch or hanging knee raise", presc: "5×12–15", rpe: "8", video: "https://www.youtube.com/watch?v=Pxkw6dUt_Ok" },
      { id: "fb-6", name: "Biceps curl", presc: "2×12–15", rpe: "8", video: "https://www.youtube.com/watch?v=6DeLZ6cbgWQ" },
      { id: "fb-7", name: "Overhead triceps extension", presc: "2×12–15", rpe: "8", video: "https://www.youtube.com/watch?v=O7e8j8K3cJo" },
      { id: "fb-8", name: "Calf raise — standing or seated, alternate", presc: "3–4×10–15", rpe: "8", video: "https://www.youtube.com/watch?v=SVtg-1loH4c" },
    ],
  },
  bodyweight: {
    label: "No-Gym — Bodyweight + Band",
    exercises: [
      { id: "bw-1", name: "Push-up", presc: "3×12–20", rpe: "7–8", video: "https://www.youtube.com/watch?v=WDIpL0pjun0" },
      { id: "bw-2", name: "Pike push-up", presc: "3×8–12", rpe: "7–8", video: "https://www.youtube.com/watch?v=XckEEwa1BPI" },
      { id: "bw-3", name: "Band row", presc: "3×12–15", rpe: "7–8", video: "https://www.youtube.com/watch?v=ysAjxPSFC7M" },
      { id: "bw-4", name: "Band pull-apart", presc: "3×15–20", rpe: "7", video: "https://www.youtube.com/watch?v=WqdNDTTe-9g" },
      { id: "bw-5", name: "Bodyweight Bulgarian split squat", presc: "3×12–15/leg", rpe: "7–8", video: "https://www.youtube.com/watch?v=hiLF_pF3EJM" },
      { id: "bw-6", name: "Single-leg RDL (bodyweight)", presc: "3×10–15/leg", rpe: "7–8", video: "https://www.youtube.com/watch?v=18CzQrq-Z7I" },
      { id: "bw-7", name: "Single-leg hip thrust", presc: "3×12–15/leg", rpe: "7–8", video: "https://www.youtube.com/watch?v=qCObDXTe4KY" },
      { id: "bw-8", name: "Standing calf raise (bodyweight)", presc: "3×15–20", rpe: "8", video: "https://www.youtube.com/watch?v=SVtg-1loH4c" },
      { id: "bw-9", name: "Crunch or hanging knee raise", presc: "3×15–20", rpe: "7–8", video: "https://www.youtube.com/watch?v=p9hhX_Sx5v0" },
      { id: "bw-10", name: "Side plank hip lift", presc: "3×12–15/side", rpe: "7", video: "https://www.youtube.com/watch?v=V4A0wIh5HNk" },
    ],
  },
};

const HARD_INTERVAL = [
  { id: "cv-warm", name: "Warm-up", presc: "10 min easy" },
  { id: "cv-i1", name: "Interval 1", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95 },
  { id: "cv-r1", name: "Recovery 1", presc: "3 min @ 50–60% HRmax", pctMin: 50, pctMax: 60 },
  { id: "cv-i2", name: "Interval 2", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95 },
  { id: "cv-r2", name: "Recovery 2", presc: "3 min @ 50–60% HRmax", pctMin: 50, pctMax: 60 },
  { id: "cv-i3", name: "Interval 3", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95 },
  { id: "cv-r3", name: "Recovery 3", presc: "3 min @ 50–60% HRmax", pctMin: 50, pctMax: 60 },
  { id: "cv-i4", name: "Interval 4", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95 },
  { id: "cv-cool", name: "Cool-down", presc: "5–10 min easy" },
];

const ZONE2 = [{ id: "cv-z2", name: "Zone 2 continuous", presc: "45–60 min @ 60–70% HRmax", pctMin: 60, pctMax: 70 }];

function withBpm(presc, pctMin, pctMax, hrMax) {
  if (pctMin == null || !hrMax) return presc;
  const bMin = Math.round((hrMax * pctMin) / 100);
  const bMax = Math.round((hrMax * pctMax) / 100);
  return `${presc} (${bMin}–${bMax} bpm)`;
}

const MOBILITY = [
  { id: "mob-1", name: "Cat–Cow → thoracic rotation", presc: "60s", tool: "Bodyweight", video: "https://www.youtube.com/watch?v=YPTKZy_kKt8" },
  { id: "mob-2", name: "Thoracic extension over roller", presc: "60s", tool: "Foam roller", video: "https://www.youtube.com/watch?v=9Y11Kc0E0og" },
  { id: "mob-3", name: "Lat sweep", presc: "60s", tool: "Foam roller", video: "https://www.youtube.com/watch?v=NOiM2TSjoMM" },
  { id: "mob-4", name: "Pec minor / anterior shoulder release", presc: "60s (30/side)", tool: "Ball", video: "https://www.youtube.com/watch?v=Vj83BnZpTwk" },
  { id: "mob-5", name: "Shoulder CARs", presc: "45s", tool: "Bodyweight", video: "https://www.youtube.com/watch?v=Ag1yVYbPXeg" },
  { id: "mob-6", name: "Half-kneeling hip flexor + reach", presc: "90s (45/side)", tool: "Mat/pad", video: "https://www.youtube.com/watch?v=KyoK4Rf6_bE" },
  { id: "mob-7", name: "Quad roll", presc: "60s (30/side)", tool: "Foam roller", video: "https://www.youtube.com/watch?v=cv57kA6rktc" },
  { id: "mob-8", name: "Glute / piriformis release", presc: "90s (45/side)", tool: "Ball", video: "https://www.youtube.com/watch?v=7x6EFeWiyL4" },
  { id: "mob-9", name: "Ankle dorsiflexion rock + calf roll", presc: "75s", tool: "Wall + roller", video: "https://www.youtube.com/watch?v=Y1IZXkdPPdw" },
];

// day-of-week keys: 0 = Sunday ... 6 = Saturday
// Week A and B are intentionally identical — this rhythm holds every week
// regardless of the A/B cycle. Real-world exceptions (travel, kid weeks)
// get handled per-day via Calendar overrides, not by diverging the templates.
const SCHEDULE = {
  A: {
    1: { strength: null, cardio: "zone2" },
    2: { strength: "upper", cardio: null },
    3: { strength: null, cardio: "hard" },
    4: { strength: "lower", cardio: null },
    5: { strength: null, cardio: null, note: "Rest day" },
    6: { strength: "full", cardio: "zone2" },
    0: { strength: null, cardio: "hard" },
  },
  B: {
    1: { strength: null, cardio: "zone2" },
    2: { strength: "upper", cardio: null },
    3: { strength: null, cardio: "hard" },
    4: { strength: "lower", cardio: null },
    5: { strength: null, cardio: null, note: "Rest day" },
    6: { strength: "full", cardio: "zone2" },
    0: { strength: null, cardio: "hard" },
  },
};

const CATS = {
  strength: { label: "Strength", color: "#E3A23C", Icon: Dumbbell },
  cardio: { label: "Cardio", color: "#4CB6C4", Icon: Activity },
  mobility: { label: "Mobility", color: "#7FB88F", Icon: Wind },
  nutrition: { label: "Nutrition", color: "#C97388", Icon: Utensils },
  check: { label: "Check", color: "#8891A3", Icon: Scale },
  activity: { label: "Activity", color: "#9C8CF0", Icon: Footprints },
  testing: { label: "Testing", color: "#5B9BD5", Icon: Gauge },
};

const STRENGTH_OPTIONS = [
  { value: null, label: "None" },
  { value: "upper", label: "Upper" },
  { value: "lower", label: "Lower" },
  { value: "full", label: "Full Body" },
  { value: "bodyweight", label: "No-Gym" },
];
const CARDIO_OPTIONS = [
  { value: null, label: "None" },
  { value: "hard", label: "Hard Intervals" },
  { value: "zone2", label: "Zone 2" },
];

const NUTRITION_TARGETS = {
  training: { cal: 3000, protein: 180, fat: 90, carbs: 368 },
  rest: { cal: 2700, protein: 180, fat: 90, carbs: 293 },
};

/* ------------------------------ Date helpers ----------------------------- */

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const fdn = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fdn + 3);
  return 1 + Math.round((d - firstThursday) / (7 * 86400000));
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86400000);
}

// Anchored to the Sunday on/after the documented 12 Jun 2026 InBody baseline.
// InBody repeats every 8 weeks, VO2max every 4 — they coincide every other VO2max cycle.
const TEST_ANCHOR = new Date(2026, 5, 14);
function isInBodyDue(date) {
  const diff = daysBetween(TEST_ANCHOR, date);
  return diff >= 0 && diff % 56 === 0;
}
function isVo2maxDue(date) {
  const diff = daysBetween(TEST_ANCHOR, date);
  return diff >= 0 && diff % 28 === 0;
}

// 3-week loading wave + 4th week deload, anchored to Mon 27 Jul 2026 (start of
// active app usage). Returns true for all 7 days of the calculated deload week.
const DELOAD_ANCHOR = new Date(2026, 6, 27);
function isDeloadWeek(date) {
  const dow = (date.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(date);
  monday.setDate(monday.getDate() - dow);
  const diff = daysBetween(DELOAD_ANCHOR, monday);
  if (diff < 0) return false;
  const weeksSince = Math.floor(diff / 7);
  return weeksSince % 4 === 3;
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

function getMonthMatrix(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const weeksNeeded = Math.ceil((startOffset + daysInMonth) / 7);
  const start = new Date(year, month, 1 - startOffset);
  const weeks = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeksNeeded; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/* -------------------------------- Sections -------------------------------- */

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

/* ------------------------------ History / trends --------------------------- */

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
// starts the cycle, the following odd week completes it.
function getCycleStart(date) {
  const isoWeek = getISOWeek(date);
  const isEven = isoWeek % 2 === 0;
  const dow = (date.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(date);
  monday.setDate(monday.getDate() - dow);
  if (!isEven) monday.setDate(monday.getDate() - 7);
  return monday;
}

function getWeekMonday(date) {
  const dow = (date.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(date);
  monday.setDate(monday.getDate() - dow);
  return monday;
}

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

/* --------------------------------- Storage -------------------------------- */
// Uses localStorage (not window.storage — that's Claude-artifact-only and
// doesn't exist outside claude.ai). Keys are prefixed so this app's data
// can never collide with another app's keys if both end up hosted under
// the same GitHub Pages origin (localStorage is scoped per-origin, not
// per-path — two sites on the same username.github.io domain DO share it).
const STORAGE_PREFIX = "ptAppParent_";

async function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw != null) return JSON.parse(raw);
  } catch (e) {
    /* key not found or storage error — use fallback */
  }
  return fallback;
}

async function saveJSON(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    /* best-effort (e.g. storage quota); state still holds locally */
  }
}

// One-time migration: earlier versions of this tool stored each day under its
// own `day:YYYY-MM-DD` key. If today was already checked off under that
// scheme, fold it into the new consolidated log so nothing is lost.
async function migrateLegacyDay(todayKey, weekType, deload) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + `day:${todayKey}`);
    if (raw != null) {
      const legacyDone = JSON.parse(raw);
      return { done: legacyDone, weekType, deload };
    }
  } catch (e) {
    /* nothing to migrate */
  }
  return null;
}

/* ---------------------------------- App ----------------------------------- */

export default function DailyChecklist() {
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ weekOverride: "auto", deload: false, hrMax: null });
  const [log, setLog] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [sectionOpen, setSectionOpen] = useState({});
  const [view, setView] = useState("today");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calSelected, setCalSelected] = useState(today);
  const [weightDraft, setWeightDraft] = useState("");
  const [loadDrafts, setLoadDrafts] = useState({});
  const [overrides, setOverrides] = useState({});
  const [moveSource, setMoveSource] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [activityDraft, setActivityDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [metricDrafts, setMetricDrafts] = useState({ smm: "", pbf: "", trunkFat: "", ecw: "", vo2max: "", peak: "", avg: "" });
  const [nutritionDrafts, setNutritionDrafts] = useState({ cal: "", protein: "", fat: "", carbs: "" });
  const [editingSub, setEditingSub] = useState(null);
  const [subDrafts, setSubDrafts] = useState({});
  const [exNoteDrafts, setExNoteDrafts] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [hrMaxDraft, setHrMaxDraft] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [editingMetric, setEditingMetric] = useState(null);
  const [backupText, setBackupText] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [dayOffset, setDayOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await loadJSON("settings", { weekOverride: "auto", deload: false, hrMax: null });
      let l = await loadJSON("log", {});
      const ov = await loadJSON("scheduleOverrides", {});
      if (cancelled) return;

      if (!l[todayKey]) {
        const wt = s.weekOverride === "auto" ? (getISOWeek(today) % 2 === 0 ? "A" : "B") : s.weekOverride;
        const migrated = await migrateLegacyDay(todayKey, wt, s.deload);
        if (migrated) {
          l = { ...l, [todayKey]: migrated };
          saveJSON("log", l);
        }
      }

      setSettings(s);
      setHrMaxDraft(s.hrMax != null ? String(s.hrMax) : "");
      setLog(l);
      setOverrides(ov);
      setWeightDraft(typeof l[todayKey]?.weight === "number" ? String(l[todayKey].weight) : "");
      const initLoads = {};
      const todayLoads = l[todayKey]?.loads || {};
      Object.keys(todayLoads).forEach((exId) => {
        (todayLoads[exId] || []).forEach((entry, idx) => {
          const w = typeof entry === "number" ? entry : entry?.w;
          const r = typeof entry === "number" ? null : entry?.r;
          if (w != null) initLoads[`${exId}:${idx}:w`] = String(w);
          if (r != null) initLoads[`${exId}:${idx}:r`] = String(r);
        });
      });
      setLoadDrafts(initLoads);
      setNotesDraft(l[todayKey]?.notes || "");
      setMetricDrafts({
        smm: l[todayKey]?.inbody?.smm != null ? String(l[todayKey].inbody.smm) : "",
        pbf: l[todayKey]?.inbody?.pbf != null ? String(l[todayKey].inbody.pbf) : "",
        trunkFat: l[todayKey]?.inbody?.trunkFat != null ? String(l[todayKey].inbody.trunkFat) : "",
        ecw: l[todayKey]?.inbody?.ecw != null ? String(l[todayKey].inbody.ecw) : "",
        vo2max: l[todayKey]?.vo2max != null ? String(l[todayKey].vo2max) : "",
        peak: l[todayKey]?.cardioHR?.peak != null ? String(l[todayKey].cardioHR.peak) : "",
        avg: l[todayKey]?.cardioHR?.avg != null ? String(l[todayKey].cardioHR.avg) : "",
      });
      setNutritionDrafts({
        cal: l[todayKey]?.nutrition?.cal != null ? String(l[todayKey].nutrition.cal) : "",
        protein: l[todayKey]?.nutrition?.protein != null ? String(l[todayKey].nutrition.protein) : "",
        fat: l[todayKey]?.nutrition?.fat != null ? String(l[todayKey].nutrition.fat) : "",
        carbs: l[todayKey]?.nutrition?.carbs != null ? String(l[todayKey].nutrition.carbs) : "",
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [today, todayKey]);

  const viewedDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [today, dayOffset]);
  const viewedDateKey = dateKey(viewedDate);
  const isViewingToday = dayOffset === 0;

  const didInitDrafts = useRef(false);
  useEffect(() => {
    if (!didInitDrafts.current) {
      didInitDrafts.current = true;
      return;
    }
    const rec = log[viewedDateKey];
    setWeightDraft(typeof rec?.weight === "number" ? String(rec.weight) : "");
    const initLoads = {};
    const dayLoads = rec?.loads || {};
    Object.keys(dayLoads).forEach((exId) => {
      (dayLoads[exId] || []).forEach((entry, idx) => {
        const w = typeof entry === "number" ? entry : entry?.w;
        const r = typeof entry === "number" ? null : entry?.r;
        if (w != null) initLoads[`${exId}:${idx}:w`] = String(w);
        if (r != null) initLoads[`${exId}:${idx}:r`] = String(r);
      });
    });
    setLoadDrafts(initLoads);
    setNotesDraft(rec?.notes || "");
    setMetricDrafts({
      smm: rec?.inbody?.smm != null ? String(rec.inbody.smm) : "",
      pbf: rec?.inbody?.pbf != null ? String(rec.inbody.pbf) : "",
      trunkFat: rec?.inbody?.trunkFat != null ? String(rec.inbody.trunkFat) : "",
      ecw: rec?.inbody?.ecw != null ? String(rec.inbody.ecw) : "",
      vo2max: rec?.vo2max != null ? String(rec.vo2max) : "",
      peak: rec?.cardioHR?.peak != null ? String(rec.cardioHR.peak) : "",
      avg: rec?.cardioHR?.avg != null ? String(rec.cardioHR.avg) : "",
    });
    setNutritionDrafts({
      cal: rec?.nutrition?.cal != null ? String(rec.nutrition.cal) : "",
      protein: rec?.nutrition?.protein != null ? String(rec.nutrition.protein) : "",
      fat: rec?.nutrition?.fat != null ? String(rec.nutrition.fat) : "",
      carbs: rec?.nutrition?.carbs != null ? String(rec.nutrition.carbs) : "",
    });
    setEditingSub(null);
    setSubDrafts({});
    setExNoteDrafts({});
    setEditingNote(null);
  }, [viewedDateKey]);

  const viewedRecord = log[viewedDateKey];
  const autoWeekTypeForViewed = getISOWeek(viewedDate) % 2 === 0 ? "A" : "B";
  const computedWeekTypeForViewed = settings.weekOverride === "auto" ? autoWeekTypeForViewed : settings.weekOverride;
  const viewedWeekType = viewedRecord?.weekType || computedWeekTypeForViewed;
  const overrideDeload = overrides[viewedDateKey]?.deload;
  const viewedDeload =
    typeof viewedRecord?.deload === "boolean" ? viewedRecord.deload : typeof overrideDeload === "boolean" ? overrideDeload : false;

  const viewedHasLoggedTest =
    (Boolean(viewedRecord?.inbody) && Object.values(viewedRecord.inbody).some((v) => v != null)) ||
    typeof viewedRecord?.vo2max === "number";

  const sections = useMemo(
    () => buildSections(viewedDate, viewedWeekType, viewedDeload, overrides, viewedHasLoggedTest, settings.hrMax),
    [viewedDate, viewedWeekType, viewedDeload, overrides, viewedHasLoggedTest, settings.hrMax]
  );
  const viewedScheduleInfo = useMemo(
    () => resolveSchedule(viewedDate, settings.weekOverride, overrides),
    [viewedDate, settings.weekOverride, overrides]
  );

  const done = log[viewedDateKey]?.done || {};

  const toggleTask = useCallback(
    (id) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const nextDone = { ...rec.done, [id]: !rec.done[id] };
        const next = { ...prev, [viewedDateKey]: { ...rec, done: nextDone, weekType: viewedWeekType, deload: viewedDeload } };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const markSection = useCallback(
    (taskIds, value) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const nextDone = { ...rec.done };
        taskIds.forEach((id) => (nextDone[id] = value));
        const next = { ...prev, [viewedDateKey]: { ...rec, done: nextDone, weekType: viewedWeekType, deload: viewedDeload } };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const commitWeight = useCallback(() => {
    setLog((prev) => {
      const rec = prev[viewedDateKey] || { done: {} };
      const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload };
      const raw = weightDraft.trim().replace(",", ".");
      const num = parseFloat(raw);
      if (raw !== "" && !isNaN(num)) {
        nextRec.weight = num;
      } else {
        delete nextRec.weight;
      }
      const next = { ...prev, [viewedDateKey]: nextRec };
      saveJSON("log", next);
      return next;
    });
  }, [weightDraft, viewedDateKey, viewedWeekType, viewedDeload]);

  const commitNotes = useCallback(() => {
    setLog((prev) => {
      const rec = prev[viewedDateKey] || { done: {} };
      const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload };
      const trimmed = notesDraft.trim();
      if (trimmed) nextRec.notes = trimmed;
      else delete nextRec.notes;
      const next = { ...prev, [viewedDateKey]: nextRec };
      saveJSON("log", next);
      return next;
    });
  }, [notesDraft, viewedDateKey, viewedWeekType, viewedDeload]);

  const setKnee = useCallback(
    (value) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload, knee: value };
        const next = { ...prev, [viewedDateKey]: nextRec };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const commitMetric = useCallback(
    (field, rawValue) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const raw = rawValue.trim().replace(",", ".");
        const num = parseFloat(raw);
        const val = raw !== "" && !isNaN(num) ? num : null;
        let nextRec;
        if (field === "vo2max") {
          nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload };
          if (val != null) nextRec.vo2max = val;
          else delete nextRec.vo2max;
        } else {
          const nextInbody = { ...(rec.inbody || {}), [field]: val };
          nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload, inbody: nextInbody };
        }
        const next = { ...prev, [viewedDateKey]: nextRec };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const commitNutrition = useCallback(
    (field, rawValue) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const raw = rawValue.trim().replace(",", ".");
        const num = parseFloat(raw);
        const val = raw !== "" && !isNaN(num) ? num : null;
        const nextNutrition = { ...(rec.nutrition || {}), [field]: val };
        const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload, nutrition: nextNutrition };
        const next = { ...prev, [viewedDateKey]: nextRec };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const commitSubstitution = useCallback(
    (exId, rawName, reason) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const nextSubs = { ...(rec.subs || {}) };
        const trimmed = (rawName || "").trim();
        if (trimmed) {
          nextSubs[exId] = { name: trimmed, reason: reason || null };
        } else {
          delete nextSubs[exId];
        }
        const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload, subs: nextSubs };
        const next = { ...prev, [viewedDateKey]: nextRec };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const commitExNote = useCallback(
    (exId, rawNote) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const nextNotes = { ...(rec.exNotes || {}) };
        const trimmed = (rawNote || "").trim();
        if (trimmed) nextNotes[exId] = trimmed;
        else delete nextNotes[exId];
        const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload, exNotes: nextNotes };
        const next = { ...prev, [viewedDateKey]: nextRec };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const commitCardioHR = useCallback(
    (field, rawValue) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const raw = rawValue.trim().replace(",", ".");
        const num = parseInt(raw, 10);
        const val = raw !== "" && !isNaN(num) ? num : null;
        const nextHR = { ...(rec.cardioHR || {}), [field]: val };
        const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload, cardioHR: nextHR };
        const next = { ...prev, [viewedDateKey]: nextRec };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const commitLoad = useCallback(
    (exId, setIdx, field, rawValue) => {
      setLog((prev) => {
        const rec = prev[viewedDateKey] || { done: {} };
        const nextLoads = { ...(rec.loads || {}) };
        const arr = [...(nextLoads[exId] || [])];
        const prevEntry = arr[setIdx];
        const prevW = typeof prevEntry === "number" ? prevEntry : prevEntry?.w ?? null;
        const prevR = typeof prevEntry === "number" ? null : prevEntry?.r ?? null;
        const raw = rawValue.trim().replace(",", ".");
        const num = parseFloat(raw);
        const val = raw !== "" && !isNaN(num) ? num : null;
        arr[setIdx] = { w: field === "w" ? val : prevW, r: field === "r" ? val : prevR };
        nextLoads[exId] = arr;
        const nextRec = { ...rec, weekType: viewedWeekType, deload: viewedDeload, loads: nextLoads };
        const next = { ...prev, [viewedDateKey]: nextRec };
        saveJSON("log", next);
        return next;
      });
    },
    [viewedDateKey, viewedWeekType, viewedDeload]
  );

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSection = useCallback((key, currentlyOpen) => {
    setSectionOpen((prev) => ({ ...prev, [key]: !currentlyOpen }));
  }, []);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveJSON("settings", next);
      return next;
    });
  }, []);

  const commitHrMax = useCallback(() => {
    const raw = hrMaxDraft.trim();
    const num = parseInt(raw, 10);
    updateSettings({ hrMax: raw !== "" && !isNaN(num) && num > 0 ? num : null });
  }, [hrMaxDraft, updateSettings]);

  const exportBackup = useCallback(() => {
    const payload = { settings, log, overrides, exportedAt: dateKey(new Date()) };
    setBackupText(JSON.stringify(payload));
    setImportStatus("");
  }, [settings, log, overrides]);

  const copyBackup = useCallback(async () => {
    if (!backupText) {
      const payload = { settings, log, overrides, exportedAt: dateKey(new Date()) };
      setBackupText(JSON.stringify(payload));
    }
    try {
      await navigator.clipboard.writeText(backupText || JSON.stringify({ settings, log, overrides }));
      setCopyStatus("Copied");
    } catch (e) {
      setCopyStatus("Select & copy manually");
    }
    setTimeout(() => setCopyStatus(""), 2500);
  }, [backupText, settings, log, overrides]);

  const importBackup = useCallback(() => {
    try {
      const parsed = JSON.parse(backupText);
      if (!parsed || typeof parsed !== "object") throw new Error("bad shape");
      const nextSettings = parsed.settings || { weekOverride: "auto", deload: false, hrMax: null };
      const nextLog = parsed.log || {};
      const nextOverrides = parsed.overrides || {};
      setSettings(nextSettings);
      setLog(nextLog);
      setOverrides(nextOverrides);
      saveJSON("settings", nextSettings);
      saveJSON("log", nextLog);
      saveJSON("scheduleOverrides", nextOverrides);
      setImportStatus("Restored");
    } catch (e) {
      setImportStatus("Couldn't read that — check it's a full backup");
    }
    setTimeout(() => setImportStatus(""), 3500);
  }, [backupText]);

  const goCalMonth = useCallback((delta) => {
    setCalMonth((m) => {
      let nm = m + delta;
      let ny = calYear;
      if (nm < 0) {
        nm = 11;
        ny -= 1;
      } else if (nm > 11) {
        nm = 0;
        ny += 1;
      }
      setCalYear(ny);
      return nm;
    });
  }, [calYear]);

  const swapBlock = useCallback(
    (dateA, dateB, blockType) => {
      const keyA = dateKey(dateA);
      const keyB = dateKey(dateB);
      const infoA = resolveSchedule(dateA, settings.weekOverride, overrides);
      const infoB = resolveSchedule(dateB, settings.weekOverride, overrides);
      setOverrides((prev) => {
        const next = { ...prev };
        next[keyA] = { ...(prev[keyA] || {}), [blockType]: infoB[blockType] };
        next[keyB] = { ...(prev[keyB] || {}), [blockType]: infoA[blockType] };
        saveJSON("scheduleOverrides", next);
        return next;
      });
    },
    [settings.weekOverride, overrides]
  );

  const setBlock = useCallback((d, blockType, value) => {
    const key = dateKey(d);
    setOverrides((prev) => {
      const next = { ...prev, [key]: { ...(prev[key] || {}), [blockType]: value } };
      saveJSON("scheduleOverrides", next);
      return next;
    });
  }, []);

  const resetBlockOverride = useCallback((d, blockType) => {
    const key = dateKey(d);
    setOverrides((prev) => {
      if (!prev[key] || !Object.prototype.hasOwnProperty.call(prev[key], blockType)) return prev;
      const dayOv = { ...prev[key] };
      delete dayOv[blockType];
      const next = { ...prev };
      if (Object.keys(dayOv).length === 0) delete next[key];
      else next[key] = dayOv;
      saveJSON("scheduleOverrides", next);
      return next;
    });
  }, []);

  const setWeekDeload = useCallback((weekMonday, value) => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekMonday);
        d.setDate(d.getDate() + i);
        const key = dateKey(d);
        next[key] = { ...(next[key] || {}), deload: value };
      }
      saveJSON("scheduleOverrides", next);
      return next;
    });
  }, []);

  const addActivity = useCallback((d, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = dateKey(d);
    setOverrides((prev) => {
      const dayOv = { ...(prev[key] || {}) };
      const existing = Array.isArray(dayOv.activities) ? dayOv.activities : [];
      const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: trimmed };
      dayOv.activities = [...existing, entry];
      const next = { ...prev, [key]: dayOv };
      saveJSON("scheduleOverrides", next);
      return next;
    });
  }, []);

  const removeActivity = useCallback((d, activityId) => {
    const key = dateKey(d);
    setOverrides((prev) => {
      if (!prev[key] || !Array.isArray(prev[key].activities)) return prev;
      const dayOv = { ...prev[key] };
      dayOv.activities = dayOv.activities.filter((a) => a.id !== activityId);
      const next = { ...prev };
      if (dayOv.activities.length === 0 && !("strength" in dayOv) && !("cardio" in dayOv) && dayOv.note === undefined) {
        delete next[key];
      } else {
        next[key] = dayOv;
      }
      saveJSON("scheduleOverrides", next);
      return next;
    });
  }, []);

  const pickCalDay = useCallback(
    (d) => {
      setEditingBlock(null);
      setActivityDraft("");
      if (moveSource) {
        if (dateKey(moveSource.date) === dateKey(d)) {
          setMoveSource(null);
          return;
        }
        swapBlock(moveSource.date, d, moveSource.blockType);
        setMoveSource(null);
        setCalSelected(d);
        setCalMonth(d.getMonth());
        setCalYear(d.getFullYear());
        return;
      }
      setCalSelected(d);
      setCalMonth(d.getMonth());
      setCalYear(d.getFullYear());
    },
    [moveSource, swapBlock]
  );

  const goCalToday = useCallback(() => {
    pickCalDay(today);
  }, [pickCalDay, today]);

  const calWeeks = useMemo(() => getMonthMatrix(calYear, calMonth), [calYear, calMonth]);
  const calSelectedInfo = useMemo(
    () => resolveSchedule(calSelected, settings.weekOverride, overrides),
    [calSelected, settings.weekOverride, overrides]
  );
  const movingStrengthHere =
    moveSource && moveSource.blockType === "strength" && dateKey(moveSource.date) === dateKey(calSelected);
  const movingCardioHere =
    moveSource && moveSource.blockType === "cardio" && dateKey(moveSource.date) === dateKey(calSelected);
  const calMonthLabel = new Date(calYear, calMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const calSelectedLabel = calSelected.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const countableTasks = useMemo(() => sections.flatMap((s) => s.tasks).filter((t) => t.type !== "notes"), [sections]);
  const totalCount = countableTasks.length;
  const viewedWeight = viewedRecord?.weight;
  const doneCount = countableTasks.filter((t) => {
    if (t.type === "weight") return typeof viewedWeight === "number";
    if (t.type === "knee") return typeof viewedRecord?.knee === "string";
    if (t.type === "inbody") return Boolean(viewedRecord?.inbody) && Object.values(viewedRecord.inbody).some((v) => v != null);
    if (t.type === "vo2max") return typeof viewedRecord?.vo2max === "number";
    if (t.type === "macro") return typeof viewedRecord?.nutrition?.[t.field] === "number";
    if (t.type === "cardioHR") return Boolean(viewedRecord?.cardioHR) && (viewedRecord.cardioHR.peak != null || viewedRecord.cardioHR.avg != null);
    return Boolean(done[t.id]) || Boolean(viewedRecord?.subs?.[t.id]?.name);
  }).length;
  const pct = totalCount ? doneCount / totalCount : 0;

  const historyRows = useMemo(() => buildHistoryRows(log, overrides), [log, overrides]);
  const streak = useMemo(() => computeStreak(historyRows), [historyRows]);
  const heatmapWeeks = useMemo(() => buildHeatmapCells(historyRows, 12), [historyRows]);
  const weightSeries = useMemo(() => computeWeightSeries(historyRows).slice(-60), [historyRows]);
  const symptomPatterns = useMemo(() => {
    const counts = { strength: 0, cardio: 0, activity: 0, unclear: 0 };
    let symptomDays = 0;
    Object.keys(log).forEach((dstr) => {
      if (dstr === todayKey) return;
      const rec = log[dstr];
      if (!rec || typeof rec.knee !== "string" || rec.knee === "none") return;
      symptomDays += 1;
      const [y, m, d] = dstr.split("-").map(Number);
      const prevDate = new Date(y, m - 1, d - 1);
      const prevKey = dateKey(prevDate);
      const prevRec = log[prevKey];
      const prevDone = prevRec?.done || {};
      const hadStrength = Object.keys(prevDone).some((k) => /^(up|lo|fb|bw)-/.test(k) && prevDone[k]) || Boolean(prevRec?.loads && Object.keys(prevRec.loads).length);
      const hadCardio = Object.keys(prevDone).some((k) => /^cv-/.test(k) && prevDone[k]);
      const hadActivity = Boolean(overrides[prevKey]?.activities?.length);
      if (hadStrength) counts.strength += 1;
      else if (hadActivity) counts.activity += 1;
      else if (hadCardio) counts.cardio += 1;
      else counts.unclear += 1;
    });
    return { symptomDays, counts };
  }, [log, overrides, todayKey]);

  const testHistory = useMemo(() => {
    const inbody = [];
    const vo2max = [];
    Object.keys(log)
      .sort()
      .forEach((dstr) => {
        const rec = log[dstr];
        const [y, m, d] = dstr.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        if (rec?.inbody && Object.values(rec.inbody).some((v) => v != null)) {
          inbody.push({ date: dstr, dateObj, ...rec.inbody });
        }
        if (typeof rec?.vo2max === "number") {
          vo2max.push({ date: dstr, dateObj, value: rec.vo2max });
        }
      });
    return { inbody: inbody.slice(-8).reverse(), vo2max: vo2max.slice(-8).reverse() };
  }, [log]);
  const latestWeight = weightSeries.length ? weightSeries[weightSeries.length - 1] : null;
  const lastWeight = useMemo(() => {
    const prior = historyRows.filter((r) => r.weight != null && r.date < viewedDateKey);
    return prior.length ? prior[prior.length - 1] : null;
  }, [historyRows, viewedDateKey]);
  const lastLoadsByExercise = useMemo(() => {
    const result = {};
    Object.keys(log)
      .sort()
      .forEach((dstr) => {
        if (dstr >= viewedDateKey) return;
        const loads = log[dstr]?.loads;
        if (!loads) return;
        Object.keys(loads).forEach((exId) => {
          const arr = loads[exId];
          if (!arr) return;
          const entries = arr.map((e) => (typeof e === "number" ? { w: e, r: null } : { w: e?.w ?? null, r: e?.r ?? null }));
          if (entries.some((e) => e.w != null || e.r != null)) {
            const [y, m, d] = dstr.split("-").map(Number);
            result[exId] = { date: dstr, dateObj: new Date(y, m - 1, d), entries };
          }
        });
      });
    return result;
  }, [log, viewedDateKey]);
  const lastNoteByExercise = useMemo(() => {
    const result = {};
    Object.keys(log)
      .sort()
      .forEach((dstr) => {
        if (dstr >= viewedDateKey) return;
        const notes = log[dstr]?.exNotes;
        if (!notes) return;
        Object.keys(notes).forEach((exId) => {
          if (notes[exId]) {
            const [y, m, d] = dstr.split("-").map(Number);
            result[exId] = { date: dstr, dateObj: new Date(y, m - 1, d), note: notes[exId] };
          }
        });
      });
    return result;
  }, [log, viewedDateKey]);
  const trendRows = historyRows.filter((r) => r.date !== todayKey);

  const cycleComparison = useMemo(() => {
    const thisCycleStart = getCycleStart(today);
    const thisCycleEnd = new Date(thisCycleStart);
    thisCycleEnd.setDate(thisCycleEnd.getDate() + 13);
    const lastCycleStart = new Date(thisCycleStart);
    lastCycleStart.setDate(lastCycleStart.getDate() - 14);
    const lastCycleEnd = new Date(thisCycleStart);
    lastCycleEnd.setDate(lastCycleEnd.getDate() - 1);

    const summarize = (start, end) => {
      const startKey = dateKey(start);
      const endKey = dateKey(end);
      const rows = historyRows.filter((r) => r.date >= startKey && r.date <= endKey && r.date !== todayKey);
      const strengthDays = rows.filter((r) => r.byCat.strength && r.byCat.strength.total > 0);
      const cardioDays = rows.filter((r) => r.byCat.cardio && r.byCat.cardio.total > 0);
      const strengthPct = strengthDays.length
        ? strengthDays.reduce((s, r) => s + r.byCat.strength.done / r.byCat.strength.total, 0) / strengthDays.length
        : null;
      const cardioPct = cardioDays.length
        ? cardioDays.reduce((s, r) => s + r.byCat.cardio.done / r.byCat.cardio.total, 0) / cardioDays.length
        : null;
      const fatRows = rows.filter((r) => r.nutrition && typeof r.nutrition.fat === "number");
      const avgFat = fatRows.length ? fatRows.reduce((s, r) => s + r.nutrition.fat, 0) / fatRows.length : null;
      const weightRows = rows.filter((r) => r.weight != null);
      const avgWeight = weightRows.length ? weightRows.reduce((s, r) => s + r.weight, 0) / weightRows.length : null;
      return { strengthSessions: strengthDays.length, strengthPct, cardioSessions: cardioDays.length, cardioPct, avgFat, avgWeight };
    };

    return {
      thisCycle: { ...summarize(thisCycleStart, thisCycleEnd), start: thisCycleStart, end: thisCycleEnd },
      lastCycle: { ...summarize(lastCycleStart, lastCycleEnd), start: lastCycleStart, end: lastCycleEnd },
    };
  }, [historyRows, today, todayKey]);

  const recentRows = trendRows.slice(-30);
  const avgPct = recentRows.length ? recentRows.reduce((sum, r) => sum + r.pct, 0) / recentRows.length : 0;
  const chartData = recentRows.map((r) => ({
    date: r.date,
    label: r.dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
    overall: Math.round(r.pct * 100),
    strength: r.byCat.strength ? Math.round((r.byCat.strength.done / r.byCat.strength.total) * 100) : undefined,
    cardio: r.byCat.cardio ? Math.round((r.byCat.cardio.done / r.byCat.cardio.total) * 100) : undefined,
    mobility: r.byCat.mobility ? Math.round((r.byCat.mobility.done / r.byCat.mobility.total) * 100) : undefined,
    nutrition: r.byCat.nutrition ? Math.round((r.byCat.nutrition.done / r.byCat.nutrition.total) * 100) : undefined,
    activity: r.byCat.activity ? Math.round((r.byCat.activity.done / r.byCat.activity.total) * 100) : undefined,
  }));

  const calorieRows = trendRows.filter((r) => r.nutrition && typeof r.nutrition.cal === "number").slice(-30);
  const calorieData = calorieRows.map((r) => ({
    date: r.date,
    label: r.dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
    actual: r.nutrition.cal,
    target: (r.isTrainingDay ? NUTRITION_TARGETS.training : NUTRITION_TARGETS.rest).cal,
  }));

  const stepSeries = useMemo(() => {
    const byDate = {};
    trendRows.forEach((r) => (byDate[r.date] = r.walkHit));
    return trendRows.slice(-30).map((r) => {
      let hits = 0;
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(r.dateObj);
        d.setDate(d.getDate() - i);
        const k = dateKey(d);
        if (Object.prototype.hasOwnProperty.call(byDate, k)) {
          count += 1;
          if (byDate[k]) hits += 1;
        }
      }
      return {
        date: r.date,
        label: r.dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        rate: count ? Math.round((hits / count) * 100) : null,
      };
    });
  }, [trendRows]);

  const exercisesWithHistory = useMemo(() => {
    const found = {};
    Object.keys(log).forEach((dstr) => {
      const loads = log[dstr]?.loads;
      if (!loads) return;
      Object.keys(loads).forEach((exId) => {
        if (loads[exId] && loads[exId].some((e) => (typeof e === "number" ? e : e?.w) != null)) {
          found[exId] = true;
        }
      });
    });
    const nameFor = (exId) => {
      for (const k of ["upper", "lower", "full", "bodyweight"]) {
        const ex = STRENGTH[k].exercises.find((e) => e.id === exId);
        if (ex) return ex.name;
      }
      return exId;
    };
    return Object.keys(found)
      .map((id) => ({ id, name: nameFor(id) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [log]);

  useEffect(() => {
    if (!selectedExerciseId && exercisesWithHistory.length > 0) {
      setSelectedExerciseId(exercisesWithHistory[0].id);
    }
  }, [exercisesWithHistory, selectedExerciseId]);

  const maxWeightSeries = useMemo(() => {
    if (!selectedExerciseId) return [];
    return Object.keys(log)
      .sort()
      .filter((dstr) => dstr !== todayKey)
      .map((dstr) => {
        const loads = log[dstr]?.loads?.[selectedExerciseId];
        if (!loads) return null;
        const weights = loads.map((e) => (typeof e === "number" ? e : e?.w)).filter((w) => w != null);
        if (!weights.length) return null;
        const [y, m, d] = dstr.split("-").map(Number);
        return {
          date: dstr,
          label: new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
          maxWeight: Math.max(...weights),
        };
      })
      .filter(Boolean)
      .slice(-30);
  }, [log, selectedExerciseId, todayKey]);

  const dateLabel = viewedDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const size = 92;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  if (loading) {
    return (
      <div style={{ background: BG }} className="min-h-screen flex items-center justify-center">
        <FontImport />
        <p style={{ color: TEXT_SECONDARY, fontFamily: FONT_BODY }} className="text-sm">
          Loading today's log…
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: BG, fontFamily: FONT_BODY, color: TEXT_PRIMARY }} className="min-h-screen w-full pb-10">
      <FontImport />

      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p
              style={{ fontFamily: FONT_DISPLAY, color: TEXT_SECONDARY, letterSpacing: "0.18em" }}
              className="text-[11px] uppercase font-medium"
            >
              Recomp · Daily Log · v{APP_VERSION}
            </p>
            {view === "today" ? (
              <div className="flex items-center gap-1 mt-0.5 -ml-1.5">
                <button
                  onClick={() => setDayOffset((o) => o - 1)}
                  aria-label="Previous day"
                  style={{ color: TEXT_SECONDARY }}
                  className="shrink-0 p-1.5 rounded-lg focus:outline-none focus-visible:ring-2"
                >
                  <ChevronLeft size={18} />
                </button>
                <h1
                  style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }}
                  className="text-base font-bold truncate flex-1 text-center"
                >
                  {dateLabel}
                </h1>
                <button
                  onClick={() => setDayOffset((o) => o + 1)}
                  aria-label="Next day"
                  style={{ color: TEXT_SECONDARY }}
                  className="shrink-0 p-1.5 rounded-lg focus:outline-none focus-visible:ring-2"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <h1 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-lg font-bold mt-0.5">
                {view === "calendar" ? "Training Calendar" : view === "program" ? "Training Program" : "History & Trends"}
              </h1>
            )}
          </div>
          {(view === "today" || view === "calendar") && (
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="Settings"
              style={{ borderColor: BORDER, color: settingsOpen ? ACCENT_A : TEXT_SECONDARY }}
              className="mt-1 ml-2 shrink-0 rounded-full border p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <Settings2 size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 mt-3" style={{ background: CARD, borderColor: BORDER }}>
          <div className="flex gap-1 p-1 rounded-xl border w-full" style={{ borderColor: BORDER }}>
            {[
              { key: "today", label: "Today" },
              { key: "calendar", label: "Calendar" },
              { key: "history", label: "History" },
              { key: "program", label: "Program" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setView(t.key)}
                style={{
                  background: view === t.key ? ACCENT_A : "transparent",
                  color: view === t.key ? "#14171C" : TEXT_SECONDARY,
                }}
                className="flex-1 text-[11px] font-semibold py-1.5 px-0.5 rounded-lg focus:outline-none focus-visible:ring-2"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {(view === "today" || view === "calendar") && settingsOpen && (
          <div style={{ background: CARD, borderColor: BORDER }} className="mt-3 rounded-xl border p-4 space-y-4">
            <div>
              <p style={{ color: TEXT_SECONDARY }} className="text-xs font-medium mb-2">
                Week type
              </p>
              <div className="flex gap-1.5">
                {["auto", "A", "B"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateSettings({ weekOverride: opt })}
                    style={{
                      background: settings.weekOverride === opt ? ACCENT_A : "transparent",
                      color: settings.weekOverride === opt ? "#14171C" : TEXT_SECONDARY,
                      borderColor: settings.weekOverride === opt ? ACCENT_A : BORDER,
                    }}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg border capitalize focus:outline-none focus-visible:ring-2"
                  >
                    {opt === "auto" ? "Auto" : `Week ${opt}`}
                  </button>
                ))}
              </div>
              <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-1.5">
                If Auto doesn't match your custody calendar, pin it to A or B — it's remembered, and applies to both Today and Calendar.
              </p>
            </div>
            {view === "today" && (
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: TEXT_SECONDARY }} className="text-xs font-medium">
                  Deload this week
                </p>
                <p style={{ color: TEXT_MUTED }} className="text-[11px]">
                  Trims strength volume, swaps hard intervals for Zone 2 — same toggle as Calendar's weekly button
                </p>
              </div>
              <button
                onClick={() => setWeekDeload(getWeekMonday(viewedDate), !viewedDeload)}
                style={{ background: viewedDeload ? ACCENT_A : BORDER }}
                className="w-11 h-6 rounded-full relative transition-colors focus:outline-none focus-visible:ring-2"
                aria-pressed={viewedDeload}
                aria-label="Toggle deload for this week"
              >
                <span
                  style={{
                    background: "#14171C",
                    left: viewedDeload ? 22 : 3,
                  }}
                  className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                />
              </button>
            </div>
            )}

            <div>
              <p style={{ color: TEXT_SECONDARY }} className="text-xs font-medium mb-1">
                Max HR (bpm)
              </p>
              <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-1.5">
                Shows actual bpm targets next to the % zones on cardio days, e.g. "90–95% HRmax (158–166 bpm)"
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={hrMaxDraft}
                onChange={(e) => setHrMaxDraft(e.target.value)}
                onBlur={commitHrMax}
                placeholder="e.g. 175"
                style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                className="w-24 text-sm px-2.5 py-1.5 rounded-lg border focus:outline-none focus-visible:ring-2"
              />
            </div>

            <div style={{ borderColor: BORDER }} className="border-t pt-4">
              <p style={{ color: TEXT_SECONDARY }} className="text-xs font-medium mb-1">
                Backup &amp; restore
              </p>
              <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-2">
                Republishing after a code change can reset stored data. Copy a backup before you ask for changes, restore
                it after.
              </p>
              <div className="flex gap-1.5 mb-2">
                <button
                  onClick={exportBackup}
                  style={{ borderColor: BORDER, color: TEXT_PRIMARY }}
                  className="flex-1 text-xs font-semibold py-1.5 rounded-lg border focus:outline-none focus-visible:ring-2"
                >
                  Show backup
                </button>
                <button
                  onClick={copyBackup}
                  style={{ borderColor: BORDER, color: TEXT_PRIMARY }}
                  className="flex-1 text-xs font-semibold py-1.5 rounded-lg border focus:outline-none focus-visible:ring-2"
                >
                  {copyStatus || "Copy"}
                </button>
              </div>
              <textarea
                value={backupText}
                onChange={(e) => setBackupText(e.target.value)}
                placeholder="Backup JSON appears here — or paste a previous backup here to restore it"
                rows={4}
                style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY, background: BG, borderColor: BORDER }}
                className="w-full text-[10px] p-2 rounded-lg border focus:outline-none focus-visible:ring-2"
              />
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={importBackup}
                  style={{ color: ACCENT_A }}
                  className="text-[11px] font-semibold focus:outline-none focus-visible:underline"
                >
                  Restore from text above
                </button>
                {importStatus && (
                  <span style={{ color: TEXT_MUTED }} className="text-[11px]">
                    {importStatus}
                  </span>
                )}
              </div>
            </div>

            <div style={{ borderColor: BORDER }} className="border-t pt-4">
              <p style={{ color: TEXT_SECONDARY }} className="text-xs font-medium mb-2">
                Changelog — v{APP_VERSION}
              </p>
              <div className="space-y-3">
                {CHANGELOG.map((c) => (
                  <div key={c.version}>
                    <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-[11px] font-semibold">
                      v{c.version} <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>· {c.date}</span>
                    </p>
                    <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-0.5">
                      {c.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "today" && (
        <>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span
            style={{ background: CARD, borderColor: BORDER, color: TEXT_PRIMARY, fontFamily: FONT_MONO }}
            className="text-xs px-2.5 py-1 rounded-full border"
          >
            Week {viewedWeekType} · {viewedWeekType === "A" ? "Even · Kids home" : "Odd · Travel window"}
          </span>
          {settings.weekOverride === "auto" && (
            <span style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }} className="text-[11px]">
              auto
            </span>
          )}
          {viewedDeload && (
            <span
              style={{ background: "rgba(227,162,60,0.14)", color: ACCENT_A, borderColor: "rgba(227,162,60,0.4)" }}
              className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
            >
              Deload
            </span>
          )}
          {viewedScheduleInfo.moved && (
            <span
              style={{ background: "rgba(76,182,196,0.14)", color: ACCENT_B, borderColor: "rgba(76,182,196,0.4)" }}
              className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
            >
              Rearranged
            </span>
          )}
          {!isViewingToday && (
            <button
              onClick={() => setDayOffset(0)}
              style={{ background: "rgba(227,162,60,0.14)", color: ACCENT_A, borderColor: "rgba(227,162,60,0.4)" }}
              className="text-[11px] px-2 py-0.5 rounded-full border font-medium focus:outline-none focus-visible:underline"
            >
              {dayOffset < 0 ? `${-dayOffset}d ago` : `In ${dayOffset}d`} · Back to today
            </button>
          )}
        </div>

        {isDeloadWeek(viewedDate) && (
          <div
            style={{
              background: viewedDeload ? "rgba(111,207,151,0.1)" : "rgba(227,162,60,0.1)",
              borderColor: viewedDeload ? "rgba(111,207,151,0.35)" : "rgba(227,162,60,0.35)",
            }}
            className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 mt-2.5"
          >
            <p style={{ color: TEXT_PRIMARY }} className="text-xs">
              {viewedDeload
                ? "Deload week (4th of your cycle) — Deload is on."
                : "Scheduled deload week (4th of your cycle) — Deload isn't on."}
            </p>
            <button
              onClick={() => setWeekDeload(getWeekMonday(viewedDate), !viewedDeload)}
              style={{ color: viewedDeload ? CATS.mobility.color : ACCENT_A }}
              className="text-[11px] font-semibold shrink-0 focus:outline-none focus-visible:underline"
            >
              {viewedDeload ? "Turn off" : "Turn on"}
            </button>
          </div>
        )}

        {/* Progress ring */}
        <div className="flex items-center gap-4 mt-5">
          <div style={{ width: size, height: size }} className="relative shrink-0">
            <svg width={size} height={size}>
              <defs>
                <linearGradient id="dayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ACCENT_A} />
                  <stop offset="100%" stopColor={ACCENT_B} />
                </linearGradient>
              </defs>
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={BORDER} strokeWidth={stroke} />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#dayGradient)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dashoffset 300ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-base font-semibold">
                {Math.round(pct * 100)}%
              </span>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-sm">
              {doneCount} of {totalCount} complete
            </p>
            <p style={{ color: TEXT_MUTED }} className="text-xs mt-0.5">
              {isViewingToday
                ? "Review each morning, check off as you go"
                : dayOffset < 0
                ? "Past day — edits update that day's log"
                : "Future day — preview only, nothing due yet"}
            </p>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Today: Sections */}
      {view === "today" && (
      <div className="px-4 max-w-md mx-auto space-y-4">
        {sections.map((section) => {
          const cat = CATS[section.cat];
          const Icon = cat.Icon;
          const SPECIAL_TYPES = ["weight", "knee", "notes", "inbody", "vo2max", "macro", "cardioHR"];
          const taskIds = section.tasks.filter((t) => !SPECIAL_TYPES.includes(t.type)).map((t) => t.id);
          const sectionDone = taskIds.length > 0 && taskIds.every((id) => done[id]);
          const hasTasks = section.tasks.length > 0;
          const defaultOpen = !["mobility", "strength", "cardio"].includes(section.key);
          const isOpen = sectionOpen[section.key] !== undefined ? sectionOpen[section.key] : defaultOpen;

          return (
            <div key={section.key} style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border overflow-hidden">
              <div
                role={hasTasks ? "button" : undefined}
                tabIndex={hasTasks ? 0 : undefined}
                onClick={() => hasTasks && toggleSection(section.key, isOpen)}
                onKeyDown={(e) => {
                  if (hasTasks && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    toggleSection(section.key, isOpen);
                  }
                }}
                style={{ borderLeftColor: cat.color }}
                className={`border-l-4 px-4 py-3 ${hasTasks ? "cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={15} style={{ color: cat.color }} />
                    <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold">
                      {section.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {taskIds.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markSection(taskIds, !sectionDone);
                        }}
                        style={{ color: cat.color }}
                        className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                      >
                        {sectionDone ? "Clear" : "Mark all"}
                      </button>
                    )}
                    {hasTasks && (
                      <ChevronDown
                        size={16}
                        style={{
                          color: TEXT_MUTED,
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 200ms ease",
                        }}
                      />
                    )}
                  </div>
                </div>
                {section.subtitle && (
                  <p style={{ color: TEXT_MUTED }} className="text-[12px] mt-1">
                    {section.subtitle}
                  </p>
                )}
              </div>

              {hasTasks && isOpen && (
                <div style={{ borderColor: BORDER }} className="border-t">
                  {section.tasks.map((task, i) => {
                    if (task.type === "weight") {
                      const hasWeight = typeof viewedWeight === "number";
                      const benchmarkLabel = lastWeight
                        ? `Last: ${lastWeight.weight} kg · ${
                            daysBetween(lastWeight.dateObj, viewedDate) === 1 ? "yesterday" : `${daysBetween(lastWeight.dateObj, viewedDate)}d ago`
                          }`
                        : task.presc;
                      return (
                        <div
                          key={task.id}
                          style={{ borderColor: BORDER, borderTopWidth: i === 0 ? 0 : 1 }}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <span
                            style={{
                              background: hasWeight ? cat.color : "transparent",
                              borderColor: hasWeight ? cat.color : BORDER,
                            }}
                            className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          >
                            {hasWeight && <Check size={12} strokeWidth={3} color="#14171C" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p style={{ color: TEXT_PRIMARY }} className="text-sm font-medium">
                              {task.name}
                            </p>
                            <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] mt-0.5">
                              {benchmarkLabel}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder={lastWeight ? String(lastWeight.weight) : "—"}
                              value={weightDraft}
                              onChange={(e) => setWeightDraft(e.target.value)}
                              onBlur={commitWeight}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                              style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                              className="w-16 text-right text-sm px-2 py-1 rounded-md border focus:outline-none focus-visible:ring-2"
                              aria-label="Morning weigh-in, kilograms"
                            />
                            <span style={{ color: TEXT_MUTED }} className="text-xs">
                              kg
                            </span>
                          </div>
                        </div>
                      );
                    }
                    if (task.type === "knee") {
                      const kneeVal = viewedRecord?.knee;
                      const hasKnee = typeof kneeVal === "string";
                      const KNEE_OPTIONS = ["none", "mild", "moderate", "severe"];
                      return (
                        <div
                          key={task.id}
                          style={{ borderColor: BORDER, borderTopWidth: i === 0 ? 0 : 1 }}
                          className="px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              style={{
                                background: hasKnee ? cat.color : "transparent",
                                borderColor: hasKnee ? cat.color : BORDER,
                              }}
                              className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            >
                              {hasKnee && <Check size={12} strokeWidth={3} color="#14171C" />}
                            </span>
                            <p style={{ color: TEXT_PRIMARY }} className="text-sm font-medium flex-1">
                              {task.name}
                            </p>
                          </div>
                          <div className="flex gap-1.5 mt-2 ml-8">
                            {KNEE_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setKnee(opt)}
                                style={{
                                  background: kneeVal === opt ? cat.color : "transparent",
                                  color: kneeVal === opt ? "#14171C" : TEXT_SECONDARY,
                                  borderColor: kneeVal === opt ? cat.color : BORDER,
                                }}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border capitalize focus:outline-none focus-visible:ring-2"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (task.type === "notes") {
                      return (
                        <div
                          key={task.id}
                          style={{ borderColor: BORDER, borderTopWidth: i === 0 ? 0 : 1 }}
                          className="px-4 py-3"
                        >
                          <p style={{ color: TEXT_PRIMARY }} className="text-sm font-medium mb-1.5">
                            {task.name}
                          </p>
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            onBlur={commitNotes}
                            placeholder={task.presc}
                            rows={2}
                            style={{ fontFamily: FONT_BODY, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                            className="w-full text-xs p-2 rounded-lg border resize-none focus:outline-none focus-visible:ring-2"
                          />
                        </div>
                      );
                    }
                    if (task.type === "macro") {
                      const actual = viewedRecord?.nutrition?.[task.field];
                      const hasValue = typeof actual === "number";
                      const met = hasValue ? (task.direction === "under" ? actual <= task.target : actual >= task.target) : null;
                      const diff = hasValue ? Math.round(actual - task.target) : null;
                      const subtitle = hasValue
                        ? `${task.presc} · logged ${actual}${task.unit} (${diff > 0 ? "+" : ""}${diff})`
                        : task.presc;
                      return (
                        <div
                          key={task.id}
                          style={{ borderColor: BORDER, borderTopWidth: i === 0 ? 0 : 1 }}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <span
                            style={{
                              background: hasValue ? (met ? CATS.mobility.color : cat.color) : "transparent",
                              borderColor: hasValue ? (met ? CATS.mobility.color : cat.color) : BORDER,
                            }}
                            className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          >
                            {hasValue && <Check size={12} strokeWidth={3} color="#14171C" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p style={{ color: TEXT_PRIMARY }} className="text-sm font-medium">
                              {task.name}
                            </p>
                            <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] mt-0.5">
                              {subtitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder={task.unit}
                              value={nutritionDrafts[task.field] ?? ""}
                              onChange={(e) => setNutritionDrafts((prev) => ({ ...prev, [task.field]: e.target.value }))}
                              onBlur={(e) => commitNutrition(task.field, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                              style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                              className="w-16 text-right text-sm px-2 py-1 rounded-md border focus:outline-none focus-visible:ring-2"
                              aria-label={`${task.name}, ${task.unit}`}
                            />
                            <span style={{ color: TEXT_MUTED }} className="text-xs">
                              {task.unit}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    if (task.type === "inbody" || task.type === "vo2max") {
                      const isInbody = task.type === "inbody";
                      const hasValue = isInbody
                        ? Boolean(viewedRecord?.inbody) && Object.values(viewedRecord.inbody).some((v) => v != null)
                        : typeof viewedRecord?.vo2max === "number";
                      const fields = isInbody
                        ? [
                            ["smm", "SMM (kg)"],
                            ["pbf", "Body fat %"],
                            ["trunkFat", "Trunk fat %"],
                            ["ecw", "ECW ratio"],
                          ]
                        : [["vo2max", "VO2max (mL/kg/min)"]];
                      const isEditing = editingMetric === task.type;
                      return (
                        <div
                          key={task.id}
                          style={{ borderColor: BORDER, borderTopWidth: i === 0 ? 0 : 1 }}
                          className="px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                style={{
                                  background: hasValue ? cat.color : "transparent",
                                  borderColor: hasValue ? cat.color : BORDER,
                                }}
                                className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                              >
                                {hasValue && <Check size={12} strokeWidth={3} color="#14171C" />}
                              </span>
                              <div className="min-w-0">
                                <p style={{ color: TEXT_PRIMARY }} className="text-sm font-medium truncate">
                                  {task.name}
                                </p>
                                <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] mt-0.5 truncate">
                                  {task.presc}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingMetric(isEditing ? null : task.type)}
                              style={{ color: TEXT_SECONDARY }}
                              className="shrink-0 text-[11px] font-medium focus:outline-none focus-visible:underline"
                            >
                              {hasValue ? "Edit" : "+ Log"}
                            </button>
                          </div>
                          {isEditing && (
                            <div className="grid grid-cols-2 gap-2 mt-2.5 ml-8">
                              {fields.map(([field, label]) => (
                                <div key={field} className="flex flex-col gap-0.5">
                                  <span style={{ color: TEXT_MUTED }} className="text-[10px]">
                                    {label}
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={metricDrafts[field]}
                                    onChange={(e) => setMetricDrafts((prev) => ({ ...prev, [field]: e.target.value }))}
                                    onBlur={(e) => commitMetric(field, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") e.currentTarget.blur();
                                    }}
                                    style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                                    className="text-xs px-2 py-1 rounded-md border focus:outline-none focus-visible:ring-2"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (task.type === "cardioHR") {
                      const hr = viewedRecord?.cardioHR;
                      const hasValue = Boolean(hr) && (hr.peak != null || hr.avg != null);
                      const isEditing = editingMetric === "cardioHR";
                      const targetBpm = settings.hrMax ? Math.round((settings.hrMax * task.targetPctMax) / 100) : null;
                      const hitTarget = hasValue && hr.peak != null && targetBpm != null ? hr.peak >= targetBpm - 3 : null;
                      return (
                        <div
                          key={task.id}
                          style={{ borderColor: BORDER, borderTopWidth: i === 0 ? 0 : 1 }}
                          className="px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                style={{
                                  background: hasValue ? (hitTarget === false ? cat.color : CATS.mobility.color) : "transparent",
                                  borderColor: hasValue ? (hitTarget === false ? cat.color : CATS.mobility.color) : BORDER,
                                }}
                                className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                              >
                                {hasValue && <Check size={12} strokeWidth={3} color="#14171C" />}
                              </span>
                              <div className="min-w-0">
                                <p style={{ color: TEXT_PRIMARY }} className="text-sm font-medium truncate">
                                  {task.name}
                                </p>
                                <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] mt-0.5 truncate">
                                  {hasValue
                                    ? `Peak ${hr.peak ?? "–"} · Avg ${hr.avg ?? "–"} bpm${targetBpm ? ` · target ≥${targetBpm}` : ""}`
                                    : task.presc}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingMetric(isEditing ? null : "cardioHR")}
                              style={{ color: TEXT_SECONDARY }}
                              className="shrink-0 text-[11px] font-medium focus:outline-none focus-visible:underline"
                            >
                              {hasValue ? "Edit" : "+ Log"}
                            </button>
                          </div>
                          {isEditing && (
                            <div className="grid grid-cols-2 gap-2 mt-2.5 ml-8">
                              {[
                                ["peak", "Peak (bpm)"],
                                ["avg", "Average (bpm)"],
                              ].map(([field, label]) => (
                                <div key={field} className="flex flex-col gap-0.5">
                                  <span style={{ color: TEXT_MUTED }} className="text-[10px]">
                                    {label}
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={metricDrafts[field]}
                                    onChange={(e) => setMetricDrafts((prev) => ({ ...prev, [field]: e.target.value }))}
                                    onBlur={(e) => commitCardioHR(field, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") e.currentTarget.blur();
                                    }}
                                    style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                                    className="text-xs px-2 py-1 rounded-md border focus:outline-none focus-visible:ring-2"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    const checked = Boolean(done[task.id]);
                    const collapsible = section.cat === "strength" || section.cat === "mobility";
                    const isOpen = Boolean(expanded[task.id]);
                    const sub = section.cat === "strength" ? viewedRecord?.subs?.[task.id] : null;
                    const isSubstituted = Boolean(sub?.name);
                    return (
                      <div
                        key={task.id}
                        style={{ borderColor: BORDER, borderTopWidth: i === 0 ? 0 : 1 }}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleTask(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleTask(task.id);
                            }
                          }}
                          style={{ background: checked || isSubstituted ? "rgba(255,255,255,0.02)" : "transparent" }}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                        >
                          <span
                            style={{
                              background: isSubstituted || checked ? cat.color : "transparent",
                              borderColor: isSubstituted || checked ? cat.color : BORDER,
                            }}
                            className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          >
                            {isSubstituted ? (
                              <Repeat size={11} strokeWidth={3} color="#14171C" />
                            ) : (
                              checked && <Check size={12} strokeWidth={3} color="#14171C" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                color: isSubstituted ? TEXT_PRIMARY : checked ? TEXT_MUTED : TEXT_PRIMARY,
                                textDecoration: checked && !isSubstituted ? "line-through" : "none",
                              }}
                              className="text-sm font-medium truncate"
                            >
                              {isSubstituted ? `${task.name} → ${sub.name}` : task.name}
                            </p>
                            {!collapsible && (
                              <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] mt-0.5">
                                {task.presc}
                              </p>
                            )}
                          </div>
                          {collapsible && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(task.id);
                              }}
                              aria-label={isOpen ? "Hide detail" : "Show detail"}
                              aria-expanded={isOpen}
                              style={{ color: TEXT_MUTED }}
                              className="shrink-0 p-1 focus:outline-none focus-visible:ring-2 rounded"
                            >
                              <ChevronDown
                                size={16}
                                style={{
                                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 200ms ease",
                                }}
                              />
                            </button>
                          )}
                          {!collapsible && task.video && (
                            <a
                              href={task.video}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: cat.color }}
                              className="shrink-0 p-1.5 rounded-full focus:outline-none focus-visible:ring-2"
                              aria-label="Watch demonstration video"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        {collapsible && isOpen && section.cat === "strength" && (
                          <div className="px-4 pb-3 pl-12 -mt-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span
                                style={{ fontFamily: FONT_MONO, color: TEXT_SECONDARY, background: BG, borderColor: BORDER }}
                                className="text-[11px] px-2 py-1 rounded-md border inline-block"
                              >
                                {task.presc}
                              </span>
                              {task.video && (
                                <a
                                  href={task.video}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ color: cat.color }}
                                  className="text-[11px] font-medium flex items-center gap-1 focus:outline-none focus-visible:underline"
                                >
                                  Watch demo <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                            {(() => {
                              const setCount = parseInt((task.presc.match(/^(\d+)/) || [, "3"])[1], 10);
                              const lastLoad = lastLoadsByExercise[task.id];
                              const lastNote = lastNoteByExercise[task.id];
                              const daysAgo = lastLoad ? daysBetween(lastLoad.dateObj, viewedDate) : null;
                              return (
                                <>
                                  {lastNote && (
                                    <p
                                      style={{ background: "rgba(227,162,60,0.12)", color: ACCENT_A, borderColor: "rgba(227,162,60,0.35)" }}
                                      className="text-[11px] mb-1.5 px-2 py-1 rounded-md border"
                                    >
                                      📌 {lastNote.note}
                                    </p>
                                  )}
                                  {lastLoad && (
                                    <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-1.5">
                                      Last:{" "}
                                      {lastLoad.entries
                                        .map((e) => (e.w != null ? `${e.w}${e.r != null ? `×${e.r}` : ""}` : "–"))
                                        .join(", ")}{" "}
                                      kg · {daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`}
                                    </p>
                                  )}
                                  <p style={{ color: TEXT_MUTED }} className="text-[10px] mb-1">
                                    {lastLoad ? "Prefilled from last session — edit or tap through to keep." : ""}
                                  </p>
                                  <div className="flex gap-2 flex-wrap">
                                    {Array.from({ length: setCount }).map((_, si) => {
                                      const wKey = `${task.id}:${si}:w`;
                                      const rKey = `${task.id}:${si}:r`;
                                      const lastEntry = lastLoad?.entries?.[si];
                                      const wPrefilled = loadDrafts[wKey] === undefined && lastEntry?.w != null;
                                      const rPrefilled = loadDrafts[rKey] === undefined && lastEntry?.r != null;
                                      const wValue = loadDrafts[wKey] ?? (lastEntry?.w != null ? String(lastEntry.w) : "");
                                      const rValue = loadDrafts[rKey] ?? (lastEntry?.r != null ? String(lastEntry.r) : "");
                                      return (
                                        <div key={si} className="flex flex-col items-center gap-0.5">
                                          <span style={{ color: TEXT_MUTED }} className="text-[9px] uppercase tracking-wide">
                                            Set {si + 1}
                                          </span>
                                          <div className="flex gap-1">
                                            <input
                                              type="text"
                                              inputMode="decimal"
                                              placeholder="kg"
                                              value={wValue}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => setLoadDrafts((prev) => ({ ...prev, [wKey]: e.target.value }))}
                                              onBlur={(e) => commitLoad(task.id, si, "w", e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") e.currentTarget.blur();
                                              }}
                                              style={{
                                                fontFamily: FONT_MONO,
                                                color: wPrefilled ? TEXT_MUTED : TEXT_PRIMARY,
                                                borderColor: BORDER,
                                                background: BG,
                                              }}
                                              className="w-11 text-center text-xs px-1 py-1 rounded-md border focus:outline-none focus-visible:ring-2"
                                              aria-label={`${task.name} set ${si + 1}, kilograms`}
                                            />
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              placeholder="reps"
                                              value={rValue}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => setLoadDrafts((prev) => ({ ...prev, [rKey]: e.target.value }))}
                                              onBlur={(e) => commitLoad(task.id, si, "r", e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") e.currentTarget.blur();
                                              }}
                                              style={{
                                                fontFamily: FONT_MONO,
                                                color: rPrefilled ? TEXT_MUTED : TEXT_PRIMARY,
                                                borderColor: BORDER,
                                                background: BG,
                                              }}
                                              className="w-9 text-center text-xs px-1 py-1 rounded-md border focus:outline-none focus-visible:ring-2"
                                              aria-label={`${task.name} set ${si + 1}, reps`}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
                                    {editingNote === task.id ? (
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="text"
                                          value={exNoteDrafts[task.id] ?? ""}
                                          onChange={(e) => setExNoteDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))}
                                          onBlur={(e) => commitExNote(task.id, e.target.value)}
                                          placeholder="e.g. Increase to 27.5kg next time"
                                          style={{ fontFamily: FONT_BODY, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus-visible:ring-2"
                                        />
                                        <button
                                          onClick={() => setEditingNote(null)}
                                          style={{ color: TEXT_SECONDARY }}
                                          className="text-[11px] font-medium mt-1.5 focus:outline-none focus-visible:underline"
                                        >
                                          Done
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingNote(task.id);
                                          setExNoteDrafts((prev) => ({ ...prev, [task.id]: viewedRecord?.exNotes?.[task.id] || "" }));
                                        }}
                                        style={{ color: TEXT_SECONDARY }}
                                        className="text-[11px] font-medium flex items-center gap-1.5 focus:outline-none focus-visible:underline"
                                      >
                                        📌 {viewedRecord?.exNotes?.[task.id] ? "Edit note for next time" : "Leave a note for next time"}
                                      </button>
                                    )}
                                  </div>
                                  <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
                                    {editingSub === task.id ? (
                                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="text"
                                          value={subDrafts[task.id] ?? ""}
                                          onChange={(e) => setSubDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))}
                                          onBlur={(e) => commitSubstitution(task.id, e.target.value, sub?.reason)}
                                          placeholder="What did you do instead?"
                                          style={{ fontFamily: FONT_BODY, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus-visible:ring-2"
                                        />
                                        <div className="flex gap-1.5 flex-wrap">
                                          {["equipment", "pain", "time", "fatigue", "other"].map((r) => (
                                            <button
                                              key={r}
                                              onClick={() => commitSubstitution(task.id, subDrafts[task.id] ?? sub?.name ?? "", r)}
                                              style={{
                                                background: sub?.reason === r ? cat.color : "transparent",
                                                color: sub?.reason === r ? "#14171C" : TEXT_SECONDARY,
                                                borderColor: sub?.reason === r ? cat.color : BORDER,
                                              }}
                                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border capitalize focus:outline-none focus-visible:ring-2"
                                            >
                                              {r}
                                            </button>
                                          ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <button
                                            onClick={() => setEditingSub(null)}
                                            style={{ color: TEXT_SECONDARY }}
                                            className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                                          >
                                            Done
                                          </button>
                                          {sub && (
                                            <button
                                              onClick={() => {
                                                commitSubstitution(task.id, "", null);
                                                setEditingSub(null);
                                              }}
                                              style={{ color: TEXT_MUTED }}
                                              className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                                            >
                                              Clear substitution
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingSub(task.id);
                                          setSubDrafts((prev) => ({ ...prev, [task.id]: sub?.name || "" }));
                                        }}
                                        style={{ color: cat.color, borderColor: cat.color }}
                                        className="text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border focus:outline-none focus-visible:ring-2"
                                      >
                                        <Repeat size={12} />
                                        {sub
                                          ? `Substituted: ${sub.name}${sub.reason ? ` (${sub.reason})` : ""} — Edit`
                                          : "Couldn't do this? Log a substitution"}
                                      </button>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                        {collapsible && isOpen && section.cat !== "strength" && (
                          <div className="px-4 pb-3 pl-12 -mt-1 flex items-center gap-3 flex-wrap">
                            <span
                              style={{ fontFamily: FONT_MONO, color: TEXT_SECONDARY, background: BG, borderColor: BORDER }}
                              className="text-[11px] px-2 py-1 rounded-md border"
                            >
                              {task.presc}
                            </span>
                            {task.video && (
                              <a
                                href={task.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: cat.color }}
                                className="text-[11px] font-medium flex items-center gap-1 focus:outline-none focus-visible:underline"
                              >
                                Watch demo <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Calendar */}
      {view === "calendar" && (
        <div className="px-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => goCalMonth(-1)}
              aria-label="Previous month"
              style={{ borderColor: BORDER, color: TEXT_SECONDARY }}
              className="rounded-full border p-2 focus:outline-none focus-visible:ring-2"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-base font-bold">
                {calMonthLabel}
              </h2>
              <button
                onClick={goCalToday}
                style={{ color: ACCENT_A }}
                className="text-[11px] font-semibold focus:outline-none focus-visible:underline"
              >
                Today
              </button>
            </div>
            <button
              onClick={() => goCalMonth(1)}
              aria-label="Next month"
              style={{ borderColor: BORDER, color: TEXT_SECONDARY }}
              className="rounded-full border p-2 focus:outline-none focus-visible:ring-2"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {moveSource && (
            <div
              style={{
                background: moveSource.blockType === "strength" ? "rgba(227,162,60,0.12)" : "rgba(76,182,196,0.12)",
                borderColor: moveSource.blockType === "strength" ? ACCENT_A : CATS.cardio.color,
              }}
              className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 mb-3"
            >
              <p style={{ color: TEXT_PRIMARY }} className="text-xs">
                Moving <span className="font-semibold">{moveSource.blockType === "strength" ? "Strength" : "Cardio"}</span> from{" "}
                <span style={{ fontFamily: FONT_MONO }}>
                  {moveSource.date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
                </span>{" "}
                — tap the day to swap it with.
              </p>
              <button
                onClick={() => setMoveSource(null)}
                style={{ color: moveSource.blockType === "strength" ? ACCENT_A : CATS.cardio.color }}
                className="text-xs font-semibold shrink-0 focus:outline-none focus-visible:underline"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-7 gap-1.5 mb-1">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} style={{ color: TEXT_MUTED }} className="text-center text-[10px] font-medium">
                {d}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {calWeeks.map((week, wi) => {
              const weekMonday = week[0];
              const weekInfo = resolveSchedule(weekMonday, settings.weekOverride, overrides);
              const weekDeloadOn = weekInfo.deload === true;
              const weekSuggested = isDeloadWeek(weekMonday);
              return (
                <div key={wi} className="flex items-stretch gap-1.5">
                  <button
                    onClick={() => setWeekDeload(weekMonday, !weekDeloadOn)}
                    style={{
                      background: weekDeloadOn ? ACCENT_A : "transparent",
                      borderColor: weekDeloadOn ? ACCENT_A : weekSuggested ? "rgba(227,162,60,0.5)" : BORDER,
                      borderStyle: weekSuggested && !weekDeloadOn ? "dashed" : "solid",
                      color: weekDeloadOn ? "#14171C" : TEXT_MUTED,
                    }}
                    className="shrink-0 w-7 self-stretch rounded-md border flex items-center justify-center text-[10px] font-bold focus:outline-none focus-visible:ring-2"
                    aria-label={weekDeloadOn ? "Turn off deload for this week" : "Turn on deload for this week"}
                    title={weekSuggested && !weekDeloadOn ? "Usually your 4th-week deload" : weekDeloadOn ? "Deload on for this week" : "Deload"}
                  >
                    D
                  </button>
                  <div className="grid grid-cols-7 gap-1.5 flex-1">
                    {week.map((d) => {
                      const inMonth = d.getMonth() === calMonth;
                      const isToday = dateKey(d) === todayKey;
                      const isSelected = dateKey(d) === dateKey(calSelected);
                      const isMoveSource = moveSource && dateKey(d) === dateKey(moveSource.date);
                      const info = resolveSchedule(d, settings.weekOverride, overrides);
                      const dueTest = info.dueInBody || info.dueVo2max;
                      return (
                        <button
                          key={dateKey(d)}
                          onClick={() => pickCalDay(d)}
                          style={{
                            background: isMoveSource
                              ? "rgba(227,162,60,0.22)"
                              : isSelected
                              ? "rgba(227,162,60,0.14)"
                              : info.deload === true
                              ? "rgba(227,162,60,0.08)"
                              : "transparent",
                            borderColor: isMoveSource ? ACCENT_A : isToday ? ACCENT_A : BORDER,
                            borderWidth: isMoveSource || isToday ? 2 : 1,
                            borderStyle: info.moved ? "dashed" : "solid",
                          }}
                          className="aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 focus:outline-none focus-visible:ring-2"
                        >
                          <span style={{ fontFamily: FONT_MONO, color: inMonth ? TEXT_PRIMARY : TEXT_MUTED }} className="text-xs">
                            {d.getDate()}
                          </span>
                          <span className="flex gap-0.5 h-1.5">
                            {info.strength && <span style={{ background: CATS.strength.color }} className="w-1.5 h-1.5 rounded-full" />}
                            {info.cardio && <span style={{ background: CATS.cardio.color }} className="w-1.5 h-1.5 rounded-full" />}
                            {info.activities.length > 0 && <span style={{ background: CATS.activity.color }} className="w-1.5 h-1.5 rounded-full" />}
                            {dueTest && <span style={{ background: CATS.testing.color }} className="w-1.5 h-1.5 rounded-full" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: TEXT_SECONDARY }}>
              <span style={{ background: CATS.strength.color }} className="w-2 h-2 rounded-full" />
              Strength
            </span>
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: TEXT_SECONDARY }}>
              <span style={{ background: CATS.cardio.color }} className="w-2 h-2 rounded-full" />
              Cardio
            </span>
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: TEXT_SECONDARY }}>
              <span style={{ background: CATS.activity.color }} className="w-2 h-2 rounded-full" />
              Activity
            </span>
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: TEXT_SECONDARY }}>
              <span style={{ background: CATS.testing.color }} className="w-2 h-2 rounded-full" />
              Testing due
            </span>
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: TEXT_SECONDARY }}>
              <span style={{ borderColor: BORDER }} className="w-2 h-2 rounded-full border" />
              Rest
            </span>
          </div>
          <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-1.5">
            Dashed border = changed from default (moved, added, or edited). The "D" button left of each week toggles
            deload for that whole week — filled amber when on, dashed outline when it's your usual 4th-week slot but
            not yet toggled. Days in a deload week get a light amber wash.
          </p>

          <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border overflow-hidden mt-4">
            <div style={{ borderColor: BORDER }} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold">
                  {calSelectedLabel}
                </h3>
                <span
                  style={{ background: BG, borderColor: BORDER, color: TEXT_SECONDARY, fontFamily: FONT_MONO }}
                  className="text-[11px] px-2 py-0.5 rounded-full border"
                >
                  Week {calSelectedInfo.weekType}
                </span>
              </div>
              {!calSelectedInfo.strength && !calSelectedInfo.cardio && calSelectedInfo.note && (
                <p style={{ color: TEXT_MUTED }} className="text-xs mt-1">
                  {calSelectedInfo.note}
                </p>
              )}
            </div>

            {/* Strength slot */}
            <div style={{ borderColor: BORDER, borderLeftColor: CATS.strength.color }} className="border-t border-l-4 px-4 py-3">
              <div className="flex items-center justify-between flex-wrap gap-y-1.5">
                <div className="flex items-center gap-2">
                  <Dumbbell size={14} style={{ color: CATS.strength.color }} />
                  <p style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-xs font-bold">
                    {calSelectedInfo.strength ? STRENGTH[calSelectedInfo.strength].label : "Strength"}
                  </p>
                  {calSelectedInfo.strengthMoved && (
                    <span
                      style={{ background: "rgba(227,162,60,0.14)", color: ACCENT_A, borderColor: "rgba(227,162,60,0.4)" }}
                      className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium"
                    >
                      Moved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {calSelectedInfo.strength && (
                    <button
                      onClick={() => setMoveSource(movingStrengthHere ? null : { date: calSelected, blockType: "strength" })}
                      style={{ color: ACCENT_A }}
                      className="text-[11px] font-semibold focus:outline-none focus-visible:underline"
                    >
                      ⇄ {movingStrengthHere ? "Cancel" : "Move"}
                    </button>
                  )}
                  <button
                    onClick={() => setEditingBlock(editingBlock === "strength" ? null : "strength")}
                    style={{ color: TEXT_SECONDARY }}
                    className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                  >
                    {calSelectedInfo.strength ? "Edit" : "+ Add"}
                  </button>
                  {calSelectedInfo.strengthMoved && (
                    <button
                      onClick={() => resetBlockOverride(calSelected, "strength")}
                      style={{ color: TEXT_MUTED }}
                      className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {editingBlock === "strength" && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {STRENGTH_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        setBlock(calSelected, "strength", opt.value);
                        setEditingBlock(null);
                      }}
                      style={{
                        background: calSelectedInfo.strength === opt.value ? CATS.strength.color : "transparent",
                        color: calSelectedInfo.strength === opt.value ? "#14171C" : TEXT_SECONDARY,
                        borderColor: calSelectedInfo.strength === opt.value ? CATS.strength.color : BORDER,
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border focus:outline-none focus-visible:ring-2"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {calSelectedInfo.strength ? (
                <div className="space-y-1.5 mt-2">
                  {STRENGTH[calSelectedInfo.strength].exercises.map((e, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span style={{ color: TEXT_PRIMARY }} className="text-xs flex-1">
                        {e.name}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] shrink-0">
                        {e.presc} · RPE {e.rpe}
                      </span>
                      {e.video && (
                        <a
                          href={e.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: CATS.strength.color }}
                          className="shrink-0 p-2 -m-2 focus:outline-none focus-visible:ring-2 rounded"
                          aria-label="Watch demonstration"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                editingBlock !== "strength" && (
                  <p style={{ color: TEXT_MUTED }} className="text-xs mt-2">
                    Not scheduled
                  </p>
                )
              )}
            </div>

            {/* Cardio slot */}
            <div style={{ borderColor: BORDER, borderLeftColor: CATS.cardio.color }} className="border-t border-l-4 px-4 py-3">
              <div className="flex items-center justify-between flex-wrap gap-y-1.5">
                <div className="flex items-center gap-2">
                  <Activity size={14} style={{ color: CATS.cardio.color }} />
                  <p style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-xs font-bold">
                    {calSelectedInfo.cardio
                      ? calSelectedInfo.cardio === "hard" && !calSelectedInfo.deload
                        ? "Norwegian 4×4 — Hard Intervals"
                        : calSelected.getDay() === 1
                        ? "Tennis Coaching"
                        : "Zone 2 — Steady State"
                      : "Cardio"}
                    {calSelectedInfo.cardio === "hard" && calSelectedInfo.deload && (
                      <span style={{ color: TEXT_MUTED, fontWeight: 400 }}> (deload — swapped from Hard)</span>
                    )}
                  </p>
                  {calSelectedInfo.cardioMoved && (
                    <span
                      style={{ background: "rgba(76,182,196,0.14)", color: CATS.cardio.color, borderColor: "rgba(76,182,196,0.4)" }}
                      className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium"
                    >
                      Moved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {calSelectedInfo.cardio && (
                    <button
                      onClick={() => setMoveSource(movingCardioHere ? null : { date: calSelected, blockType: "cardio" })}
                      style={{ color: CATS.cardio.color }}
                      className="text-[11px] font-semibold focus:outline-none focus-visible:underline"
                    >
                      ⇄ {movingCardioHere ? "Cancel" : "Move"}
                    </button>
                  )}
                  <button
                    onClick={() => setEditingBlock(editingBlock === "cardio" ? null : "cardio")}
                    style={{ color: TEXT_SECONDARY }}
                    className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                  >
                    {calSelectedInfo.cardio ? "Edit" : "+ Add"}
                  </button>
                  {calSelectedInfo.cardioMoved && (
                    <button
                      onClick={() => resetBlockOverride(calSelected, "cardio")}
                      style={{ color: TEXT_MUTED }}
                      className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {editingBlock === "cardio" && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {CARDIO_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        setBlock(calSelected, "cardio", opt.value);
                        setEditingBlock(null);
                      }}
                      style={{
                        background: calSelectedInfo.cardio === opt.value ? CATS.cardio.color : "transparent",
                        color: calSelectedInfo.cardio === opt.value ? "#14171C" : TEXT_SECONDARY,
                        borderColor: calSelectedInfo.cardio === opt.value ? CATS.cardio.color : BORDER,
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border focus:outline-none focus-visible:ring-2"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {calSelectedInfo.cardio ? (
                <div className="space-y-1.5 mt-2">
                  {(calSelectedInfo.cardio === "hard" && !calSelectedInfo.deload ? HARD_INTERVAL : ZONE2).map((step, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span style={{ color: TEXT_PRIMARY }} className="text-xs">
                        {calSelectedInfo.cardio !== "hard" && calSelected.getDay() === 1 ? "Tennis coaching session" : step.name}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] shrink-0 ml-2">
                        {withBpm(step.presc, step.pctMin, step.pctMax, settings.hrMax)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                editingBlock !== "cardio" && (
                  <p style={{ color: TEXT_MUTED }} className="text-xs mt-2">
                    Not scheduled
                  </p>
                )
              )}
            </div>

            {/* Extra Activity slot */}
            <div style={{ borderColor: BORDER, borderLeftColor: CATS.activity.color }} className="border-t border-l-4 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Footprints size={14} style={{ color: CATS.activity.color }} />
                <p style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-xs font-bold">
                  Extra Activity
                </p>
              </div>

              {calSelectedInfo.activities.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {calSelectedInfo.activities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2">
                      <span style={{ color: TEXT_PRIMARY }} className="text-xs">
                        {a.name}
                      </span>
                      <button
                        onClick={() => removeActivity(calSelected, a.id)}
                        aria-label={`Remove ${a.name}`}
                        style={{ color: TEXT_MUTED }}
                        className="shrink-0 p-1 rounded focus:outline-none focus-visible:ring-2"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={activityDraft}
                  onChange={(e) => setActivityDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addActivity(calSelected, activityDraft);
                      setActivityDraft("");
                    }
                  }}
                  placeholder="e.g. Tennis 60mins"
                  style={{ fontFamily: FONT_BODY, color: TEXT_PRIMARY, borderColor: BORDER, background: BG }}
                  className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus-visible:ring-2"
                />
                <button
                  onClick={() => {
                    addActivity(calSelected, activityDraft);
                    setActivityDraft("");
                  }}
                  style={{ background: CATS.activity.color, color: "#14171C" }}
                  className="shrink-0 text-xs font-semibold px-3 rounded-lg focus:outline-none focus-visible:ring-2"
                >
                  Add
                </button>
              </div>
              {calSelectedInfo.activities.length === 0 && (
                <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-1.5">
                  Anything not covered above — sports, extra cardio, a hike. Counts toward that day's training-day
                  nutrition target and shows up in the checklist and History.
                </p>
              )}
            </div>

            <div style={{ borderColor: BORDER, borderLeftColor: CATS.testing.color }} className="border-t border-l-4 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Gauge size={14} style={{ color: CATS.testing.color }} />
                <p style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-xs font-bold">
                  Testing
                </p>
              </div>
              {(() => {
                const calRec = log[dateKey(calSelected)];
                const loggedInBody = Boolean(calRec?.inbody) && Object.values(calRec.inbody).some((v) => v != null);
                const loggedVo2max = typeof calRec?.vo2max === "number";
                const rows = [
                  {
                    key: "testInBody",
                    label: "InBody scan",
                    due: calSelectedInfo.dueInBody,
                    moved: calSelectedInfo.dueInBodyMoved,
                    logged: loggedInBody,
                  },
                  {
                    key: "testVo2max",
                    label: "VO2max test",
                    due: calSelectedInfo.dueVo2max,
                    moved: calSelectedInfo.dueVo2maxMoved,
                    logged: loggedVo2max,
                  },
                ];
                return (
                  <div className="space-y-2.5">
                    {rows.map((r) => (
                      <div key={r.key}>
                        <div className="flex items-center justify-between gap-2">
                          <p style={{ color: r.due ? TEXT_PRIMARY : TEXT_MUTED }} className="text-xs">
                            {r.logged ? "✓ " : ""}
                            {r.label}
                            {r.due ? " — due" : r.logged ? " logged (off-cycle)" : ""}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setBlock(calSelected, r.key, !r.due)}
                              style={{ color: CATS.testing.color }}
                              className="text-[11px] font-semibold focus:outline-none focus-visible:underline"
                            >
                              {r.due ? "Not due" : "Mark due"}
                            </button>
                            {r.moved && (
                              <button
                                onClick={() => resetBlockOverride(calSelected, r.key)}
                                style={{ color: TEXT_MUTED }}
                                className="text-[11px] font-medium focus:outline-none focus-visible:underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                        {r.moved && (
                          <span
                            style={{ background: "rgba(76,182,196,0.14)", color: ACCENT_B, borderColor: "rgba(76,182,196,0.4)" }}
                            className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium inline-block mt-1"
                          >
                            Moved
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-2.5">
                Auto-calculated every 8 weeks (InBody) / 4 weeks (VO2max). Use "Mark due" / "Not due" to move a test to
                a different day — turn it off here, turn it on wherever you actually want it. Log results from Today.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History: Trends */}
      {view === "history" && (
        <div className="px-4 max-w-md mx-auto space-y-4">
          {historyRows.length === 0 ? (
            <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-6 text-center">
              <CalendarDays size={22} style={{ color: TEXT_MUTED }} className="mx-auto mb-2" />
              <p style={{ color: TEXT_PRIMARY }} className="text-sm font-medium">
                No history yet
              </p>
              <p style={{ color: TEXT_MUTED }} className="text-xs mt-1">
                Complete today's checklist and come back tomorrow — trends build up day by day.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl border p-3 text-center">
                  <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-lg font-semibold">
                    {historyRows.length}
                  </p>
                  <p style={{ color: TEXT_MUTED }} className="text-[10px] mt-0.5 uppercase tracking-wide">
                    Days logged
                  </p>
                </div>
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl border p-3 text-center">
                  <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-lg font-semibold">
                    {Math.round(avgPct * 100)}%
                  </p>
                  <p style={{ color: TEXT_MUTED }} className="text-[10px] mt-0.5 uppercase tracking-wide">
                    Avg · 30d
                  </p>
                </div>
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl border p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame size={14} style={{ color: ACCENT_A }} />
                    <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-lg font-semibold">
                      {streak}
                    </p>
                  </div>
                  <p style={{ color: TEXT_MUTED }} className="text-[10px] mt-0.5 uppercase tracking-wide">
                    Streak ≥80%
                  </p>
                </div>
              </div>

              <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-1">
                  This Cycle vs Last Cycle
                </h2>
                <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-3">
                  {cycleComparison.thisCycle.start.toLocaleDateString(undefined, { day: "numeric", month: "short" })} –{" "}
                  {cycleComparison.thisCycle.end.toLocaleDateString(undefined, { day: "numeric", month: "short" })} vs.
                  previous 14 days
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Strength sessions",
                      thisVal: cycleComparison.thisCycle.strengthSessions,
                      lastVal: cycleComparison.lastCycle.strengthSessions,
                      pct: cycleComparison.thisCycle.strengthPct,
                      color: CATS.strength.color,
                    },
                    {
                      label: "Cardio sessions",
                      thisVal: cycleComparison.thisCycle.cardioSessions,
                      lastVal: cycleComparison.lastCycle.cardioSessions,
                      pct: cycleComparison.thisCycle.cardioPct,
                      color: CATS.cardio.color,
                    },
                  ].map((row) => (
                    <div key={row.label}>
                      <p style={{ color: TEXT_SECONDARY }} className="text-[11px] mb-0.5">
                        {row.label}
                      </p>
                      <p style={{ fontFamily: FONT_MONO, color: row.color }} className="text-base font-semibold">
                        {row.thisVal}
                        <span style={{ color: TEXT_MUTED, fontSize: "11px" }}> vs {row.lastVal}</span>
                      </p>
                      {row.pct != null && (
                        <p style={{ color: TEXT_MUTED }} className="text-[10px]">
                          {Math.round(row.pct * 100)}% avg completion
                        </p>
                      )}
                    </div>
                  ))}
                  <div>
                    <p style={{ color: TEXT_SECONDARY }} className="text-[11px] mb-0.5">
                      Avg fat intake
                    </p>
                    <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-base font-semibold">
                      {cycleComparison.thisCycle.avgFat != null ? `${Math.round(cycleComparison.thisCycle.avgFat)}g` : "–"}
                      <span style={{ color: TEXT_MUTED, fontSize: "11px" }}>
                        {" "}
                        vs {cycleComparison.lastCycle.avgFat != null ? `${Math.round(cycleComparison.lastCycle.avgFat)}g` : "–"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p style={{ color: TEXT_SECONDARY }} className="text-[11px] mb-0.5">
                      Avg weight
                    </p>
                    <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-base font-semibold">
                      {cycleComparison.thisCycle.avgWeight != null ? `${cycleComparison.thisCycle.avgWeight.toFixed(1)} kg` : "–"}
                      <span style={{ color: TEXT_MUTED, fontSize: "11px" }}>
                        {" "}
                        vs {cycleComparison.lastCycle.avgWeight != null ? `${cycleComparison.lastCycle.avgWeight.toFixed(1)} kg` : "–"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {weightSeries.length > 0 && (
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold">
                      Bodyweight
                    </h2>
                    {latestWeight && (
                      <span style={{ fontFamily: FONT_MONO, color: TEXT_SECONDARY }} className="text-xs">
                        {latestWeight.weight} kg · {latestWeight.avg7} kg avg
                      </span>
                    )}
                  </div>
                  <div style={{ width: "100%", height: 160 }}>
                    <ResponsiveContainer>
                      <LineChart data={weightSeries} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                          axisLine={{ stroke: BORDER }}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={["dataMin - 1", "dataMax + 1"]}
                          tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={34}
                        />
                        <Tooltip
                          contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11 }}
                          labelStyle={{ color: TEXT_SECONDARY }}
                          formatter={(v, name) => [`${v} kg`, name === "weight" ? "Weigh-in" : "7-day avg"]}
                        />
                        <Line type="monotone" dataKey="weight" stroke={TEXT_MUTED} strokeWidth={1.5} dot={{ r: 2, fill: TEXT_MUTED }} />
                        <Line type="monotone" dataKey="avg7" stroke={ACCENT_A} strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-2">
                    Grey dots: daily weigh-ins. Amber line: 7-day rolling average — the one to actually watch.
                  </p>
                </div>
              )}

              {calorieData.length > 0 && (
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                  <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-3">
                    Calories vs Target
                  </h2>
                  <div style={{ width: "100%", height: 160 }}>
                    <ResponsiveContainer>
                      <LineChart data={calorieData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                          axisLine={{ stroke: BORDER }}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={["dataMin - 200", "dataMax + 200"]}
                          tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={38}
                        />
                        <Tooltip
                          contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11 }}
                          labelStyle={{ color: TEXT_SECONDARY }}
                          formatter={(v, name) => [`${v} kcal`, name === "actual" ? "Logged" : "Target"]}
                        />
                        <Line type="monotone" dataKey="target" stroke={TEXT_MUTED} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                        <Line type="monotone" dataKey="actual" stroke={CATS.nutrition.color} strokeWidth={2.5} dot={{ r: 2, fill: CATS.nutrition.color }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-2">
                    Dashed grey: that day's target (training vs rest). Rose: what you actually logged.
                  </p>
                </div>
              )}

              {stepSeries.length > 0 && (
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                  <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-3">
                    Step Target Rate
                  </h2>
                  <div style={{ width: "100%", height: 140 }}>
                    <ResponsiveContainer>
                      <LineChart data={stepSeries} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                          axisLine={{ stroke: BORDER }}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis domain={[0, 100]} tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip
                          contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11 }}
                          labelStyle={{ color: TEXT_SECONDARY }}
                          formatter={(v) => [`${v}%`, "7-day rate"]}
                        />
                        <Line type="monotone" dataKey="rate" stroke={CATS.check.color} strokeWidth={2.5} dot={false} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-2">
                    7-day rolling rate of hitting the 10,000-step target — smooths day-to-day noise into a trend.
                  </p>
                </div>
              )}

              {exercisesWithHistory.length > 0 && (
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold">
                      Max Weight Progression
                    </h2>
                    <select
                      value={selectedExerciseId || ""}
                      onChange={(e) => setSelectedExerciseId(e.target.value)}
                      style={{ fontFamily: FONT_BODY, color: TEXT_PRIMARY, background: BG, borderColor: BORDER }}
                      className="text-[11px] px-2 py-1 rounded-lg border max-w-[140px] focus:outline-none focus-visible:ring-2"
                    >
                      {exercisesWithHistory.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {maxWeightSeries.length > 1 ? (
                    <>
                      <div style={{ width: "100%", height: 150 }}>
                        <ResponsiveContainer>
                          <LineChart data={maxWeightSeries} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                            <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                            <XAxis
                              dataKey="label"
                              tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                              axisLine={{ stroke: BORDER }}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              domain={["dataMin - 2", "dataMax + 2"]}
                              tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              width={32}
                            />
                            <Tooltip
                              contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11 }}
                              labelStyle={{ color: TEXT_SECONDARY }}
                              formatter={(v) => [`${v} kg`, "Top set"]}
                            />
                            <Line type="monotone" dataKey="maxWeight" stroke={CATS.strength.color} strokeWidth={2.5} dot={{ r: 2, fill: CATS.strength.color }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-2">
                        Heaviest logged set for this exercise on each session it was done.
                      </p>
                    </>
                  ) : (
                    <p style={{ color: TEXT_MUTED }} className="text-xs">
                      Need at least two logged sessions of this exercise to show a trend.
                    </p>
                  )}
                </div>
              )}

              {symptomPatterns.symptomDays > 0 && (
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                  <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-1">
                    Symptom Patterns
                  </h2>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mb-3">
                    {symptomPatterns.symptomDays} day{symptomPatterns.symptomDays === 1 ? "" : "s"} with symptoms
                    logged — what happened the day before each one
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Strength session", key: "strength", color: CATS.strength.color },
                      { label: "Cardio session", key: "cardio", color: CATS.cardio.color },
                      { label: "Logged activity", key: "activity", color: CATS.activity.color },
                      { label: "None of the above", key: "unclear", color: TEXT_MUTED },
                    ].map((row) => {
                      const count = symptomPatterns.counts[row.key];
                      const pct = symptomPatterns.symptomDays ? Math.round((count / symptomPatterns.symptomDays) * 100) : 0;
                      return (
                        <div key={row.key} className="flex items-center gap-2">
                          <span style={{ background: row.color }} className="w-2 h-2 rounded-full shrink-0" />
                          <span style={{ color: TEXT_PRIMARY }} className="text-xs flex-1">
                            {row.label}
                          </span>
                          <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px] shrink-0">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-2.5">
                    Looks at the single prior day only — real cumulative effects (like two hard days close together)
                    won't show up here, so treat this as a starting point, not the full picture.
                  </p>
                </div>
              )}

              {(testHistory.inbody.length > 0 || testHistory.vo2max.length > 0) && (
                <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                  <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-3">
                    Test History
                  </h2>

                  {testHistory.vo2max.length > 0 && (
                    <div className="mb-3">
                      <p style={{ color: TEXT_SECONDARY }} className="text-[11px] uppercase tracking-wide mb-1.5">
                        VO2max
                      </p>
                      <div className="space-y-1">
                        {testHistory.vo2max.map((t, i) => {
                          const prev = testHistory.vo2max[i + 1];
                          const delta = prev ? Math.round((t.value - prev.value) * 10) / 10 : null;
                          return (
                            <div key={t.date} className="flex items-center justify-between text-xs">
                              <span style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }}>
                                {t.dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <span style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }}>
                                {t.value} mL/kg/min
                                {delta != null && (
                                  <span style={{ color: delta >= 0 ? CATS.mobility.color : CATS.nutrition.color }} className="ml-1.5">
                                    {delta >= 0 ? "+" : ""}
                                    {delta}
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {testHistory.inbody.length > 0 && (
                    <div>
                      <p style={{ color: TEXT_SECONDARY }} className="text-[11px] uppercase tracking-wide mb-1.5">
                        InBody
                      </p>
                      <div className="space-y-2">
                        {testHistory.inbody.map((t) => (
                          <div key={t.date}>
                            <p style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }} className="text-xs">
                              {t.dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-[11px] mt-0.5">
                              {t.smm != null && `SMM ${t.smm}kg `}
                              {t.pbf != null && `· BF ${t.pbf}% `}
                              {t.trunkFat != null && `· Trunk ${t.trunkFat}% `}
                              {t.ecw != null && `· ECW ${t.ecw}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-3">
                    Logged from the Testing &amp; Metrics section on Today. Showing the last 8 of each.
                  </p>
                </div>
              )}

              <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-3">
                  Overall Completion
                </h2>
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={ACCENT_A} />
                          <stop offset="100%" stopColor={ACCENT_B} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                        axisLine={{ stroke: BORDER }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[0, 100]} tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip
                        contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11 }}
                        labelStyle={{ color: TEXT_SECONDARY }}
                        itemStyle={{ color: TEXT_PRIMARY }}
                        formatter={(v) => [`${v}%`, "Complete"]}
                      />
                      <Line type="monotone" dataKey="overall" stroke="url(#lineGradient)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-3">
                  By Category
                </h2>
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                        axisLine={{ stroke: BORDER }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[0, 100]} tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip
                        contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11 }}
                        labelStyle={{ color: TEXT_SECONDARY }}
                      />
                      <Line type="monotone" dataKey="strength" name="Strength" stroke={CATS.strength.color} strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="cardio" name="Cardio" stroke={CATS.cardio.color} strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="mobility" name="Mobility" stroke={CATS.mobility.color} strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="nutrition" name="Nutrition" stroke={CATS.nutrition.color} strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="activity" name="Activity" stroke={CATS.activity.color} strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {["strength", "cardio", "mobility", "nutrition", "activity"].map((k) => (
                    <span key={k} className="flex items-center gap-1 text-[11px]" style={{ color: TEXT_SECONDARY }}>
                      <span style={{ background: CATS[k].color }} className="w-2 h-2 rounded-full inline-block" />
                      {CATS[k].label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border p-4">
                <h2 style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold mb-3">
                  Last 12 Weeks
                </h2>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {heatmapWeeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((cell) => (
                        <div
                          key={cell.date}
                          title={`${cell.date}${cell.pct === null ? "" : ` · ${Math.round(cell.pct * 100)}%`}`}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: cell.pct === null ? "transparent" : `rgba(${HEAT_RGB}, ${0.15 + cell.pct * 0.75})`,
                            border: `1px solid ${cell.pct === null ? BORDER : "transparent"}`,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span style={{ color: TEXT_MUTED }} className="text-[10px]">
                    Less
                  </span>
                  {[0.1, 0.35, 0.6, 0.85].map((o) => (
                    <span
                      key={o}
                      style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(${HEAT_RGB}, ${o})` }}
                    />
                  ))}
                  <span style={{ color: TEXT_MUTED }} className="text-[10px]">
                    More
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Program: full reference */}
      {view === "program" && (
        <div className="px-4 max-w-md mx-auto space-y-3">
          <p style={{ color: TEXT_MUTED }} className="text-xs">
            Full reference, built from the same data driving Today and Calendar — edit an exercise here (in the code) and it updates everywhere. Tap a section to expand.
          </p>

          <ProgramSection title="Goals" color={ACCENT_A} defaultOpen>
            {[
              ["Bodyweight", "85.4 kg", "85–87 kg (maintain, not bulk)"],
              ["Muscle", "42.0 kg SMM", "Increase, primarily trunk/upper"],
              ["VO2max", "38 mL/kg/min", "43 mL/kg/min (+13%)"],
              ["Knee", "No barbell squat/deadlift, no running", "Split squat, hip thrust, single-leg RDL, lunges cleared; bike/incline treadmill/stairs cleared"],
            ].map(([label, current, target]) => (
              <div key={label}>
                <p style={{ color: TEXT_PRIMARY }} className="text-xs font-semibold">
                  {label}
                </p>
                <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-0.5">
                  {current} → <span style={{ color: TEXT_SECONDARY }}>{target}</span>
                </p>
              </div>
            ))}
          </ProgramSection>

          <ProgramSection title="Injury Context" subtitle="Why the knee rules are what they are" color={TEXT_MUTED}>
            <p>
              <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Late 2023:</span> ACL tear + both menisci torn. ACL
              reconstructed with a hamstring autograft; menisci repaired same procedure.
            </p>
            <p>
              <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Nov 2025:</span> meniscus re-repair — the 2023 repair
              hadn't healed properly. Upper-body-only training Nov 2025–Jan 2026.
            </p>
            <p>
              <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Feb 2026–present:</span> new cartilage (chondral)
              lesion, femoral condyle — unoperated, ongoing. Running triggers joint swelling; cycling, incline walking,
              stairs, and the lifts in this program are cleared.
            </p>
            <p style={{ color: TEXT_MUTED }} className="text-xs">
              Practical read: running is out for its impact spike (~2.5×BW vs ~1.2×BW walking). Back squat/deadlift stay
              excluded separately — joint shear under axial load, tied to the meniscus/ACL history, not the cartilage lesion.
            </p>
          </ProgramSection>

          <ProgramSection title="Weekly Template" subtitle="Same every week — A and B are identical" color={CATS.strength.color}>
            <div>
              <div className="space-y-1">
                {[
                  ["Mon", "Tennis coaching — counts as Zone 2", "60 min"],
                  ["Tue", "Strength — Upper", "60–70 min"],
                  ["Wed", "Hard Intervals", "40–45 min"],
                  ["Thu", "Strength — Lower", "60–70 min"],
                  ["Fri", "Rest", "—"],
                  ["Sat", "Strength — Full Body + Zone 2", "90–110 min"],
                  ["Sun", "Hard Intervals", "40–45 min"],
                ].map(([day, session, dur]) => (
                  <div key={day} className="flex items-center justify-between text-xs">
                    <span style={{ color: TEXT_SECONDARY, fontFamily: FONT_MONO, width: 52 }} className="shrink-0">
                      {day}
                    </span>
                    <span style={{ color: TEXT_PRIMARY }} className="flex-1">
                      {session}
                    </span>
                    <span style={{ color: TEXT_MUTED, fontFamily: FONT_MONO }} className="shrink-0 ml-2">
                      {dur}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ color: TEXT_MUTED }} className="text-xs">
              3 strength + 2 hard interval + 2 Zone-2-equivalent (tennis + Saturday) sessions per week, every week.
              Deload swaps both Hard days to Zone 2 for that week — toggle it from Calendar's weekly "D" button.
              Adjust individual days from Calendar for travel or kid weeks; this table is the default, not a rule.
            </p>
          </ProgramSection>

          {["upper", "lower", "full"].map((k) => (
            <ProgramSection
              key={k}
              title={`Strength — ${STRENGTH[k].label}`}
              subtitle="3-week loading wave, 4th week deload (~40% volume cut, same intensity)"
              color={CATS.strength.color}
            >
              <div className="space-y-1.5">
                {STRENGTH[k].exercises.map((e, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-xs">
                    <span style={{ color: TEXT_PRIMARY }} className="flex-1">
                      {e.name}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="shrink-0">
                      {e.presc} · RPE {e.rpe}
                    </span>
                    {e.video && (
                      <a
                        href={e.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: CATS.strength.color }}
                        className="shrink-0 p-2 -m-2 focus:outline-none focus-visible:ring-2 rounded"
                        aria-label="Watch demonstration"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {k === "lower" && (
                <p style={{ color: TEXT_MUTED }} className="text-xs">
                  Hamstring autograft note: track single-leg RDL and hip thrust load/reps per leg independently — the
                  reconstructed side commonly runs a persistent deficit 1–2 years out. Let the weaker leg set the pace.
                </p>
              )}
              {k === "lower" && (
                <p style={{ color: TEXT_MUTED }} className="text-xs">
                  Leg extension note: open-chain, especially the last 30–40° into lockout, raises patellofemoral
                  compressive load more than the closed-chain work elsewhere here — worth limiting range (~90°–40°) or
                  confirming with your orthopedist given the active chondral lesion. Drop it first if you get any
                  discomfort or swelling from it specifically.
                </p>
              )}
              {(k === "upper" || k === "lower") && (
                <p style={{ color: TEXT_MUTED }} className="text-xs">
                  Core (weighted crunch + side plank hip lift) added here, mirroring where Full-Body already had it —
                  abs recover fast enough that 3×/week isn't a frequency concern.
                </p>
              )}
            </ProgramSection>
          ))}

          <ProgramSection
            title="No-Gym — Bodyweight + Band"
            subtitle="Optional substitute, not part of the fixed rotation"
            color={CATS.activity.color}
          >
            <p style={{ color: TEXT_MUTED }} className="text-xs">
              Not scheduled automatically — swap any Strength slot to this from Calendar (Edit → No-Gym) whenever
              you're away from a gym. Same push/pull/hinge/squat/core coverage as your regular days, no equipment
              required beyond a light resistance band for two of the ten exercises (row, pull-apart) — the rest work
              with just bodyweight.
            </p>
            <div className="space-y-1.5">
              {STRENGTH.bodyweight.exercises.map((e, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <span style={{ color: TEXT_PRIMARY }} className="flex-1">
                    {e.name}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="shrink-0">
                    {e.presc} · RPE {e.rpe}
                  </span>
                  {e.video && (
                    <a
                      href={e.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: CATS.activity.color }}
                      className="shrink-0 p-2 -m-2 focus:outline-none focus-visible:ring-2 rounded"
                      aria-label="Watch demonstration"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
            <p style={{ color: TEXT_MUTED }} className="text-xs">
              Progression works differently here than the double-progression scheme elsewhere: climb through the rep
              range first, and once every set is comfortably at the top of it, add band resistance or move to a
              harder variation (feet-elevated push-up, single-arm row, etc.) rather than adding external load.
              Movement patterns match your regular knee-safe exercises — no jumping or plyometric work, consistent
              with why running stays excluded.
            </p>
          </ProgramSection>

          <ProgramSection title="VO2max Protocol" subtitle="Norwegian 4×4 + Zone 2" color={CATS.cardio.color}>
            <div>
              <p style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-xs font-bold mb-1.5">
                Hard interval day
              </p>
              <div className="space-y-1">
                {HARD_INTERVAL.map((step, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span style={{ color: TEXT_PRIMARY }}>{step.name}</span>
                    <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="shrink-0 ml-2">
                      {withBpm(step.presc, step.pctMin, step.pctMax, settings.hrMax)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-xs font-bold mb-1.5">
                Zone 2 day
              </p>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: TEXT_PRIMARY }}>{ZONE2[0].name}</span>
                <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="shrink-0 ml-2">
                  {withBpm(ZONE2[0].presc, ZONE2[0].pctMin, ZONE2[0].pctMax, settings.hrMax)}
                </span>
              </div>
            </div>
            <p style={{ color: TEXT_MUTED }} className="text-xs">
              Assault bike, incline treadmill, stair machine, or XC ski — interval structure matters, not modality. Watch
              for joint swelling after stair sessions specifically when reintroducing hard intervals. Retest every 6–8
              weeks, same protocol/device as the 38 mL/kg/min baseline.
            </p>
          </ProgramSection>

          <ProgramSection title="Nutrition" subtitle="Rebuilt bottom-up: BMR + NEAT + session cost" color={CATS.nutrition.color}>
            <div className="grid grid-cols-2 gap-3">
              {["training", "rest"].map((k) => (
                <div key={k}>
                  <p style={{ color: TEXT_SECONDARY }} className="text-[11px] uppercase tracking-wide mb-1">
                    {k === "training" ? "Training day" : "Rest day"}
                  </p>
                  <p style={{ fontFamily: FONT_MONO, color: TEXT_PRIMARY }} className="text-xs">
                    &lt; {NUTRITION_TARGETS[k].cal} kcal
                  </p>
                  <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px]">
                    P &gt;{NUTRITION_TARGETS[k].protein}g · F &lt;{NUTRITION_TARGETS[k].fat}g · C &lt;{NUTRITION_TARGETS[k].carbs}g
                  </p>
                </div>
              ))}
            </div>
            <p style={{ color: TEXT_MUTED }} className="text-xs">
              Build: 1,950 BMR + ~500 desk-job NEAT ≈ 2,450 baseline, + ~500 per session (strength or hard cardio) ≈
              training day. Protein holds above the ~1.62 g/kg plateau regardless of day type; the difference is all in
              carbs. Track the 7-day rolling weight average, not daily weigh-ins — adjust ±150 kcal if it drifts outside
              85–87 kg for 2+ consecutive weeks.
            </p>
          </ProgramSection>

          <ProgramSection title="Daily Mobility Flow" subtitle="~10 min, evening default" color={CATS.mobility.color}>
            <div className="space-y-1.5">
              {MOBILITY.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs gap-2">
                  <span style={{ color: TEXT_PRIMARY }} className="flex-1">
                    {m.name}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="shrink-0">
                    {m.presc}
                  </span>
                  <a
                    href={m.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: CATS.mobility.color }}
                    className="shrink-0 p-2 -m-2 focus:outline-none focus-visible:ring-2 rounded"
                    aria-label="Watch demonstration"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
            <p style={{ color: TEXT_MUTED }} className="text-xs">
              Unloaded/bodyweight only — no rolling over the kneecap, patellar tendon, or joint line, and no forced
              deep-flexion holds given the chondral lesion.
            </p>
          </ProgramSection>

          <ProgramSection title="Monitoring Cadence" color={CATS.check.color}>
            <div className="space-y-1.5 text-xs">
              <p>
                <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Daily:</span>{" "}
                <span style={{ color: TEXT_MUTED }}>weigh-in → 7-day rolling average, mobility flow</span>
              </p>
              <p>
                <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Every 6–8 weeks:</span>{" "}
                <span style={{ color: TEXT_MUTED }}>VO2max retest, same protocol as baseline</span>
              </p>
              <p>
                <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Every 8–12 weeks:</span>{" "}
                <span style={{ color: TEXT_MUTED }}>InBody rescan — SMM trend, trunk fat %, ECW ratio</span>
              </p>
              <p>
                <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>Every 4th week:</span>{" "}
                <span style={{ color: TEXT_MUTED }}>deload — strength volume ~40% down, VO2max zone 2 only</span>
              </p>
            </div>
          </ProgramSection>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Styling --------------------------------- */

const BG = "#10131A";
const CARD = "#1A1F29";
const BORDER = "#2A3140";
const TEXT_PRIMARY = "#EEF0F3";
const TEXT_SECONDARY = "#8891A3";
const TEXT_MUTED = "#5C6577";
const ACCENT_A = "#E3A23C";
const ACCENT_B = "#4CB6C4";
const HEAT_RGB = "111,207,151";

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const FONT_BODY = "'IBM Plex Sans', system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      html, body, #root { background: ${BG}; min-height: 100%; }
      body { margin: 0; }
    `}</style>
  );
}

function ProgramSection({ title, subtitle, color, defaultOpen, children }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ borderLeftColor: color || BORDER }}
        className="w-full text-left border-l-4 px-4 py-3 flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
      >
        <div>
          <p style={{ fontFamily: FONT_DISPLAY, color: TEXT_PRIMARY }} className="text-sm font-bold">
            {title}
          </p>
          {subtitle && (
            <p style={{ color: TEXT_MUTED }} className="text-[11px] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{ color: TEXT_MUTED, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease", flexShrink: 0 }}
        />
      </button>
      {open && (
        <div style={{ borderColor: BORDER, color: TEXT_PRIMARY, fontFamily: FONT_BODY }} className="border-t px-4 py-3 text-sm space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
