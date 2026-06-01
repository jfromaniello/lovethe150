"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUnits } from "../UnitsContext";
import { useI18n } from "../LanguageContext";
import { useSound } from "../SoundContext";
import SectionHeader from "./SectionHeader";
import WhyUnitsButton from "./WhyUnitsButton";

// Cessna 150 ASI layout: 0 anchored at 12 o'clock (needle rest position),
// scale wraps ~330° clockwise to 200 MPH near the upper-left. Small (~30°)
// gap at the top.
const ARC_CONFIG = {
  centerX: 200,
  centerY: 200,
  radius: 160,
  startAngle: 0,
  endAngle: 330,
};

// POH airspeed indicator markings (CAS) in MPH — Cessna 1969 150J Owner's Manual.
const POH_MPH = {
  whiteArc: { from: 49, to: 100 }, // flap operating
  greenArc: { from: 56, to: 120 }, // normal operating
  yellowArc: { from: 120, to: 162 }, // caution
  redLine: 162, // never exceed
};

const MPH_TO_KTS = 0.868976;

// Concentric arc bands inside the 400×400 viewBox. White is the inner band so
// it stays visible where it overlaps with the green arc.
const ARC = {
  white: { radius: 142, stroke: 6 },
  outer: { radius: 156, stroke: 10 },
  tickOuter: 137,
  tickMajorInner: 119,
  tickMinorInner: 127,
  labelRadius: 105,
  redLineFrom: 138,
  redLineTo: 170,
};

type ZoneId = "white" | "green" | "yellow" | "red";

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  // Round to 3 decimals so SSR and client serialize identical SVG coordinates;
  // Math.cos/sin can differ in the last bit across runtimes (see ThrottlePower).
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
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function AirspeedIndicator() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { unit, label, labelIndicated, format } = useUnits();
  const { t, fmt } = useI18n();
  const { enabled: soundEnabled } = useSound();
  const [hoveredSpeed, setHoveredSpeed] = useState<number | null>(null);

  // Native-unit gauge config + POH arcs translated to the active unit.
  const gauge = useMemo(() => {
    const toUnit = (mph: number) =>
      unit === "mph" ? mph : mph * MPH_TO_KTS;
    const zones: Array<{ id: ZoneId; label: string; from: number; to: number; color: string }> = [
      { id: "white", label: t.airspeed.zones.white, from: toUnit(POH_MPH.whiteArc.from), to: toUnit(POH_MPH.whiteArc.to), color: "#e5e7eb" },
      { id: "green", label: t.airspeed.zones.green, from: toUnit(POH_MPH.greenArc.from), to: toUnit(POH_MPH.greenArc.to), color: "#10b981" },
      { id: "yellow", label: t.airspeed.zones.yellow, from: toUnit(POH_MPH.yellowArc.from), to: toUnit(POH_MPH.yellowArc.to), color: "#f59e0b" },
      { id: "red", label: t.airspeed.zones.red, from: toUnit(POH_MPH.redLine), to: toUnit(POH_MPH.redLine), color: "#ef4444" },
    ];
    // gauge.min = 0 puts the needle's rest position at 12 o'clock (matching the
    // real ASI). The "0" tick is intentionally omitted — the printed scale starts
    // at 40, but the angular reference is still 0 at the top.
    if (unit === "mph") {
      return {
        min: 0,
        max: 200,
        majorTicks: [40, 60, 80, 100, 120, 140, 160, 180, 200],
        minorTicks: [50, 70, 90, 110, 130, 150, 170, 190],
        zones,
        redLine: toUnit(POH_MPH.redLine),
      };
    }
    return {
      min: 0,
      max: 180,
      majorTicks: [40, 60, 80, 100, 120, 140, 160, 180],
      minorTicks: [50, 70, 90, 110, 130, 150, 170],
      zones,
      redLine: toUnit(POH_MPH.redLine),
    };
  }, [unit, t]);

  const speedToAngle = (speed: number): number => {
    const clamped = Math.max(gauge.min, Math.min(gauge.max, speed));
    const t = (clamped - gauge.min) / (gauge.max - gauge.min);
    return (
      ARC_CONFIG.startAngle + t * (ARC_CONFIG.endAngle - ARC_CONFIG.startAngle)
    );
  };

  // POH §5-3 cruise figure: ~110 MPH indicated at 75% power. Used as the
  // target for the welcome sweep.
  const CRUISE_MPH = 110;
  const cruiseSpeed = unit === "mph" ? CRUISE_MPH : CRUISE_MPH * MPH_TO_KTS;

  // Resting needle: sweeps 0 → cruise once the section enters the viewport,
  // then stays there. Re-sweeps on unit change so the cruise marker lands at
  // the equivalent angle in the new scale.
  const restingSpeed = useMotionValue(gauge.min);
  useEffect(() => {
    if (!isInView) return;
    restingSpeed.set(gauge.min);
    const controls = animate(restingSpeed, cruiseSpeed, {
      duration: 2.8,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [isInView, cruiseSpeed, restingSpeed]);

  const displaySpeed = useTransform(restingSpeed, (v) =>
    hoveredSpeed === null ? v : hoveredSpeed
  );
  const needleRotation = useTransform(displaySpeed, (v) => speedToAngle(v));
  const needleRotationSmooth = useSpring(needleRotation, {
    stiffness: 120,
    damping: 15,
  });

  // Mirror the displaySpeed motion value into React state so the SVG readout
  // and the lectura-actual panel re-render frame-by-frame during the welcome
  // sweep (motion values don't trigger renders on their own).
  const [displaySpeedNum, setDisplaySpeedNum] = useState(() =>
    Math.round(gauge.min)
  );
  useEffect(() => {
    setDisplaySpeedNum(Math.round(displaySpeed.get()));
    const unsub = displaySpeed.on("change", (v) => {
      const next = Math.round(v);
      setDisplaySpeedNum((prev) => (prev === next ? prev : next));
    });
    return unsub;
  }, [displaySpeed]);

  // Per-speed contextual guidance. Comparisons are in MPH against POH values.
  const speedContext = useMemo(() => {
    if (displaySpeedNum <= 0) return null;
    const mph =
      unit === "mph" ? displaySpeedNum : displaySpeedNum / MPH_TO_KTS;
    const c = t.airspeed.contexts;
    if (mph >= POH_MPH.redLine) return { ...c.exceed, color: "#ef4444" };
    if (mph >= POH_MPH.yellowArc.from) return { ...c.caution, color: "#f59e0b" };
    if (mph > POH_MPH.whiteArc.to) return { ...c.normalClean, color: "#10b981" };
    if (mph >= POH_MPH.greenArc.from) return { ...c.normalFlaps, color: "#10b981" };
    if (mph >= POH_MPH.whiteArc.from) return { ...c.flapsOnly, color: "#e5e7eb" };
    return { ...c.belowStall, color: "#ef4444" };
  }, [displaySpeedNum, unit, t]);

  // Cessna 150 stall warning: a pneumatic reed in the leading-edge slot. As the
  // wing approaches stall, airflow draws air through the slot and vibrates the
  // reed → harsh nasal "EEEEEE". Modeled here as two oscillators (saw + square
  // for odd-harmonic reed character) through a narrow bandpass, with a small
  // LFO detuning osc1 to mimic the natural wobble of an airflow-driven reed.
  type StallAudio = {
    ctx: AudioContext;
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
    filter: BiquadFilterNode;
    gain: GainNode;
  };
  const stallAudioRef = useRef<StallAudio | null>(null);
  const alarmStateRef = useRef<{ playing: boolean; wasInStall: boolean }>({
    playing: false,
    wasInStall: false,
  });

  const ensureStallAudio = useCallback(() => {
    if (stallAudioRef.current) return stallAudioRef.current;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.value = 620;
    const osc2 = ctx.createOscillator();
    osc2.type = "square";
    osc2.frequency.value = 465;
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 7;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 14; // cents of detune
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1700;
    filter.Q.value = 1;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.detune);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc1.start();
    osc2.start();
    lfo.start();
    stallAudioRef.current = { ctx, osc1, osc2, lfo, lfoGain, filter, gain };
    return stallAudioRef.current;
  }, []);

  const playStallHorn = useCallback(() => {
    const nodes = ensureStallAudio();
    if (!nodes) return;
    if (nodes.ctx.state === "suspended") {
      void nodes.ctx.resume();
    }
    const now = nodes.ctx.currentTime;
    const peak = 0.2;
    nodes.gain.gain.cancelScheduledValues(now);
    nodes.gain.gain.setValueAtTime(0, now);
    nodes.gain.gain.linearRampToValueAtTime(peak, now + 0.015);
    nodes.gain.gain.setValueAtTime(peak, now + 1.95);
    nodes.gain.gain.linearRampToValueAtTime(0, now + 2.0);
  }, [ensureStallAudio]);

  // Trigger on transition from a non-stall reading into the below-stall zone
  // (mph < whiteArc.from = 49 mph). The "playing" guard suppresses retriggers
  // while the 2-second horn is still sounding.
  useEffect(() => {
    if (hoveredSpeed === null) {
      alarmStateRef.current.wasInStall = false;
      return;
    }
    const mph = unit === "mph" ? hoveredSpeed : hoveredSpeed / MPH_TO_KTS;
    const inStall = mph < POH_MPH.whiteArc.from;
    if (
      inStall &&
      soundEnabled &&
      !alarmStateRef.current.wasInStall &&
      !alarmStateRef.current.playing
    ) {
      alarmStateRef.current.playing = true;
      playStallHorn();
      setTimeout(() => {
        alarmStateRef.current.playing = false;
      }, 2000);
    }
    alarmStateRef.current.wasInStall = inStall;
  }, [hoveredSpeed, unit, playStallHorn, soundEnabled]);

  useEffect(() => {
    return () => {
      const nodes = stallAudioRef.current;
      if (!nodes) return;
      try {
        nodes.osc1.stop();
        nodes.osc2.stop();
        nodes.lfo.stop();
        nodes.ctx.close();
      } catch {}
      stallAudioRef.current = null;
    };
  }, []);

  const updateSpeedFromPointer = (
    clientX: number,
    clientY: number,
    svg: SVGSVGElement
  ) => {
    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width / 400;
    const scaleY = rect.height / 400;
    const x = (clientX - rect.left) / scaleX - ARC_CONFIG.centerX;
    const y = (clientY - rect.top) / scaleY - ARC_CONFIG.centerY;
    const raw = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const angle = ((raw % 360) + 360) % 360; // [0, 360)

    if (angle >= ARC_CONFIG.startAngle && angle <= ARC_CONFIG.endAngle) {
      const t =
        (angle - ARC_CONFIG.startAngle) /
        (ARC_CONFIG.endAngle - ARC_CONFIG.startAngle);
      const speed = gauge.min + t * (gauge.max - gauge.min);
      setHoveredSpeed(
        Math.round(Math.max(gauge.min, Math.min(gauge.max, speed)))
      );
    }
    // Outside the dial's 330° arc (small gap at the top): keep the last value.
  };

  // Pointer Events unify mouse hover (desktop) with touch drag (mobile). Mouse
  // events fire freely on hover; touch events only fire while a finger is down,
  // so a single onPointerMove handler covers both. We capture the pointer on
  // touch/pen so updates keep flowing if the finger drifts outside the SVG.
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    updateSpeedFromPointer(e.clientX, e.clientY, e.currentTarget);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    // iOS Safari only allows AudioContext creation inside a real gesture.
    ensureStallAudio();
    updateSpeedFromPointer(e.clientX, e.clientY, e.currentTarget);
  };

  const whiteArcLabel = `${format(POH_MPH.whiteArc.from)}–${format(POH_MPH.whiteArc.to)} ${labelIndicated}`;
  const redLineLabel = `${format(POH_MPH.redLine)} ${labelIndicated}`;

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="airspeed" title={t.airspeed.title}>
            <p className="text-[#57534e] max-w-2xl text-lg leading-relaxed">
              {t.airspeed.intro}
            </p>
            <p className="mt-4 text-[#57534e] max-w-2xl text-lg leading-relaxed">
              {t.airspeed.intro2}
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
              <div>
                {t.airspeed.callout}
                <WhyUnitsButton className="ml-2 align-baseline" />
              </div>
            </div>
          </SectionHeader>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center order-1"
          >
            <div className="relative">
              <svg
                viewBox="0 0 400 400"
                className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] cursor-crosshair"
                style={{ touchAction: "none" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
              >
                {/* Dial face — dark so the white arc and light markings stay legible. */}
                <circle cx={200} cy={200} r={173} fill="#1f2937" />

                {/* Outer bezel ring */}
                <circle
                  cx={200}
                  cy={200}
                  r={185}
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth={2}
                />
                <circle
                  cx={200}
                  cy={200}
                  r={175}
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth={1}
                />

                {/* Speed zone arcs — white on its own inner band so it stays visible. */}
                {gauge.zones
                  .filter((z) => z.from !== z.to)
                  .map((zone) => {
                    const band = zone.id === "white" ? ARC.white : ARC.outer;
                    const startA = speedToAngle(zone.from);
                    const endA = speedToAngle(zone.to);
                    return (
                      <path
                        key={zone.id}
                        d={describeArc(200, 200, band.radius, startA, endA)}
                        fill="none"
                        stroke={zone.color}
                        strokeWidth={band.stroke}
                        strokeLinecap="butt"
                        opacity={0.9}
                      />
                    );
                  })}

                {/* Red line */}
                <line
                  x1={polarToCartesian(200, 200, ARC.redLineFrom, speedToAngle(gauge.redLine)).x}
                  y1={polarToCartesian(200, 200, ARC.redLineFrom, speedToAngle(gauge.redLine)).y}
                  x2={polarToCartesian(200, 200, ARC.redLineTo, speedToAngle(gauge.redLine)).x}
                  y2={polarToCartesian(200, 200, ARC.redLineTo, speedToAngle(gauge.redLine)).y}
                  stroke="#ef4444"
                  strokeWidth={3}
                />

                {/* Ticks and labels */}
                {[...gauge.majorTicks, ...gauge.minorTicks]
                  .sort((a, b) => a - b)
                  .map((speed) => {
                    const angle = speedToAngle(speed);
                    const isMajor = gauge.majorTicks.includes(speed);
                    const innerR = isMajor ? ARC.tickMajorInner : ARC.tickMinorInner;
                    const outerR = ARC.tickOuter;
                    const labelR = ARC.labelRadius;
                    const start = polarToCartesian(200, 200, innerR, angle);
                    const end = polarToCartesian(200, 200, outerR, angle);
                    const labelPos = polarToCartesian(200, 200, labelR, angle);
                    return (
                      <g key={speed}>
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
                            {speed}
                          </text>
                        )}
                      </g>
                    );
                  })}

                {/* Upper-half labels and digital readout — moved above the needle
                    hub at (200,200) so they're no longer covered by it. */}
                <text
                  x={200}
                  y={120}
                  textAnchor="middle"
                  className="aviation-mono"
                  fill="#9ca3af"
                  fontSize={10}
                  letterSpacing={2}
                >
                  {t.airspeed.digit.airspeed}
                </text>

                {/* Digital readout window */}
                <rect
                  x={160}
                  y={130}
                  width={80}
                  height={30}
                  rx={2}
                  fill="#0f172a"
                  stroke="#9ca3af"
                  strokeWidth={0.75}
                />
                <text
                  x={200}
                  y={147}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="aviation-mono"
                  fill="#f4efe6"
                  fontSize={18}
                  fontWeight={600}
                  letterSpacing={1}
                >
                  {displaySpeedNum}
                </text>

                <text
                  x={200}
                  y={178}
                  textAnchor="middle"
                  className="aviation-mono"
                  fill="#9ca3af"
                  fontSize={10}
                  letterSpacing={2}
                >
                  {label}
                </text>

                {/* Needle — transformBox: view-box anchors transform-origin to
                    SVG viewBox coordinates so (200,200) is the actual gauge center. */}
                <motion.g
                  style={{
                    rotate: needleRotationSmooth,
                    transformOrigin: "200px 200px",
                    transformBox: "view-box",
                  }}
                >
                  <polygon
                    points="200,200 196,110 200,100 204,110"
                    fill="#6b0f1a"
                  />
                  <circle cx={200} cy={200} r={8} fill="#4b5563" />
                  <circle cx={200} cy={200} r={4} fill="#6b0f1a" />
                </motion.g>
              </svg>

              {/* Bezel shadow overlay */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.08)] pointer-events-none" />
            </div>
          </motion.div>

          {/* Current reading + pilot note — right of the gauge on desktop,
              directly under the gauge on mobile. */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-6 order-2"
          >
            <div className="p-4 bg-[#1f2937] text-[#f4efe6] min-h-[200px]">
              <div className="aviation-mono text-xs tracking-wider opacity-70 mb-2">
                {t.airspeed.current}
              </div>
              {speedContext ? (
                <motion.div
                  key={speedContext.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="aviation-header text-2xl mb-2">
                    {displaySpeedNum} {labelIndicated}
                  </div>
                  <div
                    className="aviation-mono text-[11px] uppercase tracking-[0.15em] mb-1"
                    style={{ color: speedContext.color }}
                  >
                    {speedContext.label}
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    {speedContext.body}
                  </p>
                </motion.div>
              ) : (
                <p className="text-sm opacity-50 italic mt-1">
                  {t.airspeed.contexts.idle}
                </p>
              )}
            </div>

            <div className="p-5 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
              <div className="aviation-mono text-xs tracking-[0.15em] text-[#6b0f1a] mb-2">
                {t.airspeed.pilotNote}
              </div>
              <p className="text-sm text-[#57534e] leading-relaxed">
                {fmt(t.airspeed.pilotNoteBody, {
                  white: whiteArcLabel,
                  red: redLineLabel,
                })}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Zone legend — horizontal cards at the bottom of the section. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12"
        >
          {gauge.zones.map((zone) => (
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
                    ? `${Math.round(zone.from)} ${labelIndicated}`
                    : `${Math.round(zone.from)} – ${Math.round(zone.to)} ${labelIndicated}`}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
