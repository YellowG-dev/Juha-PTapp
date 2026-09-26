/**
 * Juha — config. Theme, labels, storage, and the Program tab copy.
 * app.jsx is byte-identical across all three apps; everything that differs
 * between clients lives here and in core/program-juha.js.
 *
 * Theme kept as the v3.1 dark amber/teal so the app looks unchanged.
 */
import { THEMES, buildTheme } from "./core/themes.js";
import React from "react";
import { Dumbbell, Activity, Wind, Utensils, Scale, Footprints, Gauge, Flower2 } from "lucide-react";
import PROGRAM_DATA, {
  MOBILITY, BLOCKS, SLOT_OPTIONS, SLOT_META, APP_VERSION, NUTRITION_TARGETS, SCHEDULE,
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

// Supabase connection. Safe to commit — the publishable key is designed to be
// public and only says "a browser is calling". Row-level security is what
// protects the data. NEVER put the sb_secret_ key here.
export const SUPABASE_URL = "https://qpkdqyazdzhoohowkouy.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VCvYuYUAC9Dnf3kiLNB93g_tP_5c473";

// Which theme this client opens with. Every palette now lives in
// core/themes.js, shared byte-identically by all three repos; this file keeps
// only what is genuinely per-client.
export const DEFAULT_THEME_ID = "amber-slate";

// Categories are CLIENT data, not theme data. The three apps do not have the
// same ones, or even the same number of them, so a theme cannot own this list
// without carrying categories the other apps never show.
// The theme supplies colours; this file decides which categories exist.
// A category written as ACCENT or ACCENT_2 follows the ACTIVE theme's accents,
// so switching theme recolours it along with everything else. A category with a
// fixed hex keeps that colour in every theme.
function catsFor({ ACCENT, ACCENT_2 }) {
  return {
    strength: { label: "Strength", color: ACCENT, Icon: Dumbbell },
    cardio: { label: "Cardio", color: ACCENT_2, Icon: Activity },
    tennis: { label: "Tennis", color: "#6FCF97", Icon: Activity },
    yoga: { label: "Yoga", color: "#A99BC9", Icon: Flower2 },
    mobility: { label: "Mobility", color: "#7FB88F", Icon: Wind },
    nutrition: { label: "Nutrition", color: "#C97388", Icon: Utensils },
    check: { label: "Check", color: "#8891A3", Icon: Scale },
    rest: { label: "Rest", color: "#8891A3", Icon: Scale },
    activity: { label: "Activity", color: "#9C8CF0", Icon: Footprints },
    testing: { label: "Testing", color: "#5B9BD5", Icon: Gauge },
  };
}

/** Everything app.jsx needs for one theme, carrying this client's categories. */
export function makeTheme(id) {
  const known = THEMES[id] ? id : DEFAULT_THEME_ID;
  return buildTheme(known, catsFor(THEMES[known]));
}

export const THEME = makeTheme(DEFAULT_THEME_ID);

/* ------------------------------ Program tab ------------------------------- */
// The week table below is GENERATED from SCHEDULE, not hand-written. Change the
// schedule in core/program-juha.js and this tab follows automatically. The
// previous version was a hand-typed mirror and drifted the moment the program
// changed — don't reintroduce that.

const DOW = [
  [1, "Mon"], [2, "Tue"], [3, "Wed"], [4, "Thu"], [5, "Fri"], [6, "Sat"], [0, "Sun"],
];

// Every read below is guarded. This view is the fallback for a programme with
// no programView, and a delivered programme can rename or drop a block, so an
// unguarded read here is a white screen on the Program tab rather than a
// missing line. core/program-view.jsx is the guarded path for delivered data.
function labelFor(slot, value) {
  const opt = (SLOT_OPTIONS[slot] || []).find((o) => o.value === value);
  const name = opt ? opt.label : value;
  return `${(SLOT_META[slot] || {}).label || slot} — ${name}`;
}

function dayLine(day) {
  const parts = [];
  for (const slot of ["strength", "cardio", "tennis"]) {
    if (day && day[slot]) parts.push(labelFor(slot, day[slot]));
  }
  if (!parts.length) return (day && day.note) || "Rest";
  return parts.join(" + ");
}

export function ProgramView({ Section, ExerciseList, theme }) {
  const { ACCENT: A, ACCENT_2: B, TEXT_MUTED, TEXT_SECONDARY, FONT_MONO, CATS } = theme;
  const week = (SCHEDULE && SCHEDULE.A) || {};

  return (
    <div className="px-4 max-w-md mx-auto space-y-3">
      <Section title="This block" subtitle="7 Sep – 18 Oct 2026" color={A} defaultOpen>
        <p className="text-xs">
          Three balanced full-body sessions — A, B and C — instead of an upper/lower/full split. Every session covers
          the whole body, so a week with only two of them still trains everything.
        </p>
        <div className="space-y-1 text-xs">
          <p style={{ color: TEXT_SECONDARY }} className="font-semibold">Baseline week — this must happen</p>
          <p style={{ color: TEXT_MUTED }}>2 strength · 1 Norwegian 4×4 · 1 Zone 2 · 1 tennis</p>
        </div>
        <div className="space-y-1 text-xs">
          <p style={{ color: TEXT_SECONDARY }} className="font-semibold">Upside — good weeks only, in this order</p>
          <p style={{ color: TEXT_MUTED }}>
            1. A second Norwegian 4×4 — the highest-value session for the VO2max target.<br />
            2. The third strength session.<br />
            3. A second Zone 2, or extra tennis.
          </p>
        </div>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          The upside sessions buy hypertrophy and aerobic gain. They are not needed to prevent regression, so a
          two-session week is a normal week, not a failed one.
        </p>
      </Section>

      <Section title="The week" subtitle="Default rhythm — everything is movable" color={A} defaultOpen>
        <div className="space-y-1 text-xs">
          {DOW.map(([dow, name]) => (
            <div key={dow} className="flex items-center justify-between gap-2">
              <span style={{ fontFamily: FONT_MONO, color: TEXT_SECONDARY, width: 44 }} className="shrink-0">{name}</span>
              <span className="flex-1">{dayLine(week[dow])}</span>
            </div>
          ))}
        </div>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Move anything from the Calendar — the app tracks what you actually did, not what was planned. This table is
          generated from the schedule itself, so it can never disagree with the app.
        </p>
      </Section>

      {["a", "b", "c"].map((k) => {
        const blk = BLOCKS.strength?.[k];
        return blk && (
          <Section key={k} title={blk.label} subtitle={blk.subtitle} color={A}>
            <ExerciseList exercises={blk.exercises || []} color={A} />
          </Section>
        );
      })}

      <Section title="Exercise rules" subtitle="Why the program looks the way it does" color={A}>
        <p className="text-xs">
          <span style={{ color: TEXT_SECONDARY }} className="font-semibold">Permanently excluded:</span>{" "}
          barbell back squat, conventional deadlift, running, chest flys, walking lunge, standing calf raise (seated
          only), cable crunch. The first three are knee history; the rest are equipment or preference.
        </p>
        <p className="text-xs">
          <span style={{ color: TEXT_SECONDARY }} className="font-semibold">Leg extension — 90° to 45° only, no lock-out.</span>{" "}
          Open-chain knee extension puts peak patellofemoral stress and peak anterior tibial translation in the last
          0–30°, which is the wrong place for an unoperated condyle lesion plus a hamstring-autograft ACL. Hold at 3
          sets per session. If the knee swells within 48h of an A or B session, drop the extension and keep the curl.
        </p>
        <p className="text-xs">
          <span style={{ color: TEXT_SECONDARY }} className="font-semibold">Single-leg work:</span>{" "}
          log the weaker leg and let it set the pace. Weight usually stays the same and reps differ — note the
          difference on the exercise.
        </p>
        <p className="text-xs">
          <span style={{ color: TEXT_SECONDARY }} className="font-semibold">Progression:</span>{" "}
          double progression. Work up through the rep range; when every set hits the top at target RPE, add load and
          drop back to the bottom. Pull-ups are the exception — add reps before adding load.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Face pull is kept as a rear-delt and external-rotation movement, not a fly. It is the only direct
          counterweight to 11 pressing sets per rotation plus overhead tennis load.
        </p>
      </Section>

      <Section title="No-Gym — Bodyweight + Band" subtitle="Swap any strength day to this when travelling" color={CATS.activity.color}>
        <ExerciseList exercises={BLOCKS.strength?.bodyweight?.exercises || []} color={CATS.activity.color} />
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Progression works differently here. Climb the rep range first; once every set sits comfortably at the top,
          add band resistance or move to a harder variation rather than adding load.
        </p>
      </Section>

      <Section title="Cardio — 4×4 and Zone 2" color={B}>
        <ExerciseList exercises={(BLOCKS.cardio?.hard?.exercises || []).filter((e) => !e.type)} color={B} />
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Zones run off a recorded peak of 179 bpm, not the age prediction — set Max HR to 179 in Settings and the
          percentages turn into real bpm. Treat it as a floor: if any session records a higher peak, raise it.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Assault bike for the 4×4, not the incline treadmill — the 26 Aug session left swelling behind the knee.
          Revisit the treadmill only after four clear weeks.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Intensity is not the problem: 6 of 6 sessions last block hit or beat target. Frequency is the only lever
          left, which is why a second 4×4 outranks a third strength session.
        </p>
      </Section>

      <Section title="Tennis" subtitle="Monday lesson · social play any time" color={CATS.tennis.color}>
        <p className="text-xs">
          The Monday coached lesson has its own slot, so it moves and clears like any other session. Social tennis
          with friends goes in as an extra activity from the Calendar.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Genuine Zone 3–4 work at roughly 115 average and 140–150 peak, but it is play, not a substitute for the
          4×4. Both log peak and average heart rate into the same series as your other cardio.
        </p>
      </Section>

      <Section title="Nutrition" color={CATS.nutrition.color}>
        <div className="grid grid-cols-2 gap-3">
          {["training", "rest"].map((k) => (
            <div key={k}>
              <p style={{ color: TEXT_SECONDARY }} className="text-[11px] uppercase tracking-wide mb-1">
                {k === "training" ? "Training day" : "Rest day"}
              </p>
              <p style={{ fontFamily: FONT_MONO }} className="text-xs">&lt; {(NUTRITION_TARGETS[k] || {}).cal} kcal</p>
              <p style={{ fontFamily: FONT_MONO, color: TEXT_MUTED }} className="text-[11px]">
                P &gt;{(NUTRITION_TARGETS[k] || {}).protein}g · F &lt;{(NUTRITION_TARGETS[k] || {}).fat}g · C &lt;{(NUTRITION_TARGETS[k] || {}).carbs}g
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs">
          Built from a measured TDEE of about 2,500 kcal — 2,530 average intake produced roughly 0.5 kg of net mass
          over seven weeks. Protein sits at 2.2 g/kg, comfortably above the ~1.6 g/kg plateau.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Hold 85.5–86.5 kg on the 7-day rolling average, never the daily number. Above 87.0 for two consecutive
          weeks, cut 150 kcal from rest days only. Below 85.0 for two consecutive weeks, add 150 kcal to training days.
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
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Volume is not the concern here. Timing is: alcohol blunts overnight muscle protein synthesis, so keep it
          off the two nights following a strength session.
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

      <Section title="Deload" subtitle="Week of 28 Sep in this block" color={A}>
        <p className="text-xs">
          The D button beside each week in the Calendar drops one set from every exercise while keeping the weight the
          same, and swaps hard intervals for Zone 2. A dashed outline marks roughly every fourth week as a suggestion.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          No deload was taken in the previous five-week block. The week of 28 Sep is not optional this time.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          It stays a suggestion on purpose. Whether you need a deload depends on how the last three weeks actually
          felt, which a calendar has no way of knowing.
        </p>
      </Section>

      <Section title="Testing" subtitle="InBody every 8 weeks · VO2max every 4" color={CATS.testing.color}>
        <p className="text-xs">
          Both are calculated from the 6 Sep 2026 baseline and appear on Today when due. To move one, turn it off in
          the Calendar and turn it on wherever you actually want it.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Retest VO2max on the same protocol and machine as the baseline, or the number means nothing.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Block targets from the 6 Sep baseline: SMM 42.9 → 43.0–43.2 kg · body fat 13.6 → 13.0–13.5% · weight
          85.5–86.5 kg · VO2max 39 → 40. Expect a smaller SMM increment than last block — part of the previous +0.9 kg
          was glycogen and its water, not contractile tissue.
        </p>
      </Section>

      <Section title="Daily mobility" subtitle="~10 min · order is the design" color={CATS.mobility.color}>
        <ExerciseList exercises={MOBILITY || []} color={CATS.mobility.color} />
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          Items 1–5 take about five minutes and are the daily non-negotiable core. Completion fell steadily by list
          position last block, so the items that matter most for the knee and low back now sit at the top. If you stop
          at item 5 on a bad day, you have done the ones that count.
        </p>
        <p style={{ color: TEXT_MUTED }} className="text-xs">
          No end-range hamstring stretching on the non-surgical side. The tightness there is asymptomatic and stable;
          stretching into it is the most likely way to turn it into a symptom.
        </p>
      </Section>
    </div>
  );
}
