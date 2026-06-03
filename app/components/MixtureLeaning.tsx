"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../LanguageContext";
import SectionHeader from "./SectionHeader";
import TechnicalDetail from "./TechnicalDetail";
import { useEngineSound } from "./useEngineSound";

// --- Leaning model ----------------------------------------------------------
// Mixture m ∈ [0,1]: 1 = full rich (red knob full in), 0 = idle cut-off (full
// out). Same push-in-is-more convention as the throttle. None of these numbers
// come from the POH — the O-200 shipped without an EGT and the manual gives the
// leaning procedure in words, not curves. The shapes here teach the technique:
// EGT climbs to a peak at `peakMixture`, the peak lands somewhere mid-dial (not
// at the end of the arc), and the engine runs rough once you lean past it.
const TEMP_MIN = 1150; // °F at the cool end of the dial
const TEMP_MAX = 1550; // °F at the hot end of the dial
const TEMP_SPAN = TEMP_MAX - TEMP_MIN;
const EGT_CURVE = 600; // °F the charge cools per unit² of mixture away from peak
const ROP_TARGET = 50; // °F rich of peak we want the student to land on
const ROP_TOL = 15; // ± tolerance on that 50°F
const POWER_OFFSET = 0.09; // best-power mixture is this much richer than peak EGT
const ROUGH_MARGIN = 0.06; // roughness starts this far lean of the peak
const STALL_MIXTURE = 0.05; // at/below this the engine is starved (idle cut-off)
const STALL_CUT_MS = 2000; // sputter this long after cut-off, then the engine dies

// Thermocouple lag on the EGT needle: the probe has thermal mass, so it is slow
// to heat and quicker to cool. Time constants (seconds) for a first-order lag;
// RPM and engine sound have no such lag and stay near-instant.
const EGT_TAU_RISE = 0.55; // climbing temperature settles in ~1.5 s
const EGT_TAU_FALL = 0.18; // falling temperature settles in ~0.5 s
const EGT_TAU_COOL = 1.3; // slow exhaust cool-down after the engine is shut down

type ScenarioKey = "taxi" | "takeoffLanding" | "cruise" | "shutdown";

interface ScnConfig {
  peakMixture: number;
  peakTemp: number;
  target: readonly [number, number] | null; // positional target; null for cruise
  baseRpm: number;
  // Non-cruise EGT reading (0..1 on the dial). The peak-EGT curve only matters
  // in cruise; on the ground and at high power the needle just sits at a steady
  // reading and the leaning game is positional, so we drive it from this.
  egtIdle: number;
}

const SCN: Record<ScenarioKey, ScnConfig> = {
  taxi: { peakMixture: 0.1, peakTemp: 1250, target: [0.8, 0.92], baseRpm: 1000, egtIdle: 0.26 },
  takeoffLanding: { peakMixture: 0.1, peakTemp: 1360, target: [0.96, 1.01], baseRpm: 2300, egtIdle: 0.42 },
  cruise: { peakMixture: 0.52, peakTemp: 1430, target: null, baseRpm: 2480, egtIdle: 0 },
  shutdown: { peakMixture: 0.1, peakTemp: 1250, target: [0, 0.05], baseRpm: 1000, egtIdle: 0.3 },
};
const SCENARIO_KEYS: ScenarioKey[] = ["taxi", "takeoffLanding", "cruise", "shutdown"];
// Shutdown starts from the leaned-for-taxi position; the task is to pull the
// rest of the way to cut-off.
const SHUTDOWN_START = 0.85;

const COLOR = { ok: "#10b981", warn: "#f59e0b", bad: "#ef4444", bug: "#fbbf24" };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function egtTempFor(m: number, peakMixture: number, peakTemp: number) {
  return clamp(peakTemp - EGT_CURVE * (m - peakMixture) ** 2, TEMP_MIN, TEMP_MAX);
}

function tempToNorm(temp: number) {
  return clamp((temp - TEMP_MIN) / TEMP_SPAN, 0, 1);
}

function roughnessFor(m: number, peakMixture: number) {
  const onset = peakMixture - ROUGH_MARGIN;
  if (m >= onset) return 0;
  return clamp(((onset - m) / Math.max(onset, 0.01)) * 1.8, 0, 1);
}

function rpmFor(m: number, peakMixture: number, baseRpm: number) {
  const powerPeak = Math.min(1, peakMixture + POWER_OFFSET);
  const bestPowerProx = clamp(1 - 6 * (m - powerPeak) ** 2, 0, 1);
  const rough = roughnessFor(m, peakMixture);
  const rpm = baseRpm * (1 + 0.015 * bestPowerProx - 0.3 * rough);
  return Math.round(rpm / 10) * 10;
}

// --- EGT gauge geometry -----------------------------------------------------
const EGT_ARC = { start: -120, end: 120 }; // 240° sweep, cool (left) → hot (right)
const TICK_COUNT = 16; // one tick every 25°F across the 400°F span

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  // Round to 3 decimals so the SSR and browser renders are byte-identical and
  // do not trip a hydration mismatch (same trick as the tachometer).
  return {
    x: Math.round((cx + r * Math.cos(angleRad)) * 1000) / 1000,
    y: Math.round((cy + r * Math.sin(angleRad)) * 1000) / 1000,
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function normToAngle(norm: number) {
  return EGT_ARC.start + clamp(norm, 0, 1) * (EGT_ARC.end - EGT_ARC.start);
}

export default function MixtureLeaning() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  // Gate audio on the interactive controls being on screen, not the whole
  // section. This section is tall enough that 30% of it never fits a phone
  // viewport at once, so anchoring `audioInView` to <section> kept the engine
  // muted on mobile. The controls block is short, so 30% is always visible
  // while you are actually working the knob.
  const controlsRef = useRef<HTMLDivElement>(null);
  const audioInView = useInView(controlsRef, { amount: 0.3 });
  const { t } = useI18n();

  const [activeKey, setActiveKey] = useState<ScenarioKey>("taxi");
  const [mixture, setMixture] = useState(1); // full rich
  // Random peak for the cruise scenario. Seeded deterministically so SSR and
  // the first client render agree; an effect re-rolls it once mounted. The peak
  // varies in both knob position and temperature, so it lands at a different
  // spot on the dial every time and the student cannot just memorise it.
  const [cruisePeakMixture, setCruisePeakMixture] = useState(0.52);
  const [cruisePeakTemp, setCruisePeakTemp] = useState(1430);
  const [bugTemp, setBugTemp] = useState(TEMP_MIN); // peak bug, driven by the gauge knob
  const [engineOff, setEngineOff] = useState(false); // shut down at idle cut-off

  const isCruise = activeKey === "cruise";
  const peakMixture = isCruise ? cruisePeakMixture : SCN[activeKey].peakMixture;
  const peakTemp = isCruise ? cruisePeakTemp : SCN[activeKey].peakTemp;

  const egtTemp = egtTempFor(mixture, peakMixture, peakTemp);
  const egtNorm = isCruise ? tempToNorm(egtTemp) : SCN[activeKey].egtIdle;
  const roughness = roughnessFor(mixture, peakMixture);
  const rpm = rpmFor(mixture, peakMixture, SCN[activeKey].baseRpm);
  const stalled = mixture <= STALL_MIXTURE; // fuel starved, engine about to quit

  // New scenario → back to full rich and park the bug at the bottom. Cruise
  // gets a fresh random peak each time you enter it.
  useEffect(() => {
    setMixture(activeKey === "shutdown" ? SHUTDOWN_START : 1);
    setBugTemp(TEMP_MIN);
    if (activeKey === "cruise") {
      setCruisePeakMixture(0.42 + Math.random() * 0.2);
      setCruisePeakTemp(1380 + Math.random() * 90);
    }
  }, [activeKey]);

  const reroll = useCallback(() => {
    setCruisePeakMixture(0.42 + Math.random() * 0.2);
    setCruisePeakTemp(1380 + Math.random() * 90);
    setBugTemp(TEMP_MIN);
    setMixture(1);
  }, []);

  // The gauge knob nudges the peak bug up or down (°F per step).
  const handleBugChange = useCallback(
    (delta: number) =>
      setBugTemp((prev) => clamp(prev + delta, TEMP_MIN, TEMP_MAX)),
    [],
  );

  // Pull to idle cut-off and the engine sputters, then dies a couple seconds
  // later. Enrich again and it comes back.
  useEffect(() => {
    if (!stalled) {
      setEngineOff(false);
      return;
    }
    const id = setTimeout(() => setEngineOff(true), STALL_CUT_MS);
    return () => clearTimeout(id);
  }, [stalled]);

  // EGT needle: a first-order lag toward the model value, slower on the way up
  // than down, so it behaves like a real thermocouple. Once the engine is shut
  // down there is no more combustion and the exhaust cools off slowly. Latest
  // targets live in refs so the animation loop never has to restart.
  const needleEgt = useMotionValue(0);
  const egtTargetRef = useRef(egtNorm);
  egtTargetRef.current = egtNorm;
  const coolingRef = useRef(engineOff);
  coolingRef.current = engineOff;
  useEffect(() => {
    if (!isInView) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (!last) last = ts;
      const dt = Math.min(0.1, (ts - last) / 1000); // clamp after tab switches
      last = ts;
      const cooling = coolingRef.current;
      const target = cooling ? 0 : egtTargetRef.current;
      const cur = needleEgt.get();
      const tau = cooling
        ? EGT_TAU_COOL
        : target > cur
          ? EGT_TAU_RISE
          : EGT_TAU_FALL;
      needleEgt.set(cur + (target - cur) * (1 - Math.exp(-dt / tau)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, needleEgt]);
  const needleAngle = useTransform(needleEgt, (n) => normToAngle(n));

  const trend = useMemo(() => {
    const dp = mixture - peakMixture;
    if (dp >= 0.2) return t.mixture.trend.rich;
    if (dp > 0.03) return t.mixture.trend.rising;
    if (dp >= -0.03) return t.mixture.trend.peak;
    return t.mixture.trend.lean;
  }, [mixture, peakMixture, t]);

  const verdict = useMemo(() => {
    const fb = t.mixture.feedback;
    if (isCruise) {
      // Scored on the real mixture, not the bug — the bug is just a visual aid.
      if (mixture <= peakMixture)
        return roughness > 0.12
          ? { text: fb.rough, color: COLOR.bad }
          : { text: fb.stillLean, color: COLOR.warn };
      const delta = peakTemp - egtTemp; // °F below the peak, on the rich side
      if (delta >= ROP_TARGET - ROP_TOL && delta <= ROP_TARGET + ROP_TOL)
        return { text: fb.okCruise, color: COLOR.ok };
      if (delta > ROP_TARGET + ROP_TOL) return { text: fb.tooFarRich, color: COLOR.warn };
      return { text: fb.leanToRop, color: COLOR.warn };
    }
    const target = SCN[activeKey].target!;
    if (mixture >= target[0] && mixture <= target[1]) {
      const ok =
        activeKey === "taxi"
          ? fb.okTaxi
          : activeKey === "shutdown"
            ? fb.okShutdown
            : fb.okTakeoffLanding;
      return { text: ok, color: COLOR.ok };
    }
    if (mixture > target[1])
      return {
        text: activeKey === "shutdown" ? fb.cutoffPull : fb.rich,
        color: COLOR.warn,
      };
    if (roughness > 0.12) return { text: fb.rough, color: COLOR.bad };
    return { text: fb.lean, color: COLOR.warn };
  }, [isCruise, peakTemp, peakMixture, mixture, egtTemp, roughness, activeKey, t]);

  // Engine audio: pitch from RPM, plus roughness lean of peak (the "áspero" cue).
  // Goes silent once the engine has been shut down at idle cut-off.
  const engine = useEngineSound({
    rpm,
    roughness,
    inView: audioInView,
    silenced: engineOff,
  });

  const displayRpm = engineOff ? 0 : rpm;

  const handleMixtureChange = useCallback(
    (v: number) => {
      setMixture(clamp(v, 0, 1));
      engine.poke();
    },
    [engine],
  );

  const scenarioCopy = t.mixture.scenarios[activeKey];
  const onTarget = verdict.color === COLOR.ok; // student nailed the scenario

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="mixture" title={t.mixture.title}>
            <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
              {t.mixture.lead}
            </p>
            <TechnicalDetail label={t.controls.detail}>
              <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
                {t.mixture.intro}
              </p>
            </TechnicalDetail>
            <p className="mt-4 text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
              {t.mixture.intro2}
            </p>
            <div className="mt-4 inline-flex items-start gap-3 p-4 bg-[#1f2937]/5 border-l-2 border-[#1f2937]/30 text-sm text-[#57534e] max-w-2xl">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#6b0f1a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>{t.mixture.callout}</div>
            </div>
          </SectionHeader>
        </motion.div>

        {/* Scenario pills — sticky bar on mobile, regular on desktop. */}
        <div className="lg:hidden sticky top-0 z-30 -mx-6 px-6 py-3 mb-3 bg-[#f4efe6]/95 backdrop-blur-md border-y border-[#1f2937]/15 shadow-sm">
          <ScenarioPills
            active={activeKey}
            onChange={setActiveKey}
            scenarios={t.mixture.scenarios}
            labelText={t.mixture.scenarioLabel}
          />
        </div>
        <div className="hidden lg:block mb-3">
          <ScenarioPills
            active={activeKey}
            onChange={setActiveKey}
            scenarios={t.mixture.scenarios}
            labelText={t.mixture.scenarioLabel}
          />
        </div>

        {/* Scenario context — read the situation before touching the knob. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1f2937] text-[#f4efe6] p-4 lg:p-5 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="aviation-mono text-[10px] tracking-[0.2em] opacity-50 mb-1">
              {t.mixture.scenarioLabel}
            </div>
            {isCruise ? (
              <button
                type="button"
                onClick={reroll}
                className="aviation-mono text-[10px] tracking-[0.1em] px-3 py-1.5 border border-[#f4efe6]/25 hover:border-[#f4efe6]/60 transition-colors cursor-pointer flex-shrink-0"
              >
                ↻ {t.mixture.retry}
              </button>
            ) : null}
          </div>
          <div className="aviation-header text-lg lg:text-xl mb-2">
            {scenarioCopy.title}
          </div>
          <p className="text-sm leading-relaxed opacity-90 mb-3">
            {scenarioCopy.scene}
          </p>
          <p className="text-sm leading-relaxed opacity-90 pt-3 border-t border-[#f4efe6]/15">
            {scenarioCopy.explain}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            ref={controlsRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-4 sm:gap-6 order-1"
          >
            <EgtGauge
              needleAngle={needleAngle}
              bugNorm={isCruise ? tempToNorm(bugTemp) : null}
              showKnob={isCruise}
              onBugChange={handleBugChange}
              labels={t.mixture.egt}
              bugLabels={t.mixture.bug}
              onTarget={onTarget}
            />
            <MixtureLever
              mixture={mixture}
              onChange={handleMixtureChange}
              labels={t.mixture.lever}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-6 order-2"
          >
            <div
              className="p-4 bg-[#1f2937] text-[#f4efe6] min-h-[200px] transition-shadow duration-300"
              style={{
                boxShadow: onTarget
                  ? "inset 0 0 0 2px rgba(16,185,129,0.7), 0 0 24px rgba(16,185,129,0.25)"
                  : undefined,
              }}
            >
              <div className="aviation-mono text-xs tracking-wider opacity-70 mb-2">
                {t.mixture.current}
              </div>
              <div className="aviation-header text-2xl mb-2 tabular-nums">
                {Math.round(mixture * 100)}%
                <span className="ml-3 aviation-mono text-sm opacity-70">
                  {displayRpm} {t.mixture.rpmLabel}
                </span>
              </div>
              {onTarget ? (
                <motion.div
                  key={verdict.text}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 15 }}
                  className="inline-flex items-center mb-2 px-3 py-1.5 rounded-sm bg-[#10b981] text-[#06281e] aviation-mono text-[13px] font-bold uppercase tracking-[0.12em] shadow-[0_0_20px_rgba(16,185,129,0.55)]"
                >
                  {verdict.text}
                </motion.div>
              ) : (
                <motion.div
                  key={verdict.text}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="aviation-mono text-[13px] uppercase tracking-[0.12em] mb-2"
                  style={{ color: verdict.color }}
                >
                  {verdict.text}
                </motion.div>
              )}
              <p className="text-sm leading-relaxed opacity-90">{trend}</p>
            </div>

            <div className="p-5 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
              <div className="aviation-mono text-xs tracking-[0.15em] text-[#6b0f1a] mb-2">
                {t.mixture.pilotNote}
              </div>
              <p className="text-sm text-[#57534e] leading-relaxed">
                {t.mixture.pilotNoteBody}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Régime legend. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-12 max-w-3xl"
        >
          <div className="aviation-mono text-[10px] tracking-[0.25em] text-[#78716c] mb-3">
            {t.mixture.regimesTitle}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                ["fullRich", COLOR.ok],
                ["bestPower", COLOR.ok],
                ["peak", COLOR.warn],
                ["leanOfPeak", COLOR.bad],
                ["cutoff", "#9ca3af"],
              ] as const
            ).map(([key, color]) => {
              const r = t.mixture.regimes[key];
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 p-4 bg-[#e8e2d8]/30 border border-[#1f2937]/5 hover:border-[#6b0f1a]/20 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <div className="aviation-mono text-sm text-[#1f2937] font-medium">
                      {r.label}
                    </div>
                    <div className="text-xs text-[#78716c] leading-relaxed mt-0.5">
                      {r.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ScenarioPills({
  active,
  onChange,
  scenarios,
  labelText,
}: {
  active: ScenarioKey;
  onChange: (k: ScenarioKey) => void;
  scenarios: Record<ScenarioKey, { title: string; scene: string; explain: string }>;
  labelText: string;
}) {
  return (
    <div>
      <div className="aviation-mono text-[10px] tracking-[0.25em] text-[#78716c] mb-2">
        {labelText}
      </div>
      <div className="flex flex-wrap gap-2">
        {SCENARIO_KEYS.map((key, i) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`aviation-mono text-[10px] tracking-[0.1em] px-3 py-2 border transition-colors cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-[#6b0f1a] text-[#f4efe6] border-[#6b0f1a]"
                  : "bg-transparent text-[#57534e] border-[#1f2937]/20 hover:border-[#1f2937]/40"
              }`}
            >
              <span className={isActive ? "opacity-80" : "opacity-50"}>
                0{i + 1}
              </span>
              <span>{scenarios[key].title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Single-probe EGT gauge, the aftermarket style most 150s carry. Ticks in 25°F
// steps but no absolute numbers — you read the peak by where the needle stops
// climbing. The yellow PEAK BUG is the movable marker those gauges carried: the
// student drives it with the bezel knob, parks it on the peak, then enriches
// 50°F (two ticks) back down.
function EgtGauge({
  needleAngle,
  bugNorm,
  showKnob = false,
  onBugChange,
  labels,
  bugLabels,
  onTarget = false,
}: {
  needleAngle: MotionValue<number>;
  bugNorm: number | null;
  showKnob?: boolean;
  onBugChange?: (deltaF: number) => void;
  labels: { title: string; max: string };
  bugLabels?: { label: string; increase: string; decrease: string };
  onTarget?: boolean;
}) {
  const maxPos = polarToCartesian(200, 200, 100, normToAngle(0.93));
  const bug = bugNorm;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 400 400"
        className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px]"
      >
        <circle cx={200} cy={200} r={173} fill="#1f2937" />
        <circle cx={200} cy={200} r={185} fill="none" stroke="#1f2937" strokeWidth={2} />
        <circle cx={200} cy={200} r={175} fill="none" stroke="#9ca3af" strokeWidth={1} />

        {/* Over-temp band near the hot end. */}
        <path
          d={describeArc(200, 200, 156, normToAngle(0.88), EGT_ARC.end)}
          fill="none"
          stroke={COLOR.bad}
          strokeWidth={10}
          strokeLinecap="butt"
          opacity={0.85}
        />

        {Array.from({ length: TICK_COUNT + 1 }, (_, i) => {
          const norm = i / TICK_COUNT;
          const angle = normToAngle(norm);
          const isMajor = i % 4 === 0; // every 100°F
          const start = polarToCartesian(200, 200, isMajor ? 119 : 127, angle);
          const end = polarToCartesian(200, 200, 137, angle);
          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#f4efe6"
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}

        <text
          x={200}
          y={150}
          textAnchor="middle"
          className="aviation-mono"
          fill="#9ca3af"
          fontSize={13}
          letterSpacing={3}
        >
          {labels.title}
        </text>
        <text
          x={maxPos.x}
          y={maxPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="aviation-mono"
          fill={COLOR.bad}
          fontSize={9}
          letterSpacing={1}
        >
          {labels.max}
        </text>

        {/* Peak bug — yellow marker the student parks on the peak. */}
        {bug !== null ? (
          <g
            style={{
              transform: `rotate(${normToAngle(bug)}deg)`,
              transformOrigin: "200px 200px",
              transformBox: "view-box",
            }}
          >
            <polygon points="200,38 192,20 208,20" fill={COLOR.bug} />
            <line x1={200} y1={40} x2={200} y2={62} stroke={COLOR.bug} strokeWidth={3} />
          </g>
        ) : null}

        <motion.g
          style={{
            rotate: needleAngle,
            transformOrigin: "200px 200px",
            transformBox: "view-box",
          }}
        >
          <polygon points="200,200 196,112 200,102 204,112" fill="#6b0f1a" />
          <circle cx={200} cy={200} r={8} fill="#4b5563" />
          <circle cx={200} cy={200} r={4} fill="#6b0f1a" />
        </motion.g>
      </svg>
      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.08)] pointer-events-none" />
      {/* Green halo when the student is on target. */}
      {onTarget ? (
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
          style={{
            boxShadow:
              "0 0 0 3px rgba(16,185,129,0.85), 0 0 30px 6px rgba(16,185,129,0.5)",
          }}
        />
      ) : null}
      {showKnob && onBugChange ? (
        <BugKnob bugNorm={bug ?? 0} onChange={onBugChange} labels={bugLabels} />
      ) : null}
    </div>
  );
}

// Bezel knob that drives the peak bug, like the bug-set knob on a real EGT and
// the knobs in flight simulators. The right half nudges the bug up (increase),
// the left half down (decrease); hold to keep it moving. The cursor turns into a
// direction arrow over each half.
const BUG_STEP_F = 4; // °F per tick
const BUG_REPEAT_MS = 30;

const CURSOR_INC =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><g fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='M14 4 V20 M7 13 l7 7 l7 -7' stroke='%23000' stroke-width='5'/><path d='M14 4 V20 M7 13 l7 7 l7 -7' stroke='%23fff' stroke-width='2.5'/></g></svg>\") 14 14, ns-resize";
const CURSOR_DEC =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><g fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='M14 24 V8 M7 15 l7 -7 l7 7' stroke='%23000' stroke-width='5'/><path d='M14 24 V8 M7 15 l7 -7 l7 7' stroke='%23fff' stroke-width='2.5'/></g></svg>\") 14 14, ns-resize";

function BugKnob({
  bugNorm,
  onChange,
  labels,
}: {
  bugNorm: number;
  onChange: (deltaF: number) => void;
  labels?: { label: string; increase: string; decrease: string };
}) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);
  useEffect(() => stop, [stop]);

  const start = useCallback(
    (dir: number) => {
      onChange(dir * BUG_STEP_F); // immediate first step
      stop();
      timer.current = setInterval(() => onChange(dir * BUG_STEP_F), BUG_REPEAT_MS);
    },
    [onChange, stop],
  );

  // Cosmetic: the notch points roughly to the bug's place on the dial.
  const angle = -150 + clamp(bugNorm, 0, 1) * 300;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bottom-0 select-none"
      style={{ touchAction: "none" }}
    >
      <div className="relative w-11 h-11">
        {/* Knurled knob body */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage:
              "repeating-conic-gradient(from 0deg, #3a3a3a 0deg 8deg, #161616 8deg 16deg), radial-gradient(circle at 34% 28%, #6b6b6b 0%, #2a2a2a 60%, #0c0c0c 100%)",
            boxShadow:
              "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.6)",
            border: "1px solid #000",
          }}
        />
        {/* Notch indicator (rotates with the bug) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div
            className="absolute left-1/2 top-[3px] h-[10px] w-[3px] -translate-x-1/2 rounded-full"
            style={{ background: COLOR.bug }}
          />
        </div>
        {/* Left half — decrease */}
        <div
          role="button"
          aria-label={labels?.decrease}
          className="absolute inset-y-0 left-0 w-1/2 rounded-l-full"
          style={{ cursor: CURSOR_DEC }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start(-1);
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
        />
        {/* Right half — increase */}
        <div
          role="button"
          aria-label={labels?.increase}
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-full"
          style={{ cursor: CURSOR_INC }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start(1);
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
        />
      </div>
      {labels ? (
        <div className="mt-1 text-center aviation-mono text-[7px] tracking-[0.15em] text-[#9ca3af] pointer-events-none">
          {labels.label}
        </div>
      ) : null}
    </div>
  );
}

// The C150 mixture knob: a red push-pull knob next to the throttle. Same
// push-pull mechanics as the throttle lever (full in = rich), coloured red.
const PANEL_HEIGHT = 44;
const COLLAR_HEIGHT = 14;
const KNOB_GAP = COLLAR_HEIGHT + 4;
const TRAVEL = 200;
const KNOB_SIZE = 42;
const SHAFT_WIDTH = 6;
const TRACK_WIDTH = 68;
const TOTAL_HEIGHT = PANEL_HEIGHT + KNOB_GAP + TRAVEL + KNOB_SIZE;

function mixtureToY(m: number): number {
  return (1 - m) * TRAVEL;
}
function yToMixture(y: number): number {
  return clamp(1 - y / TRAVEL, 0, 1);
}

function MixtureLever({
  mixture,
  onChange,
  labels,
}: {
  mixture: number;
  onChange: (m: number) => void;
  labels: { title: string; rich: string; lean: string; cutoff: string };
}) {
  const y = useMotionValue(mixtureToY(mixture));
  const dragging = useRef(false);
  const shaftHeight = useTransform(y, (v) => KNOB_GAP + 2 + v);

  useEffect(() => {
    if (dragging.current) return;
    const controls = animate(y, mixtureToY(mixture), {
      type: "spring",
      stiffness: 280,
      damping: 26,
    });
    return () => controls.stop();
  }, [mixture, y]);

  const handleDrag = useCallback(() => {
    onChange(yToMixture(y.get()));
  }, [onChange, y]);

  return (
    <div className="select-none flex flex-col items-center gap-2">
      <div className="aviation-mono text-[9px] tracking-[0.2em] text-[#78716c]">
        {labels.title}
      </div>
      <div className="relative" style={{ width: TRACK_WIDTH, height: TOTAL_HEIGHT }}>
        {/* Panel face */}
        <div
          className="absolute top-0 left-0 right-0 rounded-t-sm overflow-hidden"
          style={{
            height: PANEL_HEIGHT,
            background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)",
            borderBottom: "1px solid #000",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#0a0a0a] ring-1 ring-[#f4efe6]/15" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0a0a0a] ring-1 ring-[#f4efe6]/15" />
          <div className="absolute inset-x-0 top-3 text-center aviation-mono text-[8px] tracking-[0.2em] text-[#d98880]">
            {labels.title}
          </div>
          <div className="absolute inset-x-0 top-[22px] text-center aviation-mono text-[7px] tracking-[0.15em] text-[#f4efe6]/45">
            {labels.lean}
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0"
            style={{
              width: SHAFT_WIDTH + 4,
              height: 5,
              background: "#000",
              borderRadius: "1px 1px 0 0",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div
          className="absolute left-0 right-0 rounded-b-sm"
          style={{
            top: PANEL_HEIGHT,
            bottom: 0,
            background: "linear-gradient(180deg, #3a3431 0%, #1d1a18 100%)",
          }}
        />

        {/* Chromed push-pull shaft */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: PANEL_HEIGHT - 2,
            width: SHAFT_WIDTH,
            height: shaftHeight,
            background:
              "linear-gradient(90deg, #3a3a3a 0%, #b5b5b5 30%, #ececec 50%, #b5b5b5 70%, #3a3a3a 100%)",
            borderRadius: "0 0 1px 1px",
            boxShadow: "0 0 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        />

        {/* Silver knurled friction lock */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: PANEL_HEIGHT + 1,
            width: 28,
            height: COLLAR_HEIGHT,
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0,0,0,0.42) 1.2px, rgba(0,0,0,0.42) 2px), linear-gradient(180deg, #c8c8c8 0%, #f0f0f0 45%, #7a7a7a 100%)",
            border: "1px solid #1a1a1a",
            borderRadius: 3,
            boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.45)",
            zIndex: 5,
          }}
          aria-hidden="true"
        />

        {/* Red push-pull knob */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: TRAVEL }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => {
            dragging.current = true;
          }}
          onDrag={handleDrag}
          onDragEnd={() => {
            dragging.current = false;
          }}
          style={{ y, top: PANEL_HEIGHT + KNOB_GAP, touchAction: "none" }}
          whileTap={{ scale: 1.05 }}
          className="absolute left-1/2 z-10 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          aria-label={labels.title}
        >
          <div
            style={{
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 24%, #f0a097 0%, #c0392b 38%, #7d1d12 88%, #5a1109 100%)",
              boxShadow:
                "0 7px 20px rgba(0,0,0,0.9), inset 0 -6px 10px rgba(0,0,0,0.45), inset 0 5px 8px rgba(255,255,255,0.35), 0 0 0 1px rgba(120,20,10,0.5)",
              border: "1px solid #3a0a04",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
