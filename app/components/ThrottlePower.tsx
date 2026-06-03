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

// Continental O-200-A tachometer for the Cessna 150. The dial sweeps ~270°
// from lower-left (0 RPM, 7 o'clock) clockwise to lower-right (3000 RPM,
// 5 o'clock). 1969 Owner's Manual: max engine RPM (red line) is 2750.
const ARC_CONFIG = {
  centerX: 200,
  centerY: 200,
  startAngle: -135,
  endAngle: 135,
};

const RPM_MAX_DIAL = 3000;
// 1969 POH §3-3: green arc widens with altitude — 2000-2550 at SL (inner arc)
// up to 2000-2750 at 10,000 ft (outer arc). We render the SL band; the pilot
// note mentions the altitude effect. POH does not define a yellow arc.
const POH_RPM = {
  greenArc: { from: 2000, to: 2550 },
  redLine: 2750,
};

// Throttle ↔ RPM mapping. The lever can dip below the POH §2-13 recommended
// 1,000 RPM (down to mechanical idle around 600 RPM) — we flag it in the
// description card so the user knows they're outside POH guidance.
const IDLE_RPM = 600;
const FULL_RPM = 2750;
const RECOMMENDED_MIN_RPM = 1000;

const MAJOR_TICKS = [0, 500, 1000, 1500, 2000, 2500, 3000];
const MINOR_TICKS = [
  100, 200, 300, 400,
  600, 700, 800, 900,
  1100, 1200, 1300, 1400,
  1600, 1700, 1800, 1900,
  2100, 2200, 2300, 2400,
  2600, 2700, 2800, 2900,
];

const ARC = {
  outer: { radius: 156, stroke: 10 },
  tickOuter: 137,
  tickMajorInner: 119,
  tickMinorInner: 127,
  labelRadius: 100,
  redLineFrom: 138,
  redLineTo: 170,
};

type ZoneId = "green" | "red";

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  // Round to 3 decimals: Math.cos/sin can differ in the last bit between the
  // SSR runtime and the browser, and the raw floats land verbatim in SVG
  // attributes — enough to trip a hydration mismatch. Rounding is invisible
  // at this viewBox size and makes both renders byte-identical.
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

function rpmToAngle(rpm: number): number {
  const clamped = Math.max(0, Math.min(RPM_MAX_DIAL, rpm));
  const t = clamped / RPM_MAX_DIAL;
  return (
    ARC_CONFIG.startAngle + t * (ARC_CONFIG.endAngle - ARC_CONFIG.startAngle)
  );
}

export default function ThrottlePower() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t, fmt } = useI18n();
  // Live in-view (the entry `isInView` above latches once and never resets).
  const audioInView = useInView(ref, { amount: 0.3 });
  const [throttle, setThrottle] = useState(0);

  // RPM the dial is converging to. While the user is dragging this is the
  // ground truth — the needle's spring chases it.
  const targetRpm = useMemo(
    () => IDLE_RPM + throttle * (FULL_RPM - IDLE_RPM),
    [throttle],
  );

  const zones = useMemo(
    () => [
      {
        id: "green" as ZoneId,
        label: t.throttle.zones.green,
        from: POH_RPM.greenArc.from,
        to: POH_RPM.greenArc.to,
        color: "#10b981",
      },
      {
        id: "red" as ZoneId,
        label: t.throttle.zones.red,
        from: POH_RPM.redLine,
        to: POH_RPM.redLine,
        color: "#ef4444",
      },
    ],
    [t],
  );

  // Animated RPM that follows targetRpm with a small spring lag — gives the
  // needle realistic flex when the throttle changes quickly.
  const needleRpm = useMotionValue(0);
  useEffect(() => {
    if (!isInView) return;
    const controls = animate(needleRpm, targetRpm, {
      type: "spring",
      stiffness: 130,
      damping: 18,
    });
    return () => controls.stop();
  }, [isInView, targetRpm, needleRpm]);

  const needleAngle = useTransform(needleRpm, (rpm) => rpmToAngle(rpm));

  const powerContext = useMemo(() => {
    const rpm = targetRpm;
    const c = t.throttle.contexts;
    if (rpm < RECOMMENDED_MIN_RPM) return { ...c.belowMin, color: "#f59e0b" };
    if (rpm < 1200) return { ...c.idle, color: "#e5e7eb" };
    if (rpm < 1500) return { ...c.taxi, color: "#e5e7eb" };
    if (rpm < 1900) return { ...c.runup, color: "#10b981" };
    if (rpm < 2200) return { ...c.economy, color: "#10b981" };
    if (rpm < 2550) return { ...c.cruise, color: "#10b981" };
    if (rpm < 2700) return { ...c.climb, color: "#f59e0b" };
    return { ...c.takeoff, color: "#f59e0b" };
  }, [targetRpm, t]);

  // Engine audio: the fundamental tracks RPM so it buzzes higher as you push
  // the throttle in. Fixed-pitch, no rough mode, so roughness stays at 0.
  const engine = useEngineSound({ rpm: targetRpm, inView: audioInView });

  const handleThrottleChange = useCallback(
    (v: number) => {
      setThrottle(Math.max(0, Math.min(1, v)));
      engine.poke();
    },
    [engine],
  );

  const displayRpm = Math.round(targetRpm / 10) * 10;

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="throttle" title={t.throttle.title}>
            <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
              {t.throttle.intro2}
            </p>
            <TechnicalDetail label={t.controls.detail}>
              <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
                {t.throttle.intro}
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
              <div>{t.throttle.callout}</div>
            </div>
          </SectionHeader>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-4 sm:gap-6 order-1"
          >
            <Tachometer
              needleAngle={needleAngle}
              displayRpm={displayRpm}
              zones={zones}
              labels={{
                rpm: t.throttle.digit.rpm,
                hundreds: t.throttle.digit.hundreds,
              }}
            />
            <ThrottleLever
              throttle={throttle}
              onChange={handleThrottleChange}
              title={t.throttle.lever.title}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-6 order-2"
          >
            <div className="p-4 bg-[#1f2937] text-[#f4efe6] min-h-[200px]">
              <div className="aviation-mono text-xs tracking-wider opacity-70 mb-2">
                {t.throttle.current}
              </div>
              <motion.div
                key={powerContext.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="aviation-header text-2xl mb-2 tabular-nums">
                  {displayRpm} {t.throttle.digit.rpm}
                  <span className="ml-3 aviation-mono text-sm opacity-70">
                    {Math.round(throttle * 100)}%
                  </span>
                </div>
                <div
                  className="aviation-mono text-[11px] uppercase tracking-[0.15em] mb-1"
                  style={{ color: powerContext.color }}
                >
                  {powerContext.label}
                </div>
                <p className="text-sm leading-relaxed opacity-90">
                  {powerContext.body}
                </p>
              </motion.div>
            </div>

            <div className="p-5 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
              <div className="aviation-mono text-xs tracking-[0.15em] text-[#6b0f1a] mb-2">
                {t.throttle.pilotNote}
              </div>
              <p className="text-sm text-[#57534e] leading-relaxed">
                {fmt(t.throttle.pilotNoteBody, {
                  redline: `${POH_RPM.redLine} ${t.throttle.digit.rpm}`,
                })}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 max-w-2xl"
        >
          {zones.map((zone) => (
            <div
              key={zone.label}
              className="flex items-center gap-3 p-4 bg-[#e8e2d8]/30 border border-[#1f2937]/5 hover:border-[#6b0f1a]/20 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: zone.color,
                  opacity: zone.from === zone.to ? 1 : 0.85,
                }}
              />
              <div className="min-w-0">
                <div className="aviation-mono text-sm text-[#1f2937] font-medium truncate">
                  {zone.label}
                </div>
                <div className="aviation-mono text-xs text-[#78716c]">
                  {zone.from === zone.to
                    ? `${zone.from} ${t.throttle.digit.rpm}`
                    : `${zone.from} – ${zone.to} ${t.throttle.digit.rpm}`}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Tachometer({
  needleAngle,
  displayRpm,
  zones,
  labels,
}: {
  needleAngle: MotionValue<number>;
  displayRpm: number;
  zones: Array<{ id: ZoneId; from: number; to: number; color: string }>;
  labels: { rpm: string; hundreds: string };
}) {
  const redLineStart = polarToCartesian(
    200,
    200,
    ARC.redLineFrom,
    rpmToAngle(POH_RPM.redLine),
  );
  const redLineEnd = polarToCartesian(
    200,
    200,
    ARC.redLineTo,
    rpmToAngle(POH_RPM.redLine),
  );

  return (
    <div className="relative">
      <svg
        viewBox="0 0 400 400"
        className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px]"
      >
        <circle cx={200} cy={200} r={173} fill="#1f2937" />
        <circle cx={200} cy={200} r={185} fill="none" stroke="#1f2937" strokeWidth={2} />
        <circle cx={200} cy={200} r={175} fill="none" stroke="#9ca3af" strokeWidth={1} />

        {zones
          .filter((z) => z.from !== z.to)
          .map((zone) => {
            const startA = rpmToAngle(zone.from);
            const endA = rpmToAngle(zone.to);
            return (
              <path
                key={zone.id}
                d={describeArc(200, 200, ARC.outer.radius, startA, endA)}
                fill="none"
                stroke={zone.color}
                strokeWidth={ARC.outer.stroke}
                strokeLinecap="butt"
                opacity={0.9}
              />
            );
          })}

        <line
          x1={redLineStart.x}
          y1={redLineStart.y}
          x2={redLineEnd.x}
          y2={redLineEnd.y}
          stroke="#ef4444"
          strokeWidth={3}
        />

        {[...MAJOR_TICKS, ...MINOR_TICKS]
          .sort((a, b) => a - b)
          .map((rpm) => {
            const angle = rpmToAngle(rpm);
            const isMajor = MAJOR_TICKS.includes(rpm);
            const innerR = isMajor ? ARC.tickMajorInner : ARC.tickMinorInner;
            const outerR = ARC.tickOuter;
            const labelR = ARC.labelRadius;
            const start = polarToCartesian(200, 200, innerR, angle);
            const end = polarToCartesian(200, 200, outerR, angle);
            const labelPos = polarToCartesian(200, 200, labelR, angle);
            return (
              <g key={rpm}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#f4efe6"
                  strokeWidth={isMajor ? 2 : 1}
                />
                {isMajor && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="aviation-mono"
                    fill="#f4efe6"
                    fontSize={14}
                    fontWeight={600}
                  >
                    {rpm / 100}
                  </text>
                )}
              </g>
            );
          })}

        <text
          x={200}
          y={130}
          textAnchor="middle"
          className="aviation-mono"
          fill="#9ca3af"
          fontSize={10}
          letterSpacing={2}
        >
          {labels.rpm}
        </text>
        <text
          x={200}
          y={146}
          textAnchor="middle"
          className="aviation-mono"
          fill="#9ca3af"
          fontSize={8}
          letterSpacing={1.5}
        >
          {labels.hundreds}
        </text>

        <rect
          x={150}
          y={252}
          width={100}
          height={30}
          rx={2}
          fill="#0f172a"
          stroke="#9ca3af"
          strokeWidth={0.75}
        />
        <text
          x={200}
          y={269}
          textAnchor="middle"
          dominantBaseline="middle"
          className="aviation-mono"
          fill="#f4efe6"
          fontSize={18}
          fontWeight={600}
          letterSpacing={1}
        >
          {displayRpm}
        </text>

        <motion.g
          style={{
            rotate: needleAngle,
            transformOrigin: "200px 200px",
            transformBox: "view-box",
          }}
        >
          <polygon points="200,200 196,110 200,100 204,110" fill="#6b0f1a" />
          <circle cx={200} cy={200} r={8} fill="#4b5563" />
          <circle cx={200} cy={200} r={4} fill="#6b0f1a" />
        </motion.g>
      </svg>
      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.08)] pointer-events-none" />
    </div>
  );
}

// Modelled on the real C150 throttle: a panel-mounted push-pull knob.
// PANEL is fixed at the top with the cable hole; a silver knurled FRICTION
// collar lives just below the panel (the "frictor" the pilot turns to lock
// the throttle); SHAFT is a chromed rod that grows as the knob is pulled
// out; KNOB is a round black ball that the pilot grips.
const PANEL_HEIGHT = 44;
const COLLAR_HEIGHT = 14;
const KNOB_GAP = COLLAR_HEIGHT + 4; // minimum space between panel and knob
const TRAVEL = 200;
const KNOB_SIZE = 42;
const SHAFT_WIDTH = 6;
const TRACK_WIDTH = 68;
const TOTAL_HEIGHT = PANEL_HEIGHT + KNOB_GAP + TRAVEL + KNOB_SIZE;

function throttleToY(t: number): number {
  return (1 - t) * TRAVEL;
}
function yToThrottle(y: number): number {
  return Math.max(0, Math.min(1, 1 - y / TRAVEL));
}

function ThrottleLever({
  throttle,
  onChange,
  title,
}: {
  throttle: number;
  onChange: (t: number) => void;
  title: string;
}) {
  const y = useMotionValue(throttleToY(throttle));
  const dragging = useRef(false);
  // The chromed shaft extends from the panel face down to the knob top; its
  // length tracks y so push-in = short shaft, full pull-out = long shaft.
  const shaftHeight = useTransform(y, (v) => KNOB_GAP + 2 + v);

  useEffect(() => {
    if (dragging.current) return;
    const controls = animate(y, throttleToY(throttle), {
      type: "spring",
      stiffness: 280,
      damping: 26,
    });
    return () => controls.stop();
  }, [throttle, y]);

  const handleDrag = useCallback(() => {
    onChange(yToThrottle(y.get()));
  }, [onChange, y]);

  return (
    <div className="select-none flex flex-col items-center gap-2">
      <div className="aviation-mono text-[9px] tracking-[0.2em] text-[#78716c]">
        {title}
      </div>
      <div
        className="relative"
        style={{ width: TRACK_WIDTH, height: TOTAL_HEIGHT }}
      >
        {/* Panel face (engine controls plate) */}
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
          <div className="absolute inset-x-0 top-3 text-center aviation-mono text-[8px] tracking-[0.25em] text-[#f4efe6]/65">
            THROT
          </div>
          <div className="absolute inset-x-0 top-[22px] text-center aviation-mono text-[7px] tracking-[0.2em] text-[#f4efe6]/45">
            PUSH OPEN
          </div>
          {/* Shaft hole — recessed at the bottom-center of the panel */}
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

        {/* Cockpit-interior background behind the shaft + knob. A touch
            lighter than the panel so the dark knob reads against it. */}
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
            boxShadow:
              "0 0 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        />

        {/* Silver knurled friction lock — fixed at the top of the shaft */}
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
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.45)",
            zIndex: 5,
          }}
          aria-hidden="true"
        />

        {/* Black push-pull knob — round, high-contrast highlight */}
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
          style={{
            y,
            top: PANEL_HEIGHT + KNOB_GAP,
            touchAction: "none",
          }}
          whileTap={{ scale: 1.05 }}
          className="absolute left-1/2 z-10 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          aria-label={title}
        >
          <div
            style={{
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 24%, #9a9a9a 0%, #353535 38%, #0a0a0a 88%, #000 100%)",
              boxShadow:
                "0 7px 20px rgba(0,0,0,0.9), inset 0 -6px 10px rgba(0,0,0,0.55), inset 0 5px 8px rgba(255,255,255,0.4), 0 0 0 1px rgba(220,220,220,0.18)",
              border: "1px solid #000",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
