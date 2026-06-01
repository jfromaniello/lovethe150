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

// Force model: pure linear. K=24 lb per unit-of-trim means full deflection
// (trim ∈ [−1, +1]) buys ~24 lb of hand-load relief — plausible for a 150.
// The POH is silent on actual force values; numbers here are illustrative.
const K = 24;
const DEADBAND = 1;
const MAX_FORCE = 25;

const WHEEL_WIDTH_PX = 76;
const WHEEL_HEIGHT_PX = 280;
const HALF_TRAVEL = 140;
const WHEEL_TRAVEL_PX = HALF_TRAVEL * 2;
const TAKEOFF_T = 0.25;

type ScenarioKey = "climb" | "cruise" | "approach" | "descent";

const SCENARIOS: Array<{ key: ScenarioKey; correctTrim: number }> = [
  { key: "climb", correctTrim: 0.55 },
  { key: "cruise", correctTrim: 0.1 },
  { key: "approach", correctTrim: 0.7 },
  { key: "descent", correctTrim: -0.3 },
];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function ElevatorTrim() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t, fmt } = useI18n();

  const [activeKey, setActiveKey] = useState<ScenarioKey>("climb");
  const [currentTrim, setCurrentTrim] = useState(0);

  // Drag tracker — owned here so the scale pointer + grooves can subscribe.
  const dragY = useMotionValue(0);

  const correctTrim = useMemo(
    () => SCENARIOS.find((s) => s.key === activeKey)!.correctTrim,
    [activeKey],
  );

  // Scenario change → reset trim to neutral so the user feels the full
  // untrimmed force first. dragY springs back; currentTrim snaps.
  useEffect(() => {
    setCurrentTrim(0);
    const controls = animate(dragY, 0, {
      type: "spring",
      stiffness: 220,
      damping: 24,
    });
    return () => controls.stop();
  }, [activeKey, dragY]);

  const force = K * (correctTrim - currentTrim);
  const isTrimmed = Math.abs(force) <= DEADBAND;

  const handleTrimChange = useCallback((newTrim: number) => {
    setCurrentTrim(newTrim);
  }, []);

  const handleScenarioChange = useCallback((key: ScenarioKey) => {
    setActiveKey(key);
  }, []);

  const scenarioCopy = t.trim.scenarios[activeKey];

  const forceText = useMemo(() => {
    if (isTrimmed) return t.trim.trimmed;
    const lb = Math.max(1, Math.round(Math.abs(force)));
    return force > 0
      ? fmt(t.trim.pull, { n: lb })
      : fmt(t.trim.push, { n: lb });
  }, [force, isTrimmed, t, fmt]);

  // Color of force readout
  const forceColor = isTrimmed
    ? "#10b981"
    : Math.abs(force) > 10
      ? "#ef4444"
      : "#f59e0b";

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="trim" title={t.trim.title}>
            <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
              {t.trim.intro2}
            </p>
            <TechnicalDetail label={t.controls.detail}>
              <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
                {t.trim.intro}
              </p>
            </TechnicalDetail>
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
              <div>{t.trim.callout}</div>
            </div>
          </SectionHeader>
        </motion.div>

        {/* Pills — sticky bar on mobile, regular on desktop */}
        <div className="lg:hidden sticky top-0 z-30 -mx-6 px-6 py-3 mb-3 bg-[#f4efe6]/95 backdrop-blur-md border-y border-[#1f2937]/15 shadow-sm">
          <ScenarioPills
            active={activeKey}
            onChange={handleScenarioChange}
            scenarios={t.trim.scenarios}
            labelText={t.trim.scenarioLabel}
          />
        </div>
        <div className="hidden lg:block mb-3">
          <ScenarioPills
            active={activeKey}
            onChange={handleScenarioChange}
            scenarios={t.trim.scenarios}
            labelText={t.trim.scenarioLabel}
          />
        </div>

        {/* Scenario context — title + scene + explain in a single block, sitting
            right under the pills so the user always reads the situation before
            engaging with the wheel. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1f2937] text-[#f4efe6] p-4 lg:p-5 mb-6"
        >
          <div className="aviation-mono text-[10px] tracking-[0.2em] opacity-50 mb-1">
            {t.trim.scenarioLabel}
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

        {/* Interactive — wheel on the left, force gauge on the right.
            Same 2-col layout on mobile and desktop (different proportions). */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-[auto_1fr] gap-3 lg:gap-6 lg:grid-cols-12 items-start mb-6"
        >
          <div className="flex flex-col items-center lg:col-span-5">
            <div className="aviation-mono text-[9px] tracking-[0.25em] text-[#78716c] mb-3">
              {t.trim.wheelLabel}
            </div>

            <div className="flex items-start gap-2 lg:gap-4">
              <TrimWheel dragY={dragY} onTrimChange={handleTrimChange} />
              <TrimScale
                dragY={dragY}
                labels={{
                  up: t.trim.scaleNoseUp,
                  takeoff: t.trim.scaleTakeoff,
                  dn: t.trim.scaleNoseDn,
                }}
              />
            </div>

            <TrimReadout currentTrim={currentTrim} label={t.trim.trimReadout} />
          </div>

          <div className="min-w-0 lg:col-span-7">
            <ForceFillBar
              force={force}
              forceColor={forceColor}
              forceText={forceText}
              isTrimmed={isTrimmed}
              currentLabel={t.trim.current}
            />
          </div>
        </motion.div>

        {/* Reference — anatomy and pilot note. 50/50 on desktop, stacked on mobile. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid gap-4 lg:gap-6 lg:grid-cols-2"
        >
          <TrimAnatomy
            currentTrim={currentTrim}
            correctTrim={correctTrim}
            labels={t.trim.anatomy}
          />

          <div className="p-5 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
            <div className="aviation-mono text-xs tracking-[0.15em] text-[#6b0f1a] mb-2">
              {t.trim.pilotNote}
            </div>
            <p className="text-sm text-[#57534e] leading-relaxed">
              {t.trim.pilotNoteBody}
            </p>
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
        {SCENARIOS.map((s, i) => {
          const isActive = active === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onChange(s.key)}
              className={`aviation-mono text-[10px] tracking-[0.1em] px-3 py-2 border transition-colors cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-[#6b0f1a] text-[#f4efe6] border-[#6b0f1a]"
                  : "bg-transparent text-[#57534e] border-[#1f2937]/20 hover:border-[#1f2937]/40"
              }`}
            >
              <span className={isActive ? "opacity-80" : "opacity-50"}>
                0{i + 1}
              </span>
              <span>{scenarios[s.key].title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrimWheel({
  dragY,
  onTrimChange,
}: {
  dragY: MotionValue<number>;
  onTrimChange: (t: number) => void;
}) {
  const dragState = useRef<{ startClientY: number; startDragY: number } | null>(
    null,
  );

  // Grooves wrap as the drum spins. Plain JS modulo preserves the sign of
  // `v` — important so dragging up translates grooves up (and vice versa).
  // The pattern repeats every 10px so the wrap at ±10 is invisible.
  const grooveOffset = useTransform(dragY, (v) => v % 10);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragState.current = {
        startClientY: e.clientY,
        startDragY: dragY.get(),
      };
    },
    [dragY],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const delta = e.clientY - dragState.current.startClientY;
      const newY = clamp(
        dragState.current.startDragY + delta,
        -HALF_TRAVEL,
        HALF_TRAVEL,
      );
      dragY.set(newY);
      // Real-wheel direction: rolling the top forward (drag UP) deflects the
      // tab UP → elevator DOWN → NOSE DOWN trim. So drag-up = negative trim,
      // drag-down = positive trim (nose-up).
      onTrimChange(clamp(newY / HALF_TRAVEL, -1, 1));
    },
    [dragY, onTrimChange],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      dragState.current = null;
    },
    [],
  );

  return (
    <div
      className="relative select-none"
      style={{ width: WHEEL_WIDTH_PX, height: WHEEL_HEIGHT_PX }}
    >
      {/* Drum body */}
      <div
        className="absolute inset-0 overflow-hidden rounded-sm"
        style={{
          background:
            "linear-gradient(90deg, #0e0e0e 0%, #2a2a2a 50%, #0e0e0e 100%)",
          border: "1px solid #000",
          boxShadow:
            "inset 0 0 12px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {/* Knurled grooves */}
        <motion.div
          className="absolute inset-x-0"
          style={{
            top: -40,
            bottom: -40,
            y: grooveOffset,
            backgroundImage:
              "repeating-linear-gradient(180deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, rgba(0,0,0,0.55) 1px, rgba(0,0,0,0.55) 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 9px, transparent 9px, transparent 10px)",
          }}
        />
        {/* Curvature shading — top/bottom darker for the round-drum illusion */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        {/* Middle thumb-track highlight */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-5 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Pointer-capture layer (transparent) */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "none" }}
        role="slider"
        aria-orientation="vertical"
        aria-valuemin={-1}
        aria-valuemax={1}
      />
    </div>
  );
}

function TrimScale({
  dragY,
  labels,
}: {
  dragY: MotionValue<number>;
  labels: { up: string; takeoff: string; dn: string };
}) {
  // Indicator position smoothly follows the drag motion value. Positive
  // dragY (drag down) maps to the bottom of the scale = NOSE UP — same as
  // the trim formula.
  const indicatorY = useTransform(
    dragY,
    (y) =>
      clamp((y + HALF_TRAVEL) / WHEEL_TRAVEL_PX, 0, 1) * WHEEL_HEIGHT_PX,
  );

  // TAKE-OFF marker sits at t = +0.25 (nose-up, lower half of scale).
  const takeoffY = ((1 + TAKEOFF_T) / 2) * WHEEL_HEIGHT_PX;

  return (
    <div
      className="relative"
      style={{ width: 64, height: WHEEL_HEIGHT_PX }}
    >
      {/* Vertical rail */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-[#1f2937]/40" />

      {/* NOSE DN label (top — drag up rolls the wheel forward) */}
      <div className="absolute top-0 left-2 aviation-mono text-[9px] tracking-[0.15em] text-[#57534e]">
        {labels.dn}
      </div>

      {/* Center (neutral) tick */}
      <div
        className="absolute left-0 w-2 h-px bg-[#1f2937]/60"
        style={{ top: WHEEL_HEIGHT_PX / 2 }}
      />
      <div
        className="absolute left-3 aviation-mono text-[9px] text-[#1f2937]/60"
        style={{ top: WHEEL_HEIGHT_PX / 2 - 6 }}
      >
        0
      </div>

      {/* TAKE-OFF reference triangle */}
      <div
        className="absolute left-0 flex items-center gap-1.5"
        style={{ top: takeoffY - 5 }}
      >
        <div
          className="w-0 h-0"
          style={{
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "6px solid #f4efe6",
          }}
        />
        <span className="aviation-mono text-[9px] tracking-[0.1em] text-[#1f2937]">
          {labels.takeoff}
        </span>
      </div>

      {/* NOSE UP label (bottom) */}
      <div className="absolute bottom-0 left-2 aviation-mono text-[9px] tracking-[0.15em] text-[#57534e]">
        {labels.up}
      </div>

      {/* Burgundy pointer indicating current trim */}
      <motion.div
        className="absolute left-0 flex items-center"
        style={{ y: indicatorY, top: -7 }}
      >
        <div
          className="w-0 h-0"
          style={{
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: "10px solid #6b0f1a",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
          }}
        />
      </motion.div>
    </div>
  );
}

function TrimReadout({
  currentTrim,
  label,
}: {
  currentTrim: number;
  label: string;
}) {
  const arrow = currentTrim > 0.05 ? "↑" : currentTrim < -0.05 ? "↓" : "•";
  const sign = currentTrim >= 0 ? "+" : "";
  return (
    <div className="mt-4 aviation-mono text-xs tracking-[0.15em] text-[#57534e] flex items-baseline gap-2">
      <span className="opacity-60">{label}</span>
      <span className="tabular-nums text-[#1f2937]">
        {sign}
        {currentTrim.toFixed(2)}
      </span>
      <span className="text-[#6b0f1a]">{arrow}</span>
    </div>
  );
}

function TrimAnatomy({
  currentTrim,
  correctTrim,
  labels,
}: {
  currentTrim: number;
  correctTrim: number;
  labels: {
    title: string;
    elevator: string;
    tab: string;
    stab: string;
    hint: string;
  };
}) {
  // Elevator is pinned to what the pilot is holding for the scenario; trim tab
  // rotates with the user's wheel. When tab matches elevator's natural setting,
  // hand-load goes to zero.
  // SVG rotate() is clockwise-on-screen for positive angles. For nose-up
  // trim/attitude, the elevator's trailing edge goes UP (counter-clockwise,
  // negative angle) and the tab deflects DOWN relative to the elevator
  // (clockwise, positive angle).
  const elevatorAngle = -correctTrim * 8;
  const tabRelativeAngle = currentTrim * 18;

  return (
    <div className="p-4 bg-[#f4efe6]/40 border border-[#1f2937]/10">
      <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#78716c] mb-3">
        {labels.title}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <svg viewBox="0 0 220 90" className="w-full max-w-[260px] h-auto">
          {/* Horizontal stabilizer (fixed) */}
          <rect x="12" y="42" width="68" height="6" fill="#1f2937" rx="1" />
          <text
            x="14"
            y="62"
            fontSize="6"
            fill="#78716c"
            className="aviation-mono"
          >
            {labels.stab}
          </text>

          {/* Hinge pin */}
          <circle cx="80" cy="45" r="2" fill="#0a0a0a" />

          {/* Elevator (rotates about the hinge) */}
          <g transform={`rotate(${elevatorAngle}, 80, 45)`}>
            <rect
              x="80"
              y="42"
              width="78"
              height="6"
              fill="#1f2937"
              rx="1"
            />
            {/* Tab hinge */}
            <circle cx="158" cy="45" r="1.4" fill="#6b0f1a" />
            {/* Trim tab — rotates about its own hinge, relative to elevator */}
            <g transform={`rotate(${tabRelativeAngle}, 158, 45)`}>
              <rect
                x="158"
                y="42"
                width="32"
                height="6"
                fill="#6b0f1a"
                rx="1"
              />
            </g>
          </g>
        </svg>

        <div className="flex flex-col gap-1.5 text-[10px] aviation-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-1 bg-[#1f2937]" />
            <span className="text-[#57534e]">{labels.elevator}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-1 bg-[#6b0f1a]" />
            <span className="text-[#6b0f1a]">{labels.tab}</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#78716c] mt-3 leading-relaxed">
        {labels.hint}
      </p>
    </div>
  );
}

function ForceFillBar({
  force,
  forceColor,
  forceText,
  isTrimmed,
  currentLabel,
}: {
  force: number;
  forceColor: string;
  forceText: string;
  isTrimmed: boolean;
  currentLabel: string;
}) {
  // Fill spans half the bar at full deflection. ±10 lb ticks mark the
  // caution boundary so the user can see how close they are to it.
  const fillFraction = Math.min(1, Math.abs(force) / MAX_FORCE);
  const fillPct = fillFraction * 50;
  const isPush = force < 0;
  const tenLbPct = (10 / MAX_FORCE) * 50;
  const deadbandPct = (DEADBAND / MAX_FORCE) * 50;

  return (
    <div className="p-4 lg:p-5 bg-[#f4efe6]/40 border border-[#1f2937]/10">
      {/* Header — label on the left, big numeric on the right */}
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#78716c]">
          {currentLabel}
        </div>
        <div
          className="aviation-header text-2xl lg:text-3xl tabular-nums transition-colors"
          style={{ color: forceColor }}
        >
          {forceText}
        </div>
      </div>

      {/* Bar — fills from the center toward push (left) or pull (right) */}
      <div className="relative h-10 mb-2">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-[#1f2937]/8 border border-[#1f2937]/15 rounded-sm overflow-hidden" />

        {/* ±10 lb caution tick marks */}
        <div
          className="absolute top-1.5 bottom-1.5 w-px bg-[#1f2937]/30"
          style={{ left: `${50 - tenLbPct}%` }}
        />
        <div
          className="absolute top-1.5 bottom-1.5 w-px bg-[#1f2937]/30"
          style={{ left: `${50 + tenLbPct}%` }}
        />

        {/* Center 0 mark — taller than the bar so it's always visible */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#1f2937]/55"
          style={{ left: "calc(50% - 1px)" }}
        />

        {/* Fill (out of trim) */}
        {!isTrimmed && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 transition-all duration-150 ease-out"
            style={{
              backgroundColor: forceColor,
              left: isPush ? `${50 - fillPct}%` : "50%",
              width: `${fillPct}%`,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.15)",
              borderTopLeftRadius: isPush ? 2 : 0,
              borderBottomLeftRadius: isPush ? 2 : 0,
              borderTopRightRadius: isPush ? 0 : 2,
              borderBottomRightRadius: isPush ? 0 : 2,
            }}
          />
        )}

        {/* Trimmed (deadband) — small green pulse centered on 0 */}
        {isTrimmed && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 bg-[#10b981] rounded-sm"
            style={{
              left: `${50 - deadbandPct}%`,
              width: `${2 * deadbandPct}%`,
              boxShadow:
                "0 0 8px rgba(16,185,129,0.6), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          />
        )}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between items-center aviation-mono text-[10px] text-[#78716c] mt-2">
        <span>← PUSH 25 lb</span>
        <span className="opacity-50">0</span>
        <span>PULL 25 lb →</span>
      </div>
    </div>
  );
}
