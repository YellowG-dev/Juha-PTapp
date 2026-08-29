/**
 * Juha — program data.
 *
 * Ported from pt-program-live.jsx v3.1. Exercise ids, names, prescriptions,
 * RPEs and video links were lifted programmatically from the monolith, not
 * retyped, so nothing drifted in the move.
 *
 * Two deliberate changes to the structure, neither of which alters what he
 * actually does:
 *
 *  1. TENNIS IS ITS OWN SLOT. In v3.1 the Monday coached lesson was a
 *     hardcoded `today.getDay() === 1 && cardio === "zone2"` relabel inside
 *     buildSections. That meant a lesson moved off Monday displayed as
 *     "Zone 2", and there was nowhere to log one that moved — on 7 Aug he had
 *     to record it as a free-text activity. As a slot it moves, clears and
 *     skips like anything else. It carries cat: "cardio" so it keeps
 *     aggregating into the cardio trend line rather than forking his history.
 *     Social tennis with friends stays where it belongs: an extra activity.
 *
 *  2. ALCOHOL. Type picker plus a unit count. One unit = one beer, one 12 cl
 *     glass of wine, or 4 cl of spirits — which is also the Finnish standard
 *     portion (12 g pure alcohol), so the weekly total is directly comparable
 *     to public guidance. Separate from nutrition entirely.
 */

export const PROGRAM_ID = "juha";
export const CLIENT_NAME = "Juha";
export const APP_VERSION = "4.0.0";

/* --------------------------------- Slots --------------------------------- */
// Order matters: it is the order sections appear on Today and rows appear in
// the Calendar day detail.
export const SLOTS = ["strength", "cardio", "tennis"];

/* ------------------------------- Strength -------------------------------- */

const UPPER = {
  label: "Upper — Push + Pull",
  cat: "strength",
  exercises: [
      { id: "up-1", name: "Incline DB press", presc: "4×6–10 · RPE 7–9", sets: 4, video: "https://www.youtube.com/watch?v=hChjZQhX1Ls" },
      { id: "up-2", name: "Pull-up / lat pulldown", presc: "4×6–10 · RPE 7–9", sets: 4, video: "https://www.youtube.com/watch?v=vw5Xmu5CIew" },
      { id: "up-3", name: "Seated DB overhead press", presc: "3×8–12 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=fuQpuu--bMI" },
      { id: "up-4", name: "Chest-supported / cable row", presc: "3×10–15 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=vmX58YYK3-8" },
      { id: "up-5", name: "Lateral raise", presc: "3×12–15 · RPE 8", sets: 3, video: "https://www.youtube.com/watch?v=nnH63icHYXY" },
      { id: "up-8", name: "Weighted crunch or hanging knee raise", presc: "3×12–15 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=Pxkw6dUt_Ok" },
      { id: "up-9", name: "Weighted side plank hip lift", presc: "3×12–15/side · RPE 7", sets: 3, video: "https://www.youtube.com/watch?v=V4A0wIh5HNk" },
      { id: "up-6", name: "Overhead triceps extension", presc: "3×10–15 · RPE 8", sets: 3, video: "https://www.youtube.com/watch?v=O7e8j8K3cJo" },
      { id: "up-7", name: "Biceps curl", presc: "3×10–15 · RPE 8", sets: 3, video: "https://www.youtube.com/watch?v=6DeLZ6cbgWQ" },
  ],
};

const LOWER = {
  label: "Lower — Knee-safe",
  cat: "strength",
  exercises: [
      { id: "lo-1", name: "Bulgarian split squat", presc: "4×8–12/leg · RPE 7–9", sets: 4, video: "https://www.youtube.com/watch?v=hiLF_pF3EJM" },
      { id: "lo-2", name: "Barbell hip thrust", presc: "4×8–12 · RPE 7–9", sets: 4, video: "https://www.youtube.com/watch?v=S_uZP4UH6J0" },
      { id: "lo-3", name: "Single-leg RDL (DB)", presc: "3×8–12/leg · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=18CzQrq-Z7I" },
      { id: "lo-10", name: "Machine single-leg extension", presc: "3×10–15/leg · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=tTbJBUKnWU8" },
      { id: "lo-5", name: "Machine leg curl", presc: "3×10–15 · RPE 8", sets: 3, video: "https://www.youtube.com/watch?v=hqI59xXChFk" },
      { id: "lo-8", name: "Weighted crunch or hanging knee raise", presc: "3×12–15 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=Pxkw6dUt_Ok" },
      { id: "lo-9", name: "Weighted side plank hip lift", presc: "3×12–15/side · RPE 7", sets: 3, video: "https://www.youtube.com/watch?v=V4A0wIh5HNk" },
      { id: "lo-11", name: "Calf raise — standing or seated, alternate", presc: "3–4×10–15 · RPE 8", sets: 3, video: "https://www.youtube.com/watch?v=SVtg-1loH4c" },
  ],
};

const FULL = {
  label: "Full Body — Lagging parts",
  cat: "strength",
  exercises: [
      { id: "fb-1", name: "Incline DB press", presc: "3×8–12 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=hChjZQhX1Ls" },
      { id: "fb-2", name: "Dip / DB pullover", presc: "3×8–12 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=8UugSoVJLag" },
      { id: "fb-3", name: "Face pull", presc: "3×15–20 · RPE 7", sets: 3, video: "https://www.youtube.com/watch?v=0Po47vvj9g4" },
      { id: "fb-4", name: "Hip thrust / single-leg press", presc: "3×10–15 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=S_uZP4UH6J0" },
      { id: "fb-5", name: "Weighted crunch or hanging knee raise", presc: "5×12–15 · RPE 8", sets: 5, video: "https://www.youtube.com/watch?v=Pxkw6dUt_Ok" },
      { id: "fb-6", name: "Biceps curl", presc: "2×12–15 · RPE 8", sets: 2, video: "https://www.youtube.com/watch?v=6DeLZ6cbgWQ" },
      { id: "fb-7", name: "Overhead triceps extension", presc: "2×12–15 · RPE 8", sets: 2, video: "https://www.youtube.com/watch?v=O7e8j8K3cJo" },
      { id: "fb-8", name: "Calf raise — standing or seated, alternate", presc: "3–4×10–15 · RPE 8", sets: 3, video: "https://www.youtube.com/watch?v=SVtg-1loH4c" },
  ],
};

const BODYWEIGHT = {
  label: "No-Gym — Bodyweight + Band",
  cat: "strength",
  subtitle: "Away from the gym — same shape, no equipment",
  exercises: [
      { id: "bw-1", name: "Push-up", presc: "3×12–20 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=WDIpL0pjun0" },
      { id: "bw-2", name: "Pike push-up", presc: "3×8–12 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=XckEEwa1BPI" },
      { id: "bw-3", name: "Band row", presc: "3×12–15 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=ysAjxPSFC7M" },
      { id: "bw-4", name: "Band pull-apart", presc: "3×15–20 · RPE 7", sets: 3, video: "https://www.youtube.com/watch?v=WqdNDTTe-9g" },
      { id: "bw-5", name: "Bodyweight Bulgarian split squat", presc: "3×12–15/leg · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=hiLF_pF3EJM" },
      { id: "bw-6", name: "Single-leg RDL (bodyweight)", presc: "3×10–15/leg · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=18CzQrq-Z7I" },
      { id: "bw-7", name: "Single-leg hip thrust", presc: "3×12–15/leg · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=qCObDXTe4KY" },
      { id: "bw-8", name: "Standing calf raise (bodyweight)", presc: "3×15–20 · RPE 8", sets: 3, video: "https://www.youtube.com/watch?v=SVtg-1loH4c" },
      { id: "bw-9", name: "Crunch or hanging knee raise", presc: "3×15–20 · RPE 7–8", sets: 3, video: "https://www.youtube.com/watch?v=p9hhX_Sx5v0" },
      { id: "bw-10", name: "Side plank hip lift", presc: "3×12–15/side · RPE 7", sets: 3, video: "https://www.youtube.com/watch?v=V4A0wIh5HNk" },
  ],
};

/* -------------------------------- Cardio --------------------------------- */
// pctMin/pctMax drive the bpm conversion: with Max HR set in Settings the
// engine renders "4 min @ 90–95% HRmax (158–166 bpm)".
//
// cv-hr-peak / cv-hr-avg are shared across every cardio-type block on
// purpose. Only one cardio session happens per day, so there is no collision,
// and the HR history stays one continuous series across intervals, Zone 2 and
// tennis rather than three disconnected ones.

const HR_TASKS = [
  { id: "cv-hr-peak", type: "number", unit: "bpm", name: "Peak heart rate", presc: "Highest bpm this session" },
  { id: "cv-hr-avg", type: "number", unit: "bpm", name: "Average heart rate", presc: "Session average bpm" },
];

const HARD = {
  label: "Norwegian 4×4 — Hard Intervals",
  cat: "cardio",
  gentlerNote: "Deload week — run this as Zone 2 instead",
  exercises: [
    { id: "cv-warm", name: "Warm-up", presc: "10 min easy", sets: null },
    { id: "cv-i1", name: "Interval 1", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95, sets: null },
    { id: "cv-r1", name: "Recovery 1", presc: "3 min @ 50–60% HRmax", pctMin: 50, pctMax: 60, sets: null },
    { id: "cv-i2", name: "Interval 2", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95, sets: null },
    { id: "cv-r2", name: "Recovery 2", presc: "3 min @ 50–60% HRmax", pctMin: 50, pctMax: 60, sets: null },
    { id: "cv-i3", name: "Interval 3", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95, sets: null },
    { id: "cv-r3", name: "Recovery 3", presc: "3 min @ 50–60% HRmax", pctMin: 50, pctMax: 60, sets: null },
    { id: "cv-i4", name: "Interval 4", presc: "4 min @ 90–95% HRmax", pctMin: 90, pctMax: 95, sets: null },
    { id: "cv-cool", name: "Cool-down", presc: "5–10 min easy", sets: null },
    ...HR_TASKS,
  ],
};

const ZONE2 = {
  label: "Zone 2 — Steady State",
  cat: "cardio",
  exercises: [
    { id: "cv-z2", name: "Zone 2 continuous", presc: "45–60 min @ 60–70% HRmax", pctMin: 60, pctMax: 70, sets: null },
    ...HR_TASKS,
  ],
};

/* -------------------------------- Tennis --------------------------------- */

const LESSON = {
  label: "Tennis — Coached Lesson",
  cat: "cardio",
  subtitle: "Weekly session with the coach",
  exercises: [
    { id: "tn-1", name: "Tennis lesson", presc: "60 min · with coach", sets: null },
    ...HR_TASKS,
  ],
};

const SOCIAL = {
  label: "Tennis — Social Play",
  cat: "cardio",
  subtitle: "Playing with friends",
  exercises: [
    { id: "tn-2", name: "Tennis", presc: "60–90 min", sets: null },
    ...HR_TASKS,
  ],
};

/* -------------------------------- Wiring --------------------------------- */

export const BLOCKS = {
  strength: { upper: UPPER, lower: LOWER, full: FULL, bodyweight: BODYWEIGHT },
  cardio: { hard: HARD, zone2: ZONE2 },
  tennis: { lesson: LESSON, social: SOCIAL },
};

export const SLOT_OPTIONS = {
  strength: [
    { value: null, label: "None" },
    { value: "upper", label: "Upper" },
    { value: "lower", label: "Lower" },
    { value: "full", label: "Full Body" },
    { value: "bodyweight", label: "No-Gym" },
  ],
  cardio: [
    { value: null, label: "None" },
    { value: "hard", label: "Hard Intervals" },
    { value: "zone2", label: "Zone 2" },
  ],
  tennis: [
    { value: null, label: "None" },
    { value: "lesson", label: "Coached lesson" },
    { value: "social", label: "Social play" },
  ],
};

export const SLOT_META = {
  strength: { label: "Strength", color: "#E3A23C" },
  cardio: { label: "Cardio", color: "#4CB6C4" },
  tennis: { label: "Tennis", color: "#6FCF97" },
};

/* ------------------------------- Schedule -------------------------------- */
// Week A and B are intentionally identical — this rhythm holds every week
// regardless of the A/B cycle. Real-world exceptions get handled per-day via
// Calendar overrides, not by diverging the templates.
//
// Monday's cardio slot is now empty and the tennis slot carries the lesson.
// The session is unchanged; it simply has its own name and its own row.

const WEEK = {
  1: { strength: null, cardio: null, tennis: "lesson" },
  2: { strength: "upper", cardio: null, tennis: null },
  3: { strength: null, cardio: "hard", tennis: null },
  4: { strength: "lower", cardio: null, tennis: null },
  5: { strength: null, cardio: null, tennis: null, note: "Rest day" },
  6: { strength: "full", cardio: "zone2", tennis: null },
  0: { strength: null, cardio: "hard", tennis: null },
};

export const SCHEDULE = { A: WEEK, B: WEEK };

/* ------------------------------- Mobility -------------------------------- */

export const MOBILITY = [
  { id: "mob-1", name: "Cat–Cow → thoracic rotation", presc: "60s · Bodyweight", video: "https://www.youtube.com/watch?v=YPTKZy_kKt8" },
  { id: "mob-2", name: "Thoracic extension over roller", presc: "60s · Foam roller", video: "https://www.youtube.com/watch?v=9Y11Kc0E0og" },
  { id: "mob-3", name: "Lat sweep", presc: "60s · Foam roller", video: "https://www.youtube.com/watch?v=NOiM2TSjoMM" },
  { id: "mob-4", name: "Pec minor / anterior shoulder release", presc: "60s (30/side) · Ball", video: "https://www.youtube.com/watch?v=Vj83BnZpTwk" },
  { id: "mob-5", name: "Shoulder CARs", presc: "45s · Bodyweight", video: "https://www.youtube.com/watch?v=Ag1yVYbPXeg" },
  { id: "mob-6", name: "Half-kneeling hip flexor + reach", presc: "90s (45/side) · Mat/pad", video: "https://www.youtube.com/watch?v=KyoK4Rf6_bE" },
  { id: "mob-7", name: "Quad roll", presc: "60s (30/side) · Foam roller", video: "https://www.youtube.com/watch?v=cv57kA6rktc" },
  { id: "mob-8", name: "Glute / piriformis release", presc: "90s (45/side) · Ball", video: "https://www.youtube.com/watch?v=7x6EFeWiyL4" },
  { id: "mob-9", name: "Ankle dorsiflexion rock + calf roll", presc: "75s · Wall + roller", video: "https://www.youtube.com/watch?v=Y1IZXkdPPdw" },
];

/* ------------------------------- Nutrition ------------------------------- */

export const NUTRITION_TARGETS = {
  training: { cal: 3000, protein: 180, fat: 90, carbs: 368 },
  rest: { cal: 2700, protein: 180, fat: 90, carbs: 293 },
};

const macroTasks = (isTrainingDay) => {
  const t = isTrainingDay ? NUTRITION_TARGETS.training : NUTRITION_TARGETS.rest;
  return [
    { id: "nut-cal", type: "number", unit: "kcal", name: "Calories", target: t.cal, direction: "under", presc: "< " + t.cal + " kcal" },
    { id: "nut-pro", type: "number", unit: "g", name: "Protein", target: t.protein, direction: "over", presc: "> " + t.protein + " g" },
    { id: "nut-fat", type: "number", unit: "g", name: "Fat", target: t.fat, direction: "under", presc: "< " + t.fat + " g" },
    { id: "nut-carb", type: "number", unit: "g", name: "Carbs", target: t.carbs, direction: "under", presc: "< " + t.carbs + " g" },
  ];
};

/* -------------------------------- Alcohol -------------------------------- */
// A "choice" task: pick a type, then enter a count if it is not None.
// Choosing None writes 0 to the count in one tap, so a dry day costs one
// press rather than a typed zero — otherwise the friction quietly kills the
// habit of logging it at all.

export const ALCOHOL_OPTIONS = [
  { value: "none", label: "None", zero: true },
  { value: "wine", label: "Wine" },
  { value: "beer", label: "Beer" },
  { value: "other", label: "Other" },
];

export const ALCOHOL_WEEKLY_REFERENCE = 14;

/* --------------------------- Daily sections ------------------------------ */

export const DAILY = [
  {
    key: "mobility",
    cat: "mobility",
    title: "Daily Mobility Flow",
    subtitle: "~10 min · evening default, morning is fine too",
    tasks: MOBILITY.map((m) => ({ id: m.id, name: m.name, presc: m.presc, video: m.video })),
  },
  {
    key: "nutrition",
    cat: "nutrition",
    title: (ctx) => "Nutrition — " + (ctx.isTrainingDay ? "Training day" : "Rest day"),
    tasks: (ctx) => macroTasks(ctx.isTrainingDay),
  },
  {
    key: "check",
    cat: "check",
    title: "Daily Check",
    subtitle: null,
    tasks: [
      { id: "chk-weigh", type: "number", unit: "kg", name: "Morning weigh-in", presc: "7-day rolling avg" },
      { id: "chk-walk", name: "Walk 10,000 steps", presc: "Daily step target" },
      { id: "chk-water", name: "Drink 3 L water", presc: "Daily hydration target" },
      {
        id: "chk-knee",
        type: "scale",
        name: "Knee symptoms",
        presc: "1 = none · 2 = mild · 3 = moderate · 4 = severe",
        scale: [1, 2, 3, 4],
      },
      {
        id: "chk-alcohol",
        type: "choice",
        name: "Alcohol",
        presc: "1 unit = 1 beer · 12 cl wine · 4 cl spirits",
        options: ALCOHOL_OPTIONS,
        countId: "chk-alc-units",
        countUnit: "units",
        countLabel: "How many?",
        zeroOption: "none",
      },
      { id: "chk-notes", type: "notes", name: "Notes", presc: "Optional — how the day felt" },
    ],
  },
];

/* -------------------------------- Testing -------------------------------- */
// Anchored to the Sunday on/after the documented 12 Jun 2026 InBody baseline.
// InBody every 8 weeks, VO2max every 4 — they coincide every other VO2max
// cycle. Move either one with "Mark due" / "Not due" in the Calendar.

const TEST_ANCHOR = new Date(2026, 5, 14);

export const TESTING = {
  key: "testing",
  cat: "testing",
  title: "Testing & Metrics",
  items: [
    {
      id: "inbody",
      label: "InBody scan",
      anchor: TEST_ANCHOR,
      everyDays: 56,
      tasks: [
        { id: "test-smm", type: "number", unit: "kg", name: "Skeletal muscle mass", presc: "SMM, kg" },
        { id: "test-pbf", type: "number", unit: "%", name: "Body fat", presc: "Percent body fat" },
        { id: "test-trunk", type: "number", unit: "%", name: "Trunk fat", presc: "Trunk fat percent" },
        { id: "test-ecw", type: "number", unit: "", name: "ECW ratio", presc: "Extracellular water ratio" },
      ],
    },
    {
      id: "vo2max",
      label: "VO2max test",
      anchor: TEST_ANCHOR,
      everyDays: 28,
      tasks: [
        { id: "test-vo2max", type: "number", unit: "mL/kg/min", name: "VO2max", presc: "Same protocol as baseline" },
      ],
    },
  ],
};

/* -------------------------------- Program -------------------------------- */

export const PROGRAM = {
  id: PROGRAM_ID,
  clientName: CLIENT_NAME,
  slots: SLOTS,
  blocks: BLOCKS,
  schedule: SCHEDULE,
  daily: DAILY,
  testing: TESTING,
  restLabel: "Rest Day",
  restSubtitle: "No training scheduled — mobility and nutrition still apply",
  gentlerNote: "Deload week — cut sets ~40%, same intensity",
  // SUGGESTION ONLY. Every 4th week from Mon 27 Jul 2026 gets a dashed
  // outline in the Calendar and a "usually your deload week" tooltip. It does
  // not switch a deload on — the weekly D toggle does that, exactly as in
  // v3.1. Deloading answers how the last three weeks actually felt, which the
  // calendar has no way of knowing.
  deloadWave: { anchor: new Date(2026, 6, 27), cycleWeeks: 4, deloadWeek: 3 },
  deloadAnchor: null,
  // UI flags. showDeloadToggle draws the weekly D column in the Calendar;
  // usesHeartRate reveals the Max HR field in Settings.
  showDeloadToggle: true,
  usesHeartRate: true,
  tracking: {
    scales: [{ id: "chk-knee", label: "Knee symptoms", max: 4, chart: true, rolling: 7 }],
    numbers: [
      { id: "chk-weigh", label: "Bodyweight", unit: "kg", chart: true, rolling: 7 },
      { id: "nut-cal", label: "Calories", unit: "kcal", chart: true, target: "nutrition" },
      { id: "cv-hr-peak", label: "Peak HR", unit: "bpm", chart: true },
      { id: "cv-hr-avg", label: "Average HR", unit: "bpm", chart: true },
      { id: "test-vo2max", label: "VO2max", unit: "mL/kg/min", chart: true },
      { id: "test-smm", label: "Skeletal muscle mass", unit: "kg", chart: true },
      { id: "test-pbf", label: "Body fat", unit: "%", chart: true },
      {
        id: "chk-alc-units",
        label: "Alcohol",
        unit: "units",
        chart: true,
        rollingTotal: 7,
        reference: ALCOHOL_WEEKLY_REFERENCE,
        referenceLabel: "14 units/wk — THL moderate-risk level for men",
      },
    ],
    rates: [{ id: "chk-walk", label: "Step target", rolling: 7 }],
  },
};

export default PROGRAM;
