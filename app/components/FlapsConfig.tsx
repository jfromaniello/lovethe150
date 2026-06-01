"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUnits } from "../UnitsContext";
import { useI18n } from "../LanguageContext";
import { useSound } from "../SoundContext";
import type { Dict } from "../i18n/en";
import SectionHeader from "./SectionHeader";
import TechnicalDetail from "./TechnicalDetail";

type SettingKey = "up" | "ten" | "twenty" | "forty";
type Direction = "up" | "off" | "down";

type FlapSetting = {
  key: SettingKey;
  angle: number;
  label: string;
  vsMph: number | null;
  vfeMph: number | null;
  approachMph: [number, number] | null;
  refMph: number | null;
  color: string;
};

const BASE_SETTINGS: FlapSetting[] = [
  {
    key: "up",
    angle: 0,
    label: "UP",
    vsMph: 55,
    vfeMph: null,
    approachMph: [65, 75],
    refMph: 65,
    color: "#e5e7eb",
  },
  {
    key: "ten",
    angle: 10,
    label: "10°",
    vsMph: null,
    vfeMph: 100,
    approachMph: null,
    refMph: null,
    color: "#10b981",
  },
  {
    key: "twenty",
    angle: 20,
    label: "20°",
    vsMph: 49,
    vfeMph: 100,
    approachMph: [60, 70],
    refMph: null,
    color: "#f59e0b",
  },
  {
    key: "forty",
    angle: 40,
    label: "30° / 40°",
    vsMph: 48,
    vfeMph: 100,
    approachMph: [60, 70],
    refMph: 58,
    color: "#ef4444",
  },
];

const MIN_ANGLE = 0;
const MAX_ANGLE = 40;
const ANGLE_RATE = 6.5; // deg/s — full 40° travel in ~6 s (Cessna 150 electric flap motor)
const DETENT_ANGLES = [0, 10, 20, 30, 40];

function nearestDetent(angle: number): FlapSetting {
  let best = BASE_SETTINGS[0];
  let bestDist = Math.abs(angle - best.angle);
  for (const s of BASE_SETTINGS) {
    const d = Math.abs(angle - s.angle);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

type AudioNodes = {
  ctx: AudioContext;
  osc: OscillatorNode;
  sub: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
};

export default function FlapsConfig() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [angle, setAngle] = useState(0);
  const [direction, setDirection] = useState<Direction>("off");
  const { enabled: soundOn } = useSound();
  // Live in-view (the entry `isInView` above latches once and never resets).
  const audioInView = useInView(ref, { amount: 0.3 });
  const { labelIndicated, format } = useUnits();
  const { t, fmt } = useI18n();

  const audioRef = useRef<AudioNodes | null>(null);

  const active = nearestDetent(angle);
  const settingsCopy = t.flaps.settings as Dict["flaps"]["settings"];

  // Motor animation: while direction != "off", advance angle each frame.
  // The motor stops only when the pilot returns the switch to OFF
  // (or mechanically when the angle hits its stops at 0 or 40).
  useEffect(() => {
    if (direction === "off") return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      setAngle((a) => {
        const next =
          direction === "down" ? a + ANGLE_RATE * dt : a - ANGLE_RATE * dt;
        return Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, next));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction]);

  // Web Audio motor sound. The context is created eagerly on mount (browsers
  // allow this — it just starts suspended). All actual unlocking happens in
  // the first user gesture via unlockAudio.
  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    let ctx: AudioContext;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 130;
    const sub = ctx.createOscillator();
    sub.type = "square";
    sub.frequency.value = 65;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1600;
    filter.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    try {
      osc.start();
      sub.start();
    } catch {}
    audioRef.current = { ctx, osc, sub, gain, filter };
    return audioRef.current;
  }, []);

  useEffect(() => {
    const nodes = audioRef.current;
    if (!nodes) return;
    const target = soundOn && audioInView && direction !== "off" ? 0.18 : 0;
    const now = nodes.ctx.currentTime;
    if (nodes.ctx.state === "suspended") {
      void nodes.ctx.resume();
    }
    nodes.gain.gain.cancelScheduledValues(now);
    nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
    nodes.gain.gain.linearRampToValueAtTime(target, now + 0.08);
    nodes.osc.frequency.setTargetAtTime(
      direction === "down" ? 138 : direction === "up" ? 122 : 130,
      now,
      0.2,
    );
  }, [soundOn, audioInView, direction]);

  useEffect(() => {
    return () => {
      const nodes = audioRef.current;
      if (!nodes) return;
      try {
        nodes.osc.stop();
        nodes.sub.stop();
        nodes.ctx.close();
      } catch {}
      audioRef.current = null;
    };
  }, []);

  // iOS Safari refuses to play Web Audio unless resume() and a buffer.play()
  // happen synchronously inside a real user gesture. We call this on every
  // gesture (cheap idempotent op) until the context is "running".
  const unlockAudio = useCallback(() => {
    const nodes = ensureAudio();
    if (!nodes) return;
    if (nodes.ctx.state === "suspended") {
      nodes.ctx.resume().catch(() => {});
    }
    try {
      // 1-sample buffer at the context's sampleRate. The act of starting it
      // synchronously inside the gesture is what iOS recognises as a real
      // audio-playback intent.
      const buffer = nodes.ctx.createBuffer(
        1,
        1,
        nodes.ctx.sampleRate,
      );
      const src = nodes.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(nodes.ctx.destination);
      src.start(0);
    } catch {}
  }, [ensureAudio]);

  // Global listeners as a safety net. The MotorSwitch also wires unlockAudio
  // directly to its onPointerDown / onTouchStart so the call lands inside the
  // same gesture callstack.
  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener("touchstart", unlock, { capture: true });
    document.addEventListener("touchend", unlock, { capture: true });
    document.addEventListener("mousedown", unlock, { capture: true });
    return () => {
      document.removeEventListener("touchstart", unlock, { capture: true });
      document.removeEventListener("touchend", unlock, { capture: true });
      document.removeEventListener("mousedown", unlock, { capture: true });
    };
  }, [unlockAudio]);

  const handleDirection = useCallback(
    (d: Direction) => {
      if (soundOn) {
        const nodes = ensureAudio();
        if (nodes && nodes.ctx.state === "suspended") {
          void nodes.ctx.resume();
        }
      }
      setDirection(d);
    },
    [ensureAudio, soundOn],
  );


  const fmtSpeed = (mph: number | null) =>
    mph == null ? "—" : `${format(mph)} ${labelIndicated}`;
  const fmtRange = (range: [number, number] | null) =>
    range == null
      ? "—"
      : `${format(range[0])}–${format(range[1])} ${labelIndicated}`;

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="flaps" title={t.flaps.title}>
            <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
              {t.flaps.intro2}
            </p>
            <TechnicalDetail label={t.controls.detail}>
              <p className="text-[#57534e] max-w-2xl text-base lg:text-lg leading-relaxed">
                {fmt(t.flaps.intro, { vfe: `${format(100)} ${labelIndicated}` })}
              </p>
            </TechnicalDetail>
          </SectionHeader>
        </motion.div>

        {/* MOBILE LAYOUT — full-width placard on top, then a row with the
            switch on the left and the configuration block on the right.
            Pilot note spans full-width below. Hidden on lg+. */}
        <div className="lg:hidden space-y-3 -mt-10">
          <HorizontalFlapStrip
            angle={angle}
            measuredLabel={t.flaps.measured}
            nearestLabel={t.flaps.nearest}
            detentLabel={active.label}
            detentColor={active.color}
          />

          <div className="flex gap-3 items-stretch">
            <div className="flex-shrink-0 flex items-stretch">
              <MotorSwitch
                direction={direction}
                onChange={handleDirection}
                onInteractionStart={unlockAudio}
                labels={{
                  up: t.flaps.switchUp,
                  off: t.flaps.switchOff,
                  down: t.flaps.switchDown,
                }}
                atLimit={
                  (direction === "up" && angle <= MIN_ANGLE + 0.05) ||
                  (direction === "down" && angle >= MAX_ANGLE - 0.05)
                }
                showStatus={false}
                showDetentLabels={false}
              />
            </div>

            <div className="flex-1 min-w-0 instrument-bezel p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2 min-w-0">
                  <div
                    className="w-1.5 h-10 rounded-full flex-shrink-0 mt-0.5 transition-colors duration-500"
                    style={{ backgroundColor: active.color }}
                  />
                  <div className="min-w-0">
                    <div className="aviation-mono text-[9px] tracking-[0.15em] text-[#78716c]">
                      {t.flaps.configuration}
                    </div>
                    <div className="aviation-header text-lg leading-tight text-[#1f2937] relative h-6 overflow-hidden">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={active.key}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0"
                        >
                          {fmt(t.flaps.flapsTitle, { label: active.label })}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="aviation-mono text-[9px] tracking-[0.15em] text-[#6b0f1a] mt-0.5 relative h-3 overflow-hidden">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={active.key}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0"
                        >
                          {settingsCopy[active.key].role}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 w-14 h-9">
                  <Airfoil angle={angle} />
                </div>
              </div>

              <div className="relative min-h-[5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={active.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm leading-relaxed text-[#57534e]"
                  >
                    {settingsCopy[active.key].desc}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div>
            <MobileSpeedsInline
              active={active}
              fmtSpeed={fmtSpeed}
              fmtRange={fmtRange}
              vsLabel={t.flaps.items.vs}
              approachLabel={t.flaps.items.approach}
              vfeLabel={t.flaps.items.vfe}
              glideLabel={t.flaps.items.glide}
              shortFieldLabel={t.flaps.items.shortField}
              notPublishedLabel={t.flaps.notPublished}
            />
          </div>

          <div className="p-3 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
            <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#6b0f1a] mb-1">
              {t.flaps.pilotNote}
            </div>
            <div className="relative min-h-[3rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={active.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm leading-relaxed text-[#57534e]"
                >
                  {settingsCopy[active.key].notes}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* DESKTOP-ONLY left panel — full switch + hint + sound toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block lg:col-span-3 instrument-face p-5"
          >
            <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#78716c] mb-1">
              {t.flaps.switchLabel}
            </div>
            <div className="aviation-header text-sm text-[#1f2937] mb-4">
              POH §2-1
            </div>

            <MotorSwitch
              direction={direction}
              onChange={handleDirection}
              onInteractionStart={unlockAudio}
              labels={{
                up: t.flaps.switchUp,
                off: t.flaps.switchOff,
                down: t.flaps.switchDown,
              }}
              atLimit={
                (direction === "up" && angle <= MIN_ANGLE + 0.05) ||
                (direction === "down" && angle >= MAX_ANGLE - 0.05)
              }
            />

            <p className="mt-4 text-[11px] leading-relaxed text-[#78716c]">
              {t.flaps.switchHint}
            </p>

          </motion.div>

          {/* RIGHT — Configuration data + horizontal flap placard */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-9 instrument-bezel p-6 md:p-8"
          >
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-3 h-12 rounded-full flex-shrink-0 transition-colors duration-500"
                  style={{ backgroundColor: active.color }}
                />
                <div className="min-w-0">
                  <div className="aviation-mono text-xs tracking-[0.2em] text-[#78716c]">
                    {t.flaps.configuration}
                  </div>
                  <div className="aviation-header text-3xl text-[#1f2937] relative h-10 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={active.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                      >
                        {fmt(t.flaps.flapsTitle, { label: active.label })}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#6b0f1a] mt-1 relative h-3 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={active.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                      >
                        {settingsCopy[active.key].role}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Airfoil pulled right of the title */}
              <div className="flex-shrink-0 w-24 h-14 sm:w-36 sm:h-20 lg:w-48 lg:h-28">
                <Airfoil angle={angle} />
              </div>
            </div>

            <div className="relative mb-6 min-h-[3.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={active.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#57534e] leading-relaxed"
                >
                  {settingsCopy[active.key].desc}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="hidden lg:block">
              <HorizontalFlapStrip
                angle={angle}
                measuredLabel={t.flaps.measured}
                nearestLabel={t.flaps.nearest}
                detentLabel={active.label}
                detentColor={active.color}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <SpeedCell
                label={t.flaps.items.vs}
                value={fmtSpeed(active.vsMph)}
                annotation={active.vsMph == null ? t.flaps.notPublished : null}
                swapKey={active.key}
              />
              <SpeedCell
                label={t.flaps.items.vfe}
                value={fmtSpeed(active.vfeMph)}
                annotation={active.vfeMph == null ? t.flaps.clean : null}
                swapKey={active.key}
              />
              <SpeedCell
                label={t.flaps.items.approach}
                value={fmtRange(active.approachMph)}
                swapKey={active.key}
              />
              <SpeedCell
                label={
                  active.key === "up"
                    ? t.flaps.items.glide
                    : active.key === "forty"
                      ? t.flaps.items.shortField
                      : t.flaps.items.position
                }
                value={
                  active.refMph != null
                    ? fmtSpeed(active.refMph)
                    : `${active.angle}°`
                }
                swapKey={active.key}
              />
            </div>

            <div className="mt-6 p-4 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
              <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#6b0f1a] mb-1">
                {t.flaps.pilotNote}
              </div>
              <div className="relative min-h-[2.5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={active.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-[#57534e]"
                  >
                    {settingsCopy[active.key].notes}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MobileSpeedsInline({
  active,
  fmtSpeed,
  fmtRange,
  vsLabel,
  approachLabel,
  vfeLabel,
  glideLabel,
  shortFieldLabel,
  notPublishedLabel,
}: {
  active: FlapSetting;
  fmtSpeed: (mph: number | null) => string;
  fmtRange: (range: [number, number] | null) => string;
  vsLabel: string;
  approachLabel: string;
  vfeLabel: string;
  glideLabel: string;
  shortFieldLabel: string;
  notPublishedLabel: string;
}) {
  // Per-detent inline speed digest. Only shows fields that vary with the
  // flap setting — VFE is constant (100 MPH) across all deflections so we
  // surface it only on the 10° entry where VS is not published.
  const items: { label: string; value: string; muted?: boolean }[] = [];

  if (active.vsMph != null) {
    items.push({ label: vsLabel, value: fmtSpeed(active.vsMph) });
  } else {
    items.push({ label: vsLabel, value: notPublishedLabel, muted: true });
  }

  if (active.approachMph) {
    items.push({ label: approachLabel, value: fmtRange(active.approachMph) });
  }

  if (active.key === "up" && active.refMph != null) {
    items.push({ label: glideLabel, value: fmtSpeed(active.refMph) });
  } else if (active.key === "forty" && active.refMph != null) {
    items.push({ label: shortFieldLabel, value: fmtSpeed(active.refMph) });
  } else if (active.key === "ten" && active.vfeMph != null) {
    items.push({ label: vfeLabel, value: fmtSpeed(active.vfeMph) });
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex gap-2"
        >
          {items.map((item) => (
            <div
              key={item.label}
              className="flex-1 p-3 bg-[#f4efe6]/60 border border-[#1f2937]/5 min-w-0"
            >
              <div className="aviation-mono text-[9px] tracking-[0.15em] text-[#78716c] mb-1 truncate">
                {item.label}
              </div>
              <div
                className={`aviation-header text-base leading-tight tabular-nums ${
                  item.muted
                    ? "text-[#a8a29e] italic font-normal"
                    : "text-[#1f2937]"
                }`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SpeedCell({
  label,
  value,
  annotation,
  swapKey,
}: {
  label: string;
  value: string;
  annotation?: string | null;
  swapKey?: string;
}) {
  return (
    <div className="p-4 bg-[#f4efe6]/60 border border-[#1f2937]/5">
      <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-2 relative h-3 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={swapKey ? `${swapKey}-l` : label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="aviation-header text-xl text-[#1f2937] tabular-nums relative h-6 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={swapKey ? `${swapKey}-v` : value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      {annotation ? (
        <div className="mt-1 aviation-mono text-[9px] tracking-[0.1em] text-[#a8a29e]">
          {annotation}
        </div>
      ) : null}
    </div>
  );
}

function HorizontalFlapStrip({
  angle,
  measuredLabel,
  nearestLabel,
  detentLabel,
  detentColor,
  compact = false,
}: {
  angle: number;
  measuredLabel: string;
  nearestLabel: string;
  detentLabel: string;
  detentColor: string;
  compact?: boolean;
}) {
  // 0° = pointer at the RIGHT, 40° = pointer at the LEFT (Cessna placard convention).
  const t = angle / MAX_ANGLE;
  const leftPercent = (1 - t) * 100;

  return (
    <div className={compact ? "" : "my-2"}>
      {/* Cessna-style placard */}
      <div
        className={`relative w-full rounded-sm bg-gradient-to-b from-[#d8d2c4] to-[#bdb6a6] border border-[#1f2937]/20 ${
          compact ? "px-8 py-2" : "px-10 py-3"
        }`}
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        {/* Mounting screws */}
        <div
          className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[#1f2937]/35 shadow-inner ring-1 ring-[#1f2937]/15 ${
            compact ? "w-2 h-2" : "w-2.5 h-2.5"
          }`}
        />
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#1f2937]/35 shadow-inner ring-1 ring-[#1f2937]/15 ${
            compact ? "w-2 h-2" : "w-2.5 h-2.5"
          }`}
        />

        {!compact && (
          <div className="text-center aviation-mono text-[11px] tracking-[0.3em] text-[#1f2937]/75 mb-1.5">
            FLAP
          </div>
        )}

        {/* Window with sliding pointer */}
        <div
          className={`relative w-full bg-gradient-to-b from-[#f4efe6] to-[#e2dccf] border border-[#1f2937]/35 rounded-sm overflow-hidden ${
            compact ? "h-5" : "h-6"
          }`}
          style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.18)" }}
        >
          <motion.div
            animate={{ left: `${leftPercent}%` }}
            transition={{ type: "tween", duration: 0.05, ease: "linear" }}
            className="absolute top-0 bottom-0"
            style={{ transform: "translateX(-50%)" }}
          >
            <div
              className="h-full w-1.5"
              style={{
                background:
                  "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #0a0a0a 100%)",
                boxShadow: "0 0 6px rgba(0,0,0,0.45)",
              }}
            />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                compact ? "w-2 h-2" : "w-2.5 h-2.5"
              }`}
              style={{
                backgroundColor: detentColor,
                borderColor: "#1a1a1a",
                boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            />
          </motion.div>
        </div>

        {/* Tick labels — 40° on the LEFT, 0° on the RIGHT */}
        <div className={`relative ${compact ? "h-3 mt-0.5" : "h-4 mt-1"}`}>
          {[40, 30, 20, 10, 0].map((deg, i) => (
            <div
              key={deg}
              className={`absolute top-0 aviation-mono text-[#1f2937]/75 ${
                compact ? "text-[9px]" : "text-[10px]"
              }`}
              style={{
                left: `${(i / (DETENT_ANGLES.length - 1)) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {deg}°
            </div>
          ))}
        </div>
      </div>

      {/* Measured / Nearest readout (omitted on compact to save vertical space) */}
      {!compact && (
        <div className="flex justify-between mt-3 px-1 aviation-mono text-[10px] tracking-[0.15em] text-[#78716c]">
          <span>
            {measuredLabel}{" "}
            <span className="text-[#1f2937] tabular-nums ml-1">
              {angle.toFixed(1)}°
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            {nearestLabel}
            <span
              className="inline-block w-2 h-2 rounded-full ml-1"
              style={{ backgroundColor: detentColor }}
            />
            <span className="text-[#1f2937]">{detentLabel}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function Airfoil({ angle }: { angle: number }) {
  // Stylised NACA 2412-ish airfoil cross-section with a pivoting flap.
  // Pivot is at ~72% chord on the lower surface.
  return (
    <svg viewBox="0 0 100 50" className="w-full h-full">
      <defs>
        <linearGradient id="airfoilFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f2937" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1f2937" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Main airfoil body up to ~72% chord */}
      <path
        d="M 4 28 Q 18 8, 50 16 T 72 26 L 72 32 Q 50 30, 18 32 Z"
        fill="url(#airfoilFill)"
        stroke="#1f2937"
        strokeWidth="0.8"
      />
      {/* Pivot pin */}
      <circle cx="72" cy="29" r="1.2" fill="#1f2937" />
      {/* Flap, rotating about pivot */}
      <g transform={`rotate(${angle}, 72, 29)`}>
        <path
          d="M 72 26 L 95 27.5 L 95 31 L 72 32 Z"
          fill="url(#airfoilFill)"
          stroke="#1f2937"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
}

const SWITCH_SIZES = {
  full: { track: 162, handle: 20, pad: 7, handleW: 34 },
  compact: { track: 96, handle: 18, pad: 5, handleW: 32 },
} as const;

function makeSwitchMath(size: { track: number; handle: number; pad: number }) {
  const travel = size.track - size.handle - size.pad * 2;
  return {
    travel,
    dirToY(dir: Direction): number {
      if (dir === "up") return 0;
      if (dir === "off") return travel / 2;
      return travel;
    },
    // Snap-on-release: equal thirds, midpoints between detents.
    yToDir(y: number): Direction {
      if (y < travel * 0.25) return "up";
      if (y > travel * 0.75) return "down";
      return "off";
    },
    // Live commit while dragging: tiny dead zone.
    yToLiveDir(y: number): Direction {
      if (y < travel * 0.42) return "up";
      if (y > travel * 0.58) return "down";
      return "off";
    },
  };
}

function MotorSwitch({
  direction,
  onChange,
  onInteractionStart,
  labels,
  atLimit,
  compact = false,
  showStatus = true,
  showDetentLabels,
}: {
  direction: Direction;
  onChange: (d: Direction) => void;
  onInteractionStart?: () => void;
  labels: { up: string; off: string; down: string };
  atLimit: boolean;
  compact?: boolean;
  showStatus?: boolean;
  showDetentLabels?: boolean;
}) {
  const size = compact ? SWITCH_SIZES.compact : SWITCH_SIZES.full;
  const math = useMemo(() => makeSwitchMath(size), [size]);
  const y = useMotionValue(math.dirToY(direction));
  const dragging = useRef(false);
  const handleRef = useRef<HTMLDivElement>(null);

  // Bind touchstart / pointerdown / mousedown as native (non-React-synthetic)
  // listeners on the handle. React's synthetic event timing can move the
  // dispatch out of the original gesture callstack, which iOS Safari rejects
  // as "not a user gesture" when trying to resume an AudioContext.
  useEffect(() => {
    const el = handleRef.current;
    if (!el || !onInteractionStart) return;
    const handler = () => onInteractionStart();
    el.addEventListener("touchstart", handler);
    el.addEventListener("pointerdown", handler);
    el.addEventListener("mousedown", handler);
    return () => {
      el.removeEventListener("touchstart", handler);
      el.removeEventListener("pointerdown", handler);
      el.removeEventListener("mousedown", handler);
    };
  }, [onInteractionStart]);

  // Sync handle position when direction changes externally (snap on release,
  // click on a label, etc.) — but not while the user is actively dragging.
  useEffect(() => {
    if (dragging.current) return;
    const controls = animate(y, math.dirToY(direction), {
      type: "spring",
      stiffness: 420,
      damping: 30,
    });
    return () => controls.stop();
  }, [direction, math, y]);

  const handleDrag = useCallback(() => {
    const next = math.yToLiveDir(y.get());
    if (next !== direction) onChange(next);
  }, [direction, math, onChange, y]);

  const handleDragEnd = useCallback(() => {
    dragging.current = false;
    const next = math.yToDir(y.get());
    if (next === direction) {
      animate(y, math.dirToY(direction), {
        type: "spring",
        stiffness: 420,
        damping: 30,
      });
    } else {
      onChange(next);
    }
  }, [direction, math, onChange, y]);

  return (
    <div className={`flex items-stretch ${compact ? "gap-3" : "gap-4 my-2"}`}>
      {/* Switch plate */}
      <div
        className={`relative ${compact ? "w-12" : "w-16"} select-none`}
        style={{ height: size.track }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] rounded-sm shadow-inner border border-[#000]/50" />

        {/* Slot */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${compact ? "top-2 bottom-2 w-1.5" : "top-3 bottom-3 w-2"} bg-[#0a0a0a] rounded-full`}
        />

        {/* Detent labels — defaults: visible on full size, hidden on compact */}
        {(showDetentLabels ?? !compact) &&
          [
            { dir: "up" as const, label: labels.up, frac: 0 },
            { dir: "off" as const, label: labels.off, frac: 0.5 },
            { dir: "down" as const, label: labels.down, frac: 1 },
          ].map((mark) => {
            const centerY =
              size.pad + mark.frac * math.travel + size.handle / 2;
            return (
              <div
                key={mark.label}
                className="absolute -right-1 aviation-mono text-[10px] tracking-[0.15em] text-[#f4efe6]/80 whitespace-nowrap pointer-events-none"
                style={{ top: centerY, transform: "translate(100%, -50%)" }}
              >
                <span className="ml-2">{mark.label}</span>
              </div>
            );
          })}

        {/* Click zones (accessibility + tap fallback) */}
        <button
          type="button"
          aria-label={labels.up}
          aria-pressed={direction === "up"}
          onClick={() => onChange("up")}
          className="absolute left-0 right-0 top-0 h-1/3 focus:outline-none"
        />
        <button
          type="button"
          aria-label={labels.off}
          aria-pressed={direction === "off"}
          onClick={() => onChange("off")}
          className="absolute left-0 right-0 top-1/3 h-1/3 focus:outline-none"
        />
        <button
          type="button"
          aria-label={labels.down}
          aria-pressed={direction === "down"}
          onClick={() => onChange("down")}
          className="absolute left-0 right-0 bottom-0 h-1/3 focus:outline-none"
        />

        {/* Draggable handle */}
        <motion.div
          ref={handleRef}
          drag="y"
          dragConstraints={{ top: 0, bottom: math.travel }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => {
            dragging.current = true;
          }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ y, top: size.pad, touchAction: "none" }}
          whileTap={{ scale: 1.05 }}
          className="absolute left-1/2 z-10 cursor-grab active:cursor-grabbing -translate-x-1/2"
        >
          <div
            className={`relative rounded-sm bg-gradient-to-b from-[#e4dfd3] via-[#b8b1a3] to-[#7a756c] border border-[#1a1a1a]/80 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.5)] ${
              atLimit && direction !== "off" ? "ring-1 ring-[#ef4444]/60" : ""
            }`}
            style={{ width: size.handleW, height: size.handle }}
          >
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-px bg-[#1a1a1a]/40" />
            <div className="absolute inset-x-2 top-1/4 h-px bg-[#1a1a1a]/20" />
            <div className="absolute inset-x-2 bottom-1/4 h-px bg-[#1a1a1a]/20" />
          </div>
        </motion.div>
      </div>

      {/* Status pill */}
      {showStatus && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c]">
              STATUS
            </div>
            <div
              className={`aviation-header text-lg ${
                direction === "off" ? "text-[#57534e]" : "text-[#6b0f1a]"
              }`}
            >
              {direction === "off"
                ? labels.off
                : direction === "up"
                  ? `▲ ${labels.up}`
                  : `▼ ${labels.down}`}
            </div>
          </div>
          <div className="text-[10px] aviation-mono tracking-[0.15em] text-[#a8a29e]">
            {direction === "off"
              ? "MOTOR IDLE"
              : atLimit
                ? "AT STOP"
                : "MOTOR RUNNING"}
          </div>
        </div>
      )}
    </div>
  );
}
