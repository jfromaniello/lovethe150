"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "../LanguageContext";

const MPH_TO_KTS = 0.868976;
const MPH_TO_KMH = 1.609344;
const SLIDER_MAX = 200;

type ContextKey =
  | "taxi"
  | "belowStall"
  | "stallRegime"
  | "slowFlight"
  | "vxGlide"
  | "vyClimb"
  | "pattern"
  | "cruise"
  | "caution"
  | "vne";

function contextKey(mph: number): ContextKey {
  if (mph < 30) return "taxi";
  if (mph < 48) return "belowStall";
  if (mph < 56) return "stallRegime";
  if (mph < 64) return "slowFlight";
  if (mph < 66) return "vxGlide";
  if (mph < 74) return "vyClimb";
  if (mph < 100) return "pattern";
  if (mph < 120) return "cruise";
  if (mph < 162) return "caution";
  return "vne";
}

const ACCENT: Record<ContextKey, string> = {
  taxi: "#9ca3af",
  belowStall: "#ef4444",
  stallRegime: "#e5e7eb",
  slowFlight: "#e5e7eb",
  vxGlide: "#10b981",
  vyClimb: "#10b981",
  pattern: "#10b981",
  cruise: "#10b981",
  caution: "#f59e0b",
  vne: "#ef4444",
};

export default function SpeedSlider() {
  const [mph, setMph] = useState(110);
  const { t } = useI18n();
  const u = t.units.slider;

  const kts = Math.round(mph * MPH_TO_KTS);
  const kmh = Math.round(mph * MPH_TO_KMH);
  const key = contextKey(mph);
  const ctx = u.contexts[key];
  const accent = ACCENT[key];

  const pct = (v: number) => (v / SLIDER_MAX) * 100;

  return (
    <div className="p-6 md:p-8 bg-[#e8e2d8]/40 border border-[#1f2937]/10">
      <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#6b0f1a] mb-3">
        {u.title}
      </div>
      <p className="text-[#57534e] text-sm leading-relaxed mb-6">{u.intro}</p>

      {/* Slider with airspeed-zone background */}
      <div className="mb-1">
        <div className="relative py-3">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 overflow-hidden bg-[#1f2937]/10 rounded-full pointer-events-none">
            <div
              className="absolute inset-y-0 bg-[#e5e7eb]"
              style={{ left: `${pct(48)}%`, width: `${pct(100 - 48)}%` }}
            />
            <div
              className="absolute inset-y-0 bg-[#10b981]"
              style={{ left: `${pct(56)}%`, width: `${pct(120 - 56)}%` }}
            />
            <div
              className="absolute inset-y-0 bg-[#f59e0b]"
              style={{ left: `${pct(120)}%`, width: `${pct(162 - 120)}%` }}
            />
            <div
              className="absolute inset-y-0 bg-[#ef4444]"
              style={{
                left: `${pct(162)}%`,
                width: `${pct(SLIDER_MAX - 162)}%`,
              }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={SLIDER_MAX}
            value={mph}
            onChange={(e) => setMph(Number(e.target.value))}
            aria-label={u.title}
            className="relative w-full appearance-none bg-transparent cursor-pointer h-6
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-5
                       [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-[#6b0f1a]
                       [&::-webkit-slider-thumb]:border-2
                       [&::-webkit-slider-thumb]:border-[#f4efe6]
                       [&::-webkit-slider-thumb]:shadow-md
                       [&::-webkit-slider-thumb]:cursor-grab
                       [&::-moz-range-thumb]:w-5
                       [&::-moz-range-thumb]:h-5
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-[#6b0f1a]
                       [&::-moz-range-thumb]:border-2
                       [&::-moz-range-thumb]:border-[#f4efe6]
                       [&::-moz-range-thumb]:cursor-grab"
          />
        </div>
        <div className="relative h-4 aviation-mono text-[10px] text-[#78716c]">
          {[0, 50, 100, 150, 200].map((v) => (
            <span
              key={v}
              className="absolute -translate-x-1/2"
              style={{ left: `${pct(v)}%` }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Three readouts */}
      <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
        <motion.div
          key={`mph-${mph}`}
          initial={{ scale: 0.97 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.12 }}
          className="text-center bg-[#1f2937] text-[#f4efe6] p-3"
        >
          <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#9ca3af] mb-1">
            MPH
          </div>
          <div className="aviation-header text-3xl">{mph}</div>
          <div className="aviation-mono text-[9px] text-[#9ca3af] mt-1">
            {u.mphFull}
          </div>
        </motion.div>
        <motion.div
          key={`kts-${kts}`}
          initial={{ scale: 0.97 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.12 }}
          className="text-center bg-[#1f2937] text-[#f4efe6] p-3"
        >
          <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#9ca3af] mb-1">
            KTS
          </div>
          <div className="aviation-header text-3xl">{kts}</div>
          <div className="aviation-mono text-[9px] text-[#9ca3af] mt-1">
            {u.ktsFull}
          </div>
        </motion.div>
        <motion.div
          key={`kmh-${kmh}`}
          initial={{ scale: 0.97 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.12 }}
          className="text-center bg-[#1f2937] text-[#f4efe6] p-3"
        >
          <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#9ca3af] mb-1">
            km/h
          </div>
          <div className="aviation-header text-3xl">{kmh}</div>
          <div className="aviation-mono text-[9px] text-[#9ca3af] mt-1">
            {u.kmhFull}
          </div>
        </motion.div>
      </div>

      {/* Context box */}
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="p-4 bg-[#f4efe6] border-l-2"
        style={{ borderColor: accent }}
      >
        <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-2">
          {u.contextLabel}
        </div>
        <div
          className="aviation-header text-base mb-1"
          style={{ color: accent === "#e5e7eb" ? "#1f2937" : accent }}
        >
          {ctx.label}
        </div>
        <p className="text-sm text-[#57534e] leading-relaxed">{ctx.body}</p>
      </motion.div>
    </div>
  );
}
