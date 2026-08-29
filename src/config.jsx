/**
 * Juha — config. Theme, labels, storage, and the Program tab copy.
 * app.jsx is byte-identical across all three apps; everything that differs
 * between clients lives here and in core/program-juha.js.
 *
 * Theme kept as the v3.1 dark amber/teal so the app looks unchanged.
 */
import React from "react";
import { Dumbbell, Activity, Wind, Utensils, Scale, Footprints, Gauge } from "lucide-react";
import PROGRAM_DATA, {
  MOBILITY, BLOCKS, SLOT_OPTIONS, SLOT_META, APP_VERSION, NUTRITION_TARGETS,
} from "./core/program-juha.js";

export { MOBILITY, BLOCKS, SLOT_OPTIONS, SLOT_META, APP_VERSION };

export const PROGRAM = PROGRAM_DATA;
export const CLIENT_LABEL = "Juha · Daily Log";
// Tags rows in the shared backup sheet. Must match the tab name.
export const CLIENT_NAME = "Juha";

// localStorage is scoped per ORIGIN, not per path, so all three apps on
// yellowg-dev.github.io share one bucket. UNCHANGED from v3.1 on purpose —
// changing it would orphan every logged day.
export const STORAGE_PREFIX = "ptAppParent_";

export const START_DATE = new Date(2026, 6, 27);
export const RAMP_WEEKS = 0; // already training; no easing-in period

export const BACKUP_URL = "";

const ACCENT = "#E3A23C";   // amber
const ACCENT_2 = "#4CB6C4"; // teal

export const THEME = {
  BG: "#10131A",
  CARD: "#1A1F29",
  BORDER: "#2A3140",
  TEXT_PRIMARY: "#EEF0F3",
  TEXT_SECONDARY: "#8891A3",
  TEXT_MUTED: "#5C6577",
  ACCENT,
  ACCENT_2,
  HEAT_RGB: "111,207,151",
  FONT_DISPLAY: "'Space Grotesk', system-ui, sans-serif",
  FONT_BODY: "'IBM Plex Sans', system-ui, sans-serif",
  FONT_MONO: "'IBM Plex Mono', ui-monospace, monospace",
  FONT_IMPORT:
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
  CATS: {
    strength: { label: "Strength", color: ACCENT, Icon: Dumbbell },
    cardio: { label: "Cardio", color: ACCENT_2, Icon: Activity },
    tennis: { label: "Tennis", color: "#6FCF97", Icon: Activity },
    mobility: { label: "Mobility", color: "#7FB88F", Icon: Wind },
    nutrition: { label: "Nutrition", color: "#C97388", Icon: Utensils },
    check: { label: "Check", color: "#8891A3", Icon: Scale },
    rest: { label: "Rest", color: "#8891A3", Icon: Scale },
    activity: { label: "Activity", color: "#9C8CF0", Icon: Footprints },
    testing: { label: "Testing", color: "#5B9BD5", Icon: Gauge },
  },
};

/* ------------------------------ Program tab ------------------------------- */

export function ProgramView({ Section, ExerciseList, theme }) {
  const { ACCENT: A, ACCENT_2: B, TEXT_MUTED, TEXT_SECONDARY, FONT_MONO, CATS } = theme;
  return (
    <div className="px-4 max-w-md mx-auto space-y-3">
      <Section title="The week" subtitle="3 strength · 3 cardio · 1 tennis lesson" color={A} defaultOpen>
        <div className="space-y-1 text-xs">
          {[
            ["Mon", "Tennis lesson", "60 min"],
            ["Tue", "Strength — Upper", "60–70 min"],
            ["Wed", "Cardio — Hard intervals", "40–45 min"],
            ["Thu", "Strength — Lower", "60–70 min"],
            ["Fri", "Rest", "—"],
            ["Sat", "Strength — Full Body + Zone 2", "90 min"],
            ["Sun", "Cardio — Hard intervals", "40–45 min"],
          ].map(([d, s, dur]) => (
            <div key={d} className="flex items-center justify-between gap-2">
              <span style={{ fontFamily: FONT_MONO, color: TEXT_SECONDARY, width: 44 }} className="shrink-0">{d}</span>
              <span className="flex-1">{s}</span>
              <span style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="shrink-0">{dur}</span>
            </div>
          ))}
        </div>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          This is the default rhythm, not a rule. Move anything from the Calendar — the app tracks what you actually
          did, not what was planned.
        </p>
      </Section>

      {["upper", "lower", "full"].map((k) => (
        <Section key={k} title={BLOCKS.strength[k].label} color={A}>
          <ExerciseList exercises={BLOCKS.strength[k].exercises} color={A} />
        </Section>
      ))}

      <Section title="No-Gym — Bodyweight + Band" subtitle="Swap any strength day to this when travelling" color={CATS.activity.color}>
        <ExerciseList exercises={BLOCKS.strength.bodyweight.exercises} color={CATS.activity.color} />
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Progression works differently here. Climb the rep range first; once every set sits comfortably at the top,
          add band resistance or move to a harder variation rather than adding load.
        </p>
      </Section>

      <Section title="Cardio — 4×4 and Zone 2" color={B}>
        <ExerciseList exercises={BLOCKS.cardio.hard.exercises.filter((e) => !e.type)} color={B} />
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Assault bike, incline treadmill, stair machine or XC ski — the interval structure matters, not the machine.
          Set your Max HR in Settings and the percentages turn into actual bpm targets.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Watch for swelling behind the knee after stair sessions specifically when reintroducing hard intervals.
        </p>
      </Section>

      <Section title="Tennis" subtitle="Monday lesson · social play any time" color={CATS.tennis.color}>
        <p className="text-xs">
          The Monday coached lesson has its own slot, so it moves and clears like any other session. Social tennis
          with friends goes in as an extra activity from the Calendar.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Both log peak and average heart rate into the same series as your other cardio, so the trend stays whole.
        </p>
      </Section>

      <Section title="Nutrition" color={CATS.nutrition.color}>
        <div className="grid grid-cols-2 gap-3">
          {["training", "rest"].map((k) => (
            <div key={k}>
              <p style={{ color: TEXT_SECONDARY }} className="text-[11px] uppercase tracking-wide mb-1">
                {k === "training" ? "Training day" : "Rest day"}
              </p>
              <p style={{ fontFamily: FONT_MONO }} className="text-xs">&lt; {NUTRITION_TARGETS[k].cal} kcal</p>
              <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px]">
                P &gt;{NUTRITION_TARGETS[k].protein}g · F &lt;{NUTRITION_TARGETS[k].fat}g · C &lt;{NUTRITION_TARGETS[k].carbs}g
              </p>
            </div>
          ))}
        </div>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Watch the 7-day rolling weight average, never the daily number. Adjust by ±150 kcal only if it drifts
          outside the target range for two consecutive weeks.
        </p>
      </Section>

      <Section title="Alcohol" color={CATS.check.color}>
        <p className="text-xs">
          One unit is one beer, a 12 cl glass of wine, or 4 cl of spirits — the Finnish standard portion, 12 g of
          pure alcohol. Pick the type, enter how many. "None" logs a zero in one tap.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          The chart shows a running 7-day total, because the week is the unit that means anything. The dashed line
          sits at 14 units, THL's moderate-risk level for men — context, not a target to reach.
        </p>
      </Section>

      <Section title="Skip days" color={CATS.check.color}>
        <p className="text-xs">
          Mark a day Sick, Travel or Injured and it clears that day's strength, cardio, tennis and extra activities.
          Mobility, nutrition and the daily check stay — they matter most when everything else stops.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Your streak pauses rather than breaks, and nothing is deleted: unmark the day and it returns exactly as it
          was. Nutrition drops to rest-day targets automatically.
        </p>
      </Section>

      <Section title="Deload" color={A}>
        <p className="text-xs">
          The D button beside each week in the Calendar trims volume ~40% while keeping the weight the same. A dashed
          outline marks roughly every fourth week as a suggestion.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          It stays a suggestion on purpose. Whether you need a deload depends on how the last three weeks actually
          felt, which a calendar has no way of knowing.
        </p>
      </Section>

      <Section title="Testing" subtitle="InBody every 8 weeks · VO2max every 4" color={CATS.testing.color}>
        <p className="text-xs">
          Both are calculated from the 12 Jun 2026 baseline and appear on Today when due. To move one, turn it off in
          the Calendar and turn it on wherever you actually want it.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Retest VO2max on the same protocol and machine as the baseline, or the number means nothing.
        </p>
      </Section>

      <Section title="Daily mobility" subtitle="~10 min" color={CATS.mobility.color}>
        <ExerciseList exercises={MOBILITY} color={CATS.mobility.color} />
      </Section>
    </div>
  );
}
