"use client";

import { motion, useInView } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18n } from "../LanguageContext";
import SectionHeader from "./SectionHeader";
import TechnicalDetail from "./TechnicalDetail";

// --- POH fuel data (Owner's Manual fig. 2-2, standard wing tanks) -----------
const GAL_TO_L = 3.78541;
const PER_TANK_GAL = 13; // each standard wing tank
const TOTAL_GAL = 26; // both tanks
const USABLE_GAL = 22.5; // all flight conditions
const UNUSABLE_GAL = 3.5; // trapped

const liters = (gal: number) => gal * GAL_TO_L;
const fmtGal = (gal: number) =>
  Number.isInteger(gal) ? String(gal) : gal.toFixed(1);
// Trig coords land verbatim in SVG attributes; round so SSR and client
// serialize identically (Math.cos/sin can differ in the last bit per runtime).
const round3 = (n: number) => Math.round(n * 1000) / 1000;
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// Fuel burn by phase. Cruise/economy from the POH cruise-performance chart
// (~6.0 gph at 75% / ~3.8 gph economy); taxi, take-off and descent are
// illustrative line estimates. tas in MPH for the rough range figure.
type PhaseKey = "taxi" | "takeoff" | "cruise" | "economy" | "descent";
const PHASES: Array<{ key: PhaseKey; gph: number; tas: number; color: string }> = [
  { key: "taxi", gph: 1.4, tas: 0, color: "#9ca3af" },
  { key: "takeoff", gph: 7.5, tas: 75, color: "#f59e0b" },
  { key: "cruise", gph: 6.0, tas: 111, color: "#10b981" },
  { key: "economy", gph: 3.8, tas: 95, color: "#2d6a4f" },
  { key: "descent", gph: 3.2, tas: 120, color: "#6b7280" },
];

// Wing-tank cross-section is wider at the top. Modelling it as a trapezoid
// (bottom width = TAPER × top width) makes the fuel HEIGHT a non-linear
// function of VOLUME — the physical reason a calibrated dipstick reads
// uneven gallon marks and a linear gauge lies.
const TAPER = 0.5;

// Given a volume fraction (0..1) return the fill-height fraction (0..1) for the
// trapezoid above. Solves Area(h) = f · TotalArea for h (normalised H = 1).
function fillHeightFrac(volFrac: number): number {
  const f = clamp(volFrac, 0, 1);
  const Wt = 1;
  const Wb = TAPER;
  const aTot = (Wb + Wt) / 2;
  const a = (Wt - Wb) / 2;
  const b = Wb;
  const c = -f * aTot;
  if (Math.abs(a) < 1e-9) return f;
  const disc = b * b - 4 * a * c;
  return clamp((-b + Math.sqrt(disc)) / (2 * a), 0, 1);
}

function fmtHM(hours: number): string {
  if (!isFinite(hours) || hours <= 0) return "0:00";
  const m = Math.round(hours * 60);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

// A worn float gauge: deliberately wrong above EMPTY, only honest at E.
// The bias is nonlinear and vanishes at f=0, so the needle reads correctly
// only at the bottom of the scale — the certification reality this teaches.
function gaugeFrac(trueFrac: number, seed: 0 | 1): number {
  const f = clamp(trueFrac, 0, 1);
  const bias =
    (seed === 0
      ? 0.1 * Math.sin(f * 5) + 0.06
      : -0.09 * Math.sin(f * 4 + 1) - 0.05) * f;
  return clamp(f + bias, 0, 1);
}

type Side = "left" | "right";

export default function FuelSystem() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t, fmt } = useI18n();
  const f = t.fuel;

  // True fuel on board (hidden inside the opaque wing — you only learn it by dipping).
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  // What the pilot actually KNOWS — the last dipstick reading per tank.
  const [measured, setMeasured] = useState<{ left: number | null; right: number | null }>({
    left: null,
    right: null,
  });
  // The mark currently frozen on the dipstick (persists after you pull it out).
  const [lastDip, setLastDip] = useState<{ tank: Side; gal: number } | null>(null);
  const [phase, setPhase] = useState<PhaseKey>("cruise");

  // Refs so the dip handler always reads the live tank quantity at commit time.
  const leftRef = useRef(left);
  const rightRef = useRef(right);
  useEffect(() => {
    leftRef.current = left;
    rightRef.current = right;
  }, [left, right]);

  const onFuel = useCallback((tank: Side, deltaGal: number) => {
    if (tank === "left") setLeft((v) => clamp(v + deltaGal, 0, PER_TANK_GAL));
    else setRight((v) => clamp(v + deltaGal, 0, PER_TANK_GAL));
  }, []);

  const onMeasure = useCallback((tank: Side) => {
    const gal = tank === "left" ? leftRef.current : rightRef.current;
    const reading = Math.round(gal * 2) / 2; // dipstick precision: ½ gal
    setMeasured((m) => ({ ...m, [tank]: reading }));
    setLastDip({ tank, gal: reading });
  }, []);

  const drain = useCallback(() => {
    setLeft(0);
    setRight(0);
    setMeasured({ left: null, right: null });
    setLastDip(null);
  }, []);

  // What the pilot KNOWS is on board — only counts measured tanks.
  const bothMeasured = measured.left != null && measured.right != null;
  const measuredTotal = bothMeasured ? (measured.left as number) + (measured.right as number) : null;
  const usableMeasured =
    measuredTotal != null ? Math.max(0, measuredTotal - UNUSABLE_GAL) : null;

  const phaseData = PHASES.find((p) => p.key === phase)!;
  const endurance =
    usableMeasured != null && phaseData.gph > 0 ? usableMeasured / phaseData.gph : null;
  const range =
    endurance != null && phaseData.tas > 0 ? phaseData.tas * endurance : null;

  const specCards = useMemo(
    () => [
      {
        label: f.specs.grade.label,
        value: f.specs.grade.value,
        sub: null as string | null,
        detail: f.specs.grade.detail,
      },
      {
        label: f.specs.total.label,
        value: `${fmtGal(TOTAL_GAL)} ${f.units.gal}`,
        sub: `${Math.round(liters(TOTAL_GAL))} ${f.units.liters}`,
        detail: f.specs.total.detail,
      },
      {
        label: f.specs.usable.label,
        value: `${fmtGal(USABLE_GAL)} ${f.units.gal}`,
        sub: `${Math.round(liters(USABLE_GAL))} ${f.units.liters}`,
        detail: f.specs.usable.detail,
      },
      {
        label: f.specs.unusable.label,
        value: `${fmtGal(UNUSABLE_GAL)} ${f.units.gal}`,
        sub: `${Math.round(liters(UNUSABLE_GAL))} ${f.units.liters}`,
        detail: f.specs.unusable.detail,
      },
      {
        label: f.specs.feed.label,
        value: f.specs.feed.value,
        sub: null,
        detail: f.specs.feed.detail,
      },
    ],
    [f],
  );

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="fuel" title={f.title}>
            <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
              {f.intro2}
            </p>
            <TechnicalDetail label={t.controls.detail}>
              <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
                {f.intro}
              </p>
            </TechnicalDetail>
            <div className="mt-4 inline-flex items-start gap-3 p-4 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a] text-sm text-[#57534e] max-w-2xl">
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
                  d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                />
              </svg>
              <div>{f.callout}</div>
            </div>
          </SectionHeader>
        </motion.div>

        {/* Fuel facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-16"
        >
          <div className="aviation-mono text-xs tracking-[0.2em] text-[#6b0f1a] mb-4">
            {f.specsTitle}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {specCards.map((c) => (
              <div
                key={c.label}
                className="p-4 bg-[#e8e2d8]/40 border border-[#1f2937]/10 hover:border-[#6b0f1a]/20 transition-colors"
              >
                <div className="aviation-mono text-[10px] uppercase tracking-[0.12em] text-[#78716c] mb-2">
                  {c.label}
                </div>
                <div className="aviation-header text-xl text-[#1f2937] leading-none tabular-nums">
                  {c.value}
                </div>
                {c.sub ? (
                  <div className="aviation-mono text-xs text-[#6b0f1a] mt-1">
                    {c.sub}
                  </div>
                ) : null}
                <div className="text-[11px] text-[#78716c] leading-snug mt-2">
                  {c.detail}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive: fuel & dip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-16"
        >
          <div className="aviation-mono text-xs tracking-[0.2em] text-[#6b0f1a] mb-2">
            {f.interactive.title}
          </div>
          <p className="text-[#57534e] text-sm leading-relaxed max-w-3xl mb-4">
            {f.interactive.intro}
          </p>

          {/* Tool legend */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 aviation-mono text-[11px] tracking-[0.1em] px-3 py-1.5 bg-[#b8860b]/15 border border-[#b8860b]/40 text-[#7a5a08]">
              <span className="w-2 h-2 rounded-full bg-[#b8860b]" />
              {f.interactive.nozzleLabel} · {f.interactive.nozzleHint}
            </span>
            <span className="inline-flex items-center gap-2 aviation-mono text-[11px] tracking-[0.1em] px-3 py-1.5 bg-[#6b0f1a]/10 border border-[#6b0f1a]/40 text-[#6b0f1a]">
              <span className="w-2 h-2 rounded-full bg-[#6b0f1a]" />
              {f.interactive.dipstickLabel} · {f.interactive.dipstickHint}
            </span>
            <button
              type="button"
              onClick={drain}
              className="aviation-mono text-[11px] tracking-[0.1em] px-3 py-1.5 border border-[#1f2937]/20 text-[#1f2937] bg-[#e8e2d8]/40 hover:border-[#6b0f1a]/40 hover:text-[#6b0f1a] transition-colors cursor-pointer ml-auto"
            >
              {f.interactive.drainButton}
            </button>
          </div>

          {/* Wide drag stage */}
          <div className="relative mx-auto max-w-4xl bg-[#f4efe6] border border-[#1f2937]/15 p-3 sm:p-5">
            <FuelScene
              left={left}
              right={right}
              measured={measured}
              lastDip={lastDip}
              onFuel={onFuel}
              onMeasure={onMeasure}
              labels={{
                left: f.interactive.tankLeft,
                right: f.interactive.tankRight,
                gal: f.units.gal,
                fueling: f.interactive.fueling,
                full: f.interactive.full,
                unknown: f.interactive.unknown,
                unknownHint: f.interactive.unknownHint,
                measuring: f.interactive.measuring,
                nozzle: f.interactive.nozzleLabel,
                dipstick: f.interactive.dipstickLabel,
              }}
            />
          </div>

          {/* Readouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Dipstick reading */}
            <div className="p-4 bg-[#1f2937] text-[#f4efe6]">
              <div className="aviation-mono text-[10px] tracking-[0.15em] opacity-70 mb-2">
                {f.interactive.stickReads}
              </div>
              {lastDip ? (
                <motion.div
                  key={`${lastDip.tank}-${lastDip.gal}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="aviation-header text-3xl tabular-nums leading-none">
                    {fmtGal(lastDip.gal)} {f.units.gal}
                    <span className="ml-3 aviation-mono text-sm opacity-70">
                      {Math.round(liters(lastDip.gal))} {f.units.liters}
                    </span>
                  </div>
                  <div className="aviation-mono text-[9px] tracking-[0.12em] text-[#c9a227] mt-2">
                    {lastDip.tank === "left"
                      ? f.interactive.tankLeft
                      : f.interactive.tankRight}
                  </div>
                </motion.div>
              ) : (
                <div className="aviation-mono text-sm opacity-50 py-3">
                  {f.interactive.notDipped}
                </div>
              )}
            </div>

            {/* Cockpit gauges (the unreliable foil) */}
            <div className="p-4 bg-[#e8e2d8]/40 border border-[#1f2937]/10">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c]">
                  {f.interactive.gaugeTitle}
                </div>
                <div className="aviation-mono text-[9px] tracking-[0.1em] text-[#6b0f1a]">
                  ⚠ {f.interactive.gaugeReliable}
                </div>
              </div>
              <div className="flex items-center justify-center gap-8">
                <FuelGauge
                  frac={gaugeFrac(left / PER_TANK_GAL, 0)}
                  label={f.interactive.tankLeft}
                />
                <FuelGauge
                  frac={gaugeFrac(right / PER_TANK_GAL, 1)}
                  label={f.interactive.tankRight}
                />
              </div>
            </div>

            {/* Measured totals */}
            <div className="grid grid-rows-2 gap-3">
              <div className="p-3 bg-[#1f2937] text-[#f4efe6] flex flex-col justify-center">
                <div className="aviation-mono text-[9px] tracking-[0.15em] text-[#9ca3af] mb-1">
                  {f.interactive.totalOnboard}
                </div>
                {measuredTotal != null ? (
                  <div className="aviation-header text-2xl tabular-nums leading-none">
                    {fmtGal(measuredTotal)} {f.units.gal}
                    <span className="aviation-mono text-[10px] text-[#9ca3af] ml-2">
                      {Math.round(liters(measuredTotal))} {f.units.liters}
                    </span>
                  </div>
                ) : (
                  <div className="aviation-mono text-[11px] text-[#9ca3af] leading-snug py-1">
                    {f.interactive.measureBothHint}
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#2d6a4f] text-[#f4efe6] flex flex-col justify-center">
                <div className="aviation-mono text-[9px] tracking-[0.15em] text-[#f4efe6]/70 mb-1">
                  {f.interactive.usableOnboard}
                </div>
                {usableMeasured != null ? (
                  <div className="aviation-header text-2xl tabular-nums leading-none">
                    {fmtGal(usableMeasured)} {f.units.gal}
                    <span className="aviation-mono text-[10px] text-[#f4efe6]/70 ml-2">
                      {Math.round(liters(usableMeasured))} {f.units.liters}
                    </span>
                  </div>
                ) : (
                  <div className="aviation-mono text-[11px] text-[#f4efe6]/70 leading-snug py-1">
                    {f.interactive.measureBothHint}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#78716c] leading-snug mt-4 max-w-3xl">
            {f.interactive.stickVsGauge}
          </p>
        </motion.div>

        {/* Fuel burn by phase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="aviation-mono text-xs tracking-[0.2em] text-[#6b0f1a] mb-2">
            {f.burn.title}
          </div>
          <p className="text-[#57534e] text-sm leading-relaxed max-w-2xl mb-6">
            {f.burn.intro}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Phase selector */}
            <div className="space-y-2">
              <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-1">
                {f.burn.selectLabel}
              </div>
              {PHASES.map((p) => {
                const isSel = p.key === phase;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPhase(p.key)}
                    className={`w-full text-left p-3 border transition-colors cursor-pointer flex items-center gap-3 ${
                      isSel
                        ? "bg-[#1f2937] border-[#1f2937]"
                        : "bg-[#e8e2d8]/40 border-[#1f2937]/10 hover:border-[#6b0f1a]/30"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`aviation-mono text-sm block truncate ${
                          isSel ? "text-[#f4efe6]" : "text-[#1f2937]"
                        }`}
                      >
                        {f.burn.phases[p.key].label}
                      </span>
                      <span
                        className={`text-[11px] block truncate ${
                          isSel ? "text-[#9ca3af]" : "text-[#78716c]"
                        }`}
                      >
                        {f.burn.phases[p.key].note}
                      </span>
                    </span>
                    <span
                      className={`aviation-header text-base tabular-nums flex-shrink-0 ${
                        isSel ? "text-[#c9a227]" : "text-[#6b0f1a]"
                      }`}
                    >
                      {p.gph.toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected phase readout */}
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="p-5 bg-[#1f2937] text-[#f4efe6]">
                <div
                  className="aviation-header text-2xl mb-4"
                  style={{ color: phaseData.color }}
                >
                  {f.burn.phases[phase].label}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="aviation-mono text-[9px] tracking-[0.12em] text-[#9ca3af] mb-1">
                      {f.burn.rate}
                    </div>
                    <div className="aviation-header text-2xl tabular-nums leading-none">
                      {phaseData.gph.toFixed(1)}
                    </div>
                    <div className="aviation-mono text-[9px] text-[#9ca3af] mt-1">
                      {f.units.gph}
                    </div>
                    <div className="aviation-mono text-[9px] text-[#9ca3af]">
                      {(phaseData.gph * GAL_TO_L).toFixed(1)} {f.units.lph}
                    </div>
                  </div>
                  <div>
                    <div className="aviation-mono text-[9px] tracking-[0.12em] text-[#9ca3af] mb-1">
                      {f.burn.endurance}
                    </div>
                    <div className="aviation-header text-2xl tabular-nums leading-none text-[#c9a227]">
                      {endurance != null ? fmtHM(endurance) : "—"}
                    </div>
                    <div className="aviation-mono text-[9px] text-[#9ca3af] mt-1">
                      h:mm
                    </div>
                  </div>
                  <div>
                    <div className="aviation-mono text-[9px] tracking-[0.12em] text-[#9ca3af] mb-1">
                      {f.burn.rangeLabel}
                    </div>
                    <div className="aviation-header text-2xl tabular-nums leading-none">
                      {range != null && range > 0 ? Math.round(range) : "—"}
                    </div>
                    <div className="aviation-mono text-[9px] text-[#9ca3af] mt-1">
                      {phaseData.tas > 0 ? "sm" : f.burn.noRange}
                    </div>
                  </div>
                </div>
                <div className="aviation-mono text-[10px] text-[#9ca3af] mt-4 pt-3 border-t border-[#f4efe6]/10 text-center">
                  {usableMeasured != null
                    ? fmt(f.burn.fromUsable, {
                        gal: `${fmtGal(usableMeasured)} ${f.units.gal}`,
                      })
                    : f.burn.needMeasure}
                </div>
              </div>

              <div className="p-4 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
                <div className="aviation-mono text-xs tracking-[0.15em] text-[#6b0f1a] mb-2">
                  {f.pilotNote}
                </div>
                <p className="text-sm text-[#57534e] leading-relaxed">
                  {f.pilotNoteBody}
                </p>
              </div>

              <p className="text-[11px] text-[#78716c] leading-snug">
                {f.burn.pohNote}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =====================================================================
//  Interactive scene: opaque wing tanks + draggable nozzle & dipstick
// =====================================================================

// Scene geometry (SVG user units; viewBox 0 0 1000 470).
const VB_W = 1000;
const VB_H = 470;
const Y_TOP = 178; // tank top (inner)
const Y_BOT = 392; // tank bottom
const TANK_H = Y_BOT - Y_TOP;
const HW_TOP = 96; // half-width at top
const HW_BOT = HW_TOP * TAPER; // half-width at bottom
const TANK_CX: Record<Side, number> = { left: 330, right: 690 };
const PORT_Y = Y_TOP - 4; // filler opening line
const CATCH_X = HW_TOP * 0.5; // horizontal catch radius over a port

// Nozzle: local origin at the grip; spout tip points down.
const NZ_HOME = { x: 205, y: 96 };
const NZ_TIP = { x: 0, y: 80 };
const PUMP_SPOUT = { x: 96, y: 196 };

// Dipstick: local origin at the handle top; rod runs down to DIP_TIP_Y.
const DP_HOME = { x: 922, y: 110 };
const DIP_TIP_Y = 236; // local y of the rod tip

function tankPolygon(cx: number): string {
  return [
    `${cx - HW_BOT},${Y_BOT}`,
    `${cx + HW_BOT},${Y_BOT}`,
    `${cx + HW_TOP},${Y_TOP}`,
    `${cx - HW_TOP},${Y_TOP}`,
  ].join(" ");
}

function portColumn(x: number): Side | null {
  if (Math.abs(x - TANK_CX.left) < CATCH_X) return "left";
  if (Math.abs(x - TANK_CX.right) < CATCH_X) return "right";
  return null;
}

type SceneLabels = {
  left: string;
  right: string;
  gal: string;
  fueling: string;
  full: string;
  unknown: string;
  unknownHint: string;
  measuring: string;
  nozzle: string;
  dipstick: string;
};

function FuelScene({
  left,
  right,
  measured,
  lastDip,
  onFuel,
  onMeasure,
  labels,
}: {
  left: number;
  right: number;
  measured: { left: number | null; right: number | null };
  lastDip: { tank: Side; gal: number } | null;
  onFuel: (tank: Side, deltaGal: number) => void;
  onMeasure: (tank: Side) => void;
  labels: SceneLabels;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const [nz, setNz] = useState(NZ_HOME);
  const [nzDrag, setNzDrag] = useState(false);
  const [fueling, setFueling] = useState<Side | null>(null);
  const nzOff = useRef({ x: 0, y: 0 });

  const [dp, setDp] = useState(DP_HOME);
  const [dpDrag, setDpDrag] = useState(false);
  const [dipIn, setDipIn] = useState<Side | null>(null);
  const dpOff = useRef({ x: 0, y: 0 });
  const dipInRef = useRef<Side | null>(null);

  const toSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }, []);

  // Continuous fuel flow while the nozzle is docked over a port.
  const fuelRate = 5; // gal per second
  useEffect(() => {
    if (!fueling) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      onFuel(fueling, fuelRate * dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fueling, onFuel]);

  // ---- Nozzle drag ----
  const onNzDown = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {}
    const p = toSvg(e.clientX, e.clientY);
    nzOff.current = { x: p.x - nz.x, y: p.y - nz.y };
    setNzDrag(true);
  };
  const onNzMove = (e: React.PointerEvent) => {
    if (!nzDrag) return;
    const p = toSvg(e.clientX, e.clientY);
    const x = clamp(p.x - nzOff.current.x, 110, 940);
    const y = clamp(p.y - nzOff.current.y, 60, 330);
    setNz({ x, y });
    const tipX = x + NZ_TIP.x;
    const tipY = y + NZ_TIP.y;
    const col = portColumn(tipX);
    const over = col && tipY > PORT_Y - 46 && tipY < PORT_Y + 30 ? col : null;
    setFueling(over);
  };
  const onNzUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
    setNzDrag(false);
    setFueling(null);
    setNz(NZ_HOME);
  };

  // ---- Dipstick drag ----
  const commit = (tank: Side) => onMeasure(tank);

  const onDpDown = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {}
    const p = toSvg(e.clientX, e.clientY);
    dpOff.current = { x: p.x - dp.x, y: p.y - dp.y };
    setDpDrag(true);
  };
  const onDpMove = (e: React.PointerEvent) => {
    if (!dpDrag) return;
    const p = toSvg(e.clientX, e.clientY);
    const x = clamp(p.x - dpOff.current.x, 120, 950);
    const y = clamp(p.y - dpOff.current.y, 40, Y_BOT - DIP_TIP_Y);
    const tipX = x;
    const tipY = y + DIP_TIP_Y;
    const col = portColumn(tipX);
    const inserted = col && tipY > PORT_Y + 6 ? col : null;
    // Committing the reading happens the instant the tip clears the port on
    // the way out — that is when the wetted mark becomes visible.
    if (dipInRef.current && !inserted) commit(dipInRef.current);
    dipInRef.current = inserted;
    setDipIn(inserted);
    setDp({ x, y });
  };
  const onDpUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
    if (dipInRef.current) commit(dipInRef.current);
    dipInRef.current = null;
    setDipIn(null);
    setDpDrag(false);
    setDp(DP_HOME);
  };

  const gal: Record<Side, number> = { left, right };

  // The mark frozen on the dipstick (persists once pulled out). While it is
  // inside a tank the wetted part is hidden behind the metal, so show nothing.
  const stickWetFrac =
    !dipIn && lastDip ? fillHeightFrac(lastDip.gal / PER_TANK_GAL) : 0;
  const stickReadGal = !dipIn && lastDip ? lastDip.gal : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full h-auto select-none touch-none"
      style={{ touchAction: "none" }}
    >
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b4654" />
          <stop offset="45%" stopColor="#273140" />
          <stop offset="100%" stopColor="#161d27" />
        </linearGradient>
        <linearGradient id="avgas-stream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd0ff" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#3aa0ff" stopOpacity={0.9} />
        </linearGradient>
        <clipPath id="dip-clip">
          <rect x={0} y={0} width={VB_W} height={PORT_Y} />
        </clipPath>
      </defs>

      {/* Pump unit */}
      <g>
        <rect x={26} y={150} width={72} height={190} rx={6} fill="#6b0f1a" />
        <rect x={34} y={160} width={56} height={40} rx={3} fill="#1f2937" />
        <text
          x={62}
          y={178}
          textAnchor="middle"
          className="aviation-mono"
          fill="#c9a227"
          fontSize={11}
          fontWeight={700}
        >
          AVGAS
        </text>
        <text
          x={62}
          y={192}
          textAnchor="middle"
          className="aviation-mono"
          fill="#9fd0ff"
          fontSize={10}
        >
          100LL
        </text>
        <rect x={40} y={214} width={44} height={108} rx={3} fill="#0f172a" opacity={0.5} />
      </g>

      {/* Hose from pump spout to the nozzle grip */}
      <path
        d={`M ${PUMP_SPOUT.x} ${PUMP_SPOUT.y} Q ${(PUMP_SPOUT.x + nz.x) / 2} ${
          Math.max(PUMP_SPOUT.y, nz.y) + 70
        }, ${nz.x} ${nz.y + 6}`}
        fill="none"
        stroke="#0b0f16"
        strokeWidth={7}
        strokeLinecap="round"
      />

      {/* High wing overhead — front view with a little dihedral, the two tanks sit beneath it */}
      <g opacity={0.5}>
        <path
          d={`M 250 122 L 510 140 L 770 122`}
          fill="none"
          stroke="#1f2937"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect x={499} y={132} width={22} height={19} rx={2} fill="#e8e0d4" stroke="#1f2937" strokeWidth={1.5} />
        <line x1={330} y1={130} x2={330} y2={PORT_Y - 11} stroke="#1f2937" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />
        <line x1={690} y1={130} x2={690} y2={PORT_Y - 11} stroke="#1f2937" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />
      </g>

      {/* Tanks */}
      {(["left", "right"] as Side[]).map((side) => (
        <TankBody
          key={side}
          cx={TANK_CX[side]}
          fueling={fueling === side}
          full={gal[side] >= PER_TANK_GAL - 0.05}
          measured={measured[side]}
          label={side === "left" ? labels.left : labels.right}
          labels={labels}
        />
      ))}

      {/* Plumbing to the shutoff valve / carburetor */}
      <line x1={TANK_CX.left} y1={Y_BOT} x2={510} y2={Y_BOT + 36} stroke="#1f2937" strokeWidth={1.5} opacity={0.5} />
      <line x1={TANK_CX.right} y1={Y_BOT} x2={510} y2={Y_BOT + 36} stroke="#1f2937" strokeWidth={1.5} opacity={0.5} />
      <circle cx={510} cy={Y_BOT + 40} r={6} fill="none" stroke="#6b0f1a" strokeWidth={1.5} />
      <text
        x={510}
        y={Y_BOT + 58}
        textAnchor="middle"
        className="aviation-mono"
        fill="#78716c"
        fontSize={9}
        letterSpacing={1.5}
      >
        SHUTOFF VALVE → CARB
      </text>

      {/* Fuel stream while pumping (drawn above tanks, into the port) */}
      {fueling ? (
        <FuelStream cx={TANK_CX[fueling]} nzTipX={nz.x + NZ_TIP.x} nzTipY={nz.y + NZ_TIP.y} />
      ) : null}

      {/* Dipstick holster on the right */}
      <rect x={DP_HOME.x - 14} y={DP_HOME.y - 6} width={28} height={20} rx={3} fill="#0f172a" opacity={0.6} />

      {/* ---- Dipstick (draggable) ---- */}
      <motion.g
        animate={{ x: dp.x, y: dp.y }}
        transition={dpDrag ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
        onPointerDown={onDpDown}
        onPointerMove={onDpMove}
        onPointerUp={onDpUp}
        onPointerCancel={onDpUp}
        style={{ cursor: dpDrag ? "grabbing" : "grab" }}
      >
        <g clipPath={dipIn ? "url(#dip-clip)" : undefined}>
          <Dipstick wetFrac={stickWetFrac} readGal={stickReadGal} galLabel={labels.gal} />
        </g>
      </motion.g>

      {/* ---- Nozzle (draggable) ---- */}
      <motion.g
        animate={{ x: nz.x, y: nz.y }}
        transition={nzDrag ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
        onPointerDown={onNzDown}
        onPointerMove={onNzMove}
        onPointerUp={onNzUp}
        onPointerCancel={onNzUp}
        style={{ cursor: nzDrag ? "grabbing" : "grab" }}
      >
        <Nozzle active={!!fueling} />
      </motion.g>
    </svg>
  );
}

// --- Opaque wing tank with an open filler port ------------------------------
function TankBody({
  cx,
  fueling,
  full,
  measured,
  label,
  labels,
}: {
  cx: number;
  fueling: boolean;
  full: boolean;
  measured: number | null;
  label: string;
  labels: SceneLabels;
}) {
  const rivets = [];
  for (let i = -3; i <= 3; i++) {
    rivets.push(cx + i * (HW_TOP / 3.5));
  }
  return (
    <g>
      {/* Wing-tank cross-section — opaque cream, so the level stays hidden */}
      <polygon
        points={tankPolygon(cx)}
        fill="#e8e0d4"
        stroke="#1f2937"
        strokeWidth={2}
      />
      {/* Wing-skin band along the top edge */}
      <polygon
        points={`${cx - HW_TOP},${Y_TOP} ${cx + HW_TOP},${Y_TOP} ${cx + HW_TOP - 7},${Y_TOP + 11} ${cx - HW_TOP + 7},${Y_TOP + 11}`}
        fill="#6b0f1a"
        opacity={0.12}
      />
      {/* Rivet line along the top */}
      {rivets.map((rx, i) => (
        <circle key={i} cx={rx} cy={Y_TOP + 5.5} r={1.4} fill="#1f2937" opacity={0.35} />
      ))}
      {/* Capacity, lettered onto the opaque skin */}
      <text
        x={cx}
        y={(Y_TOP + Y_BOT) / 2 + 6}
        textAnchor="middle"
        className="aviation-header"
        fill="#1f2937"
        opacity={0.3}
        fontSize={20}
      >
        13 gal
      </text>

      {/* Filler neck + open port */}
      <ellipse cx={cx} cy={PORT_Y} rx={26} ry={9} fill="#f4efe6" stroke="#1f2937" strokeWidth={2} />
      <ellipse cx={cx} cy={PORT_Y} rx={19} ry={6} fill="#1f2937" opacity={0.85} />
      {/* Open cap resting beside the neck */}
      <g transform={`translate(${cx + 40}, ${PORT_Y - 6})`}>
        <ellipse cx={0} cy={2} rx={11} ry={4} fill="#1f2937" opacity={0.2} />
        <ellipse cx={0} cy={-2} rx={11} ry={4} fill="#f4efe6" stroke="#1f2937" strokeWidth={1.2} />
        <line x1={-11} y1={-1} x2={-22} y2={3} stroke="#1f2937" strokeWidth={1.2} />
      </g>

      {/* Sloshing fuel in the neck while pumping */}
      {fueling ? (
        <motion.ellipse
          cx={cx}
          cy={PORT_Y}
          rx={17}
          initial={{ ry: 2 }}
          animate={{ ry: [3, 5, 3] }}
          transition={{ duration: 0.4, repeat: Infinity }}
          fill="#3aa0ff"
          opacity={0.85}
        />
      ) : null}

      {/* FULL / overflow cue */}
      {full ? (
        <g>
          <motion.text
            x={cx}
            y={PORT_Y - 22}
            textAnchor="middle"
            className="aviation-header"
            fill="#c9a227"
            fontSize={13}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {labels.full}
          </motion.text>
          <motion.circle
            cx={cx + 20}
            cy={PORT_Y + 2}
            r={2.5}
            fill="#3aa0ff"
            initial={{ cy: PORT_Y, opacity: 0 }}
            animate={{ cy: PORT_Y + 16, opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        </g>
      ) : null}

      {/* Label + what the pilot KNOWS (only after dipping) */}
      <text
        x={cx}
        y={Y_BOT + 20}
        textAnchor="middle"
        className="aviation-mono"
        fill="#78716c"
        fontSize={10}
        letterSpacing={1.5}
      >
        {label}
      </text>
      <text
        x={cx}
        y={Y_BOT + 36}
        textAnchor="middle"
        className="aviation-header"
        fill={measured != null ? "#1f2937" : "#a39e99"}
        fontSize={13}
      >
        {measured != null
          ? `${fmtGal(measured)} ${labels.gal}`
          : `${labels.unknown} ${labels.gal}`}
      </text>
      {measured == null ? (
        <text
          x={cx}
          y={Y_BOT + 49}
          textAnchor="middle"
          className="aviation-mono"
          fill="#a39e99"
          fontSize={8}
          letterSpacing={1}
        >
          {labels.unknownHint}
        </text>
      ) : null}
    </g>
  );
}

// --- Animated fuel stream from the nozzle tip into the port -----------------
function FuelStream({ cx, nzTipX, nzTipY }: { cx: number; nzTipX: number; nzTipY: number }) {
  return (
    <g>
      <motion.rect
        x={(nzTipX + cx) / 2 - 2.5}
        width={5}
        rx={2.5}
        initial={false}
        animate={{ y: nzTipY, height: Math.max(0, PORT_Y - nzTipY) }}
        transition={{ duration: 0.08 }}
        fill="url(#avgas-stream)"
      />
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={(nzTipX + cx) / 2}
          r={2}
          fill="#3aa0ff"
          initial={{ cy: nzTipY, opacity: 0 }}
          animate={{ cy: PORT_Y, opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.16 }}
        />
      ))}
    </g>
  );
}

// --- Fuel nozzle (draggable, local origin at grip) --------------------------
function Nozzle({ active }: { active: boolean }) {
  return (
    <g>
      {/* Grip body */}
      <rect x={-15} y={-8} width={30} height={34} rx={7} fill="#b8860b" stroke="#7a5a08" strokeWidth={1.5} />
      <rect x={-15} y={-8} width={30} height={9} rx={4} fill="#d8a93a" />
      {/* Trigger */}
      <path d="M -10 18 Q -22 22 -16 32" fill="none" stroke="#5a4406" strokeWidth={4} strokeLinecap="round" />
      {/* Spout */}
      <rect x={-4} y={24} width={8} height={48} rx={3} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />
      <rect x={-6} y={70} width={12} height={8} rx={2} fill="#475569" />
      {active ? <circle cx={0} cy={80} r={3} fill="#3aa0ff" /> : null}
    </g>
  );
}

// --- Dipstick (draggable, local origin at handle) ---------------------------
function Dipstick({
  wetFrac,
  readGal,
  galLabel,
}: {
  wetFrac: number;
  readGal: number | null;
  galLabel: string;
}) {
  const ROD_W = 7;
  const wetH = wetFrac * TANK_H;
  // Gallon graduations — non-uniform because the trapezoid is wider at the top.
  const marks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((g) => ({
    g,
    y: DIP_TIP_Y - fillHeightFrac(g / PER_TANK_GAL) * TANK_H,
  }));

  return (
    <g>
      {/* Handle */}
      <rect x={-9} y={-12} width={18} height={16} rx={3} fill="#6b0f1a" />
      <rect x={-9} y={-12} width={18} height={5} rx={2} fill="#8b1f2a" />
      {/* Rod */}
      <rect
        x={-ROD_W / 2}
        y={2}
        width={ROD_W}
        height={DIP_TIP_Y - 2}
        rx={2}
        fill="#d8c9a0"
        stroke="#8a7a52"
        strokeWidth={0.75}
      />
      {/* Wetted portion (the persisted mark) */}
      {wetH > 0 ? (
        <>
          <rect
            x={-ROD_W / 2}
            y={DIP_TIP_Y - wetH}
            width={ROD_W}
            height={wetH}
            rx={2}
            fill="#2a7fce"
            opacity={0.85}
          />
          <line
            x1={-ROD_W / 2 - 2}
            y1={DIP_TIP_Y - wetH}
            x2={ROD_W / 2 + 2}
            y2={DIP_TIP_Y - wetH}
            stroke="#bfe3ff"
            strokeWidth={1.5}
          />
        </>
      ) : null}
      {/* Gallon marks */}
      {marks.map((m) => (
        <g key={m.g}>
          <line
            x1={ROD_W / 2}
            y1={m.y}
            x2={ROD_W / 2 + (m.g % 2 === 0 ? 7 : 4)}
            y2={m.y}
            stroke="#3a3120"
            strokeWidth={1}
          />
          {m.g % 2 === 0 ? (
            <text
              x={ROD_W / 2 + 10}
              y={m.y + 3}
              className="aviation-mono"
              fill="#57534e"
              fontSize={8}
            >
              {m.g}
            </text>
          ) : null}
        </g>
      ))}
      {/* Live reading tag once the stick is out */}
      {readGal != null ? (
        <g transform={`translate(${-ROD_W / 2 - 14}, ${DIP_TIP_Y - wetH})`}>
          <rect x={-44} y={-9} width={44} height={18} rx={3} fill="#0f172a" />
          <text
            x={-22}
            y={4}
            textAnchor="middle"
            className="aviation-header"
            fill="#c9a227"
            fontSize={11}
          >
            {fmtGal(readGal)} {galLabel}
          </text>
        </g>
      ) : null}
    </g>
  );
}

// --- Cockpit round fuel gauge (E - ½ - F) ----------------------------------
function FuelGauge({ frac, label }: { frac: number; label: string }) {
  // Needle sweeps a 120° arc: E at -60°, F at +60° (0° = straight up).
  const clamped = clamp(frac, 0, 1);
  const angle = -60 + clamped * 120;
  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = 50;
  const cy = 52;
  const r = 30;
  const tip = { x: round3(cx + r * Math.cos(rad)), y: round3(cy + r * Math.sin(rad)) };

  const tickAt = (a: number, len: number) => {
    const rr = ((a - 90) * Math.PI) / 180;
    return {
      x1: round3(cx + (r + 2) * Math.cos(rr)),
      y1: round3(cy + (r + 2) * Math.sin(rr)),
      x2: round3(cx + (r + 2 - len) * Math.cos(rr)),
      y2: round3(cy + (r + 2 - len) * Math.sin(rr)),
    };
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 78" className="w-24 h-auto">
        <circle cx={cx} cy={cy} r={r + 6} fill="#1f2937" />
        <circle cx={cx} cy={cy} r={r + 2} fill="#0f172a" stroke="#4b5563" strokeWidth={1} />

        {/* Red "accurate only at E" zone near empty */}
        <path
          d={(() => {
            const a0 = ((-60 - 90) * Math.PI) / 180;
            const a1 = ((-42 - 90) * Math.PI) / 180;
            const rr = r - 1;
            return `M ${round3(cx + rr * Math.cos(a0))} ${round3(cy + rr * Math.sin(a0))} A ${rr} ${rr} 0 0 1 ${round3(cx + rr * Math.cos(a1))} ${round3(cy + rr * Math.sin(a1))}`;
          })()}
          fill="none"
          stroke="#8b0000"
          strokeWidth={3}
        />

        {[
          { a: -60, len: 7, txt: "E" },
          { a: 0, len: 6, txt: "½" },
          { a: 60, len: 7, txt: "F" },
        ].map((mk) => {
          const tk = tickAt(mk.a, mk.len);
          const lr = ((mk.a - 90) * Math.PI) / 180;
          return (
            <g key={mk.txt}>
              <line {...tk} stroke="#f4efe6" strokeWidth={1.5} />
              <text
                x={round3(cx + (r - 9) * Math.cos(lr))}
                y={round3(cy + (r - 9) * Math.sin(lr) + 3)}
                textAnchor="middle"
                className="aviation-mono"
                fill="#f4efe6"
                fontSize={8}
              >
                {mk.txt}
              </text>
            </g>
          );
        })}

        <motion.line
          x1={cx}
          y1={cy}
          initial={false}
          animate={{ x2: tip.x, y2: tip.y }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
          stroke="#c9a227"
          strokeWidth={2}
        />
        <circle cx={cx} cy={cy} r={3} fill="#9ca3af" />
      </svg>
      <div className="aviation-mono text-[8px] tracking-[0.1em] text-[#78716c]">
        {label}
      </div>
    </div>
  );
}
