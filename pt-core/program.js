// Extracted verbatim from pt-program-live.jsx v3.1 — no logic changes.
// Pure JavaScript: no React, no DOM, no browser APIs. Safe to import from
// the web app, a React Native app, or a Node script.

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

// NOTE — changed from the original. The original CATS carried an `Icon:`
// field holding a lucide-react component, which cannot live in a
// platform-neutral module (React Native uses lucide-react-native). Labels and
// colours stay here; the UI layer maps each key to its own icon component.
export const CATEGORIES = {
  strength: { label: "Strength", color: "#E3A23C" },
  cardio: { label: "Cardio", color: "#4CB6C4" },
  mobility: { label: "Mobility", color: "#7FB88F" },
  nutrition: { label: "Nutrition", color: "#C97388" },
  check: { label: "Check", color: "#8891A3" },
  activity: { label: "Activity", color: "#9C8CF0" },
  testing: { label: "Testing", color: "#5B9BD5" },
};

export {
  APP_VERSION,
  CHANGELOG,
  STRENGTH,
  HARD_INTERVAL,
  ZONE2,
  MOBILITY,
  SCHEDULE,
  STRENGTH_OPTIONS,
  CARDIO_OPTIONS,
  NUTRITION_TARGETS,
};
