"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useUnits } from "../UnitsContext";
import { useI18n } from "../LanguageContext";
import SectionHeader from "./SectionHeader";

// POH stall speeds in MPH CAS at 1600 lbs gross weight (power off).
// Source: Cessna 1969 Model 150 Owner's Manual, Section V, figure 5-2.
const FLAP_CONFIGS = {
  up: { vs0Mph: 55 },
  twenty: { vs0Mph: 49 },
  forty: { vs0Mph: 48 },
} as const;

type FlapKey = keyof typeof FLAP_CONFIGS;

// Bank-scale tick marks shown on the rotating card (mirrored left/right).
const BANK_TICKS: ReadonlyArray<{ angle: number; kind: "major" | "minor" }> = [
  { angle: 10, kind: "minor" },
  { angle: 20, kind: "minor" },
  { angle: 30, kind: "major" },
  { angle: 45, kind: "minor" },
  { angle: 60, kind: "major" },
];

// Trig coords land verbatim in SVG attributes; round so SSR and client
// serialize identically (Math.cos/sin can differ in the last bit per runtime).
const round3 = (n: number) => Math.round(n * 1000) / 1000;

function computeStallData(vs1Mph: number, convert: (mph: number) => number) {
  const data = [];
  for (let bank = 0; bank <= 60; bank += 5) {
    const bankRad = (bank * Math.PI) / 180;
    const stallMph = vs1Mph / Math.sqrt(Math.cos(bankRad));
    data.push({
      bank,
      stallSpeed: Math.round(convert(stallMph) * 10) / 10,
      label: `${bank}°`,
    });
  }
  return data;
}

export default function StallBankAngle() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [bankAngle, setBankAngle] = useState(0);
  const [flap, setFlap] = useState<FlapKey>("up");
  const { unit, labelIndicated, convert, format } = useUnits();
  const { t, fmt } = useI18n();

  const baseVs = FLAP_CONFIGS[flap].vs0Mph;
  const flapLabel = {
    up: t.stall.flapConfigs.up,
    twenty: t.stall.flapConfigs.twenty,
    forty: t.stall.flapConfigs.forty,
  } as const;

  const stallData = useMemo(
    () => computeStallData(baseVs, convert),
    [baseVs, convert]
  );

  const currentStall = useMemo(() => {
    const bankRad = (bankAngle * Math.PI) / 180;
    const mph = baseVs / Math.sqrt(Math.cos(bankRad));
    return Math.round(convert(mph) * 10) / 10;
  }, [bankAngle, baseVs, convert]);

  const loadFactor = useMemo(() => {
    const bankRad = (bankAngle * Math.PI) / 180;
    return Math.round((1 / Math.cos(bankRad)) * 100) / 100;
  }, [bankAngle]);

  const yDomain = useMemo<[number, number]>(() => {
    if (unit === "mph") return [40, 90];
    return [35, 80];
  }, [unit]);

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="stall" title={t.stall.title}>
            <p className="text-[#57534e] max-w-2xl text-lg leading-relaxed">
              {t.stall.intro}
            </p>
          </SectionHeader>
        </motion.div>

        {/* Flap selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(FLAP_CONFIGS) as FlapKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setFlap(k)}
              className={`px-4 py-2 aviation-mono text-xs tracking-wider transition-all cursor-pointer ${
                k === flap
                  ? "bg-[#6b0f1a] text-[#f4efe6]"
                  : "bg-[#e8e2d8]/50 text-[#57534e] hover:bg-[#e8e2d8]"
              }`}
            >
              {flapLabel[k]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Interactive Slider + Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="instrument-bezel p-8">
              <div className="aviation-mono text-xs tracking-[0.2em] text-[#78716c] mb-6 text-center">
                {t.stall.bankIndicator}
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-[280px] h-[280px] md:w-[340px] md:h-[340px]"
                  >
                    <defs>
                      <clipPath id="ai-dial-clip">
                        <circle cx={200} cy={200} r={168} />
                      </clipPath>
                      <linearGradient id="ai-sky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6a8092" />
                        <stop offset="100%" stopColor="#44586b" />
                      </linearGradient>
                      <linearGradient id="ai-ground" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6b4a30" />
                        <stop offset="100%" stopColor="#3d2818" />
                      </linearGradient>
                    </defs>

                    {/* Outer bezel — same construction as the airspeed dial */}
                    <circle cx={200} cy={200} r={185} fill="none" stroke="#1f2937" strokeWidth={2} />
                    <circle cx={200} cy={200} r={175} fill="none" stroke="#9ca3af" strokeWidth={1} />
                    <circle cx={200} cy={200} r={173} fill="#1f2937" />

                    <g clipPath="url(#ai-dial-clip)">
                      {/* Rotating attitude card — sky tilts opposite to bank (cockpit view) */}
                      <motion.g
                        animate={{ rotate: -bankAngle }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        style={{
                          transformOrigin: "200px 200px",
                          transformBox: "view-box" as never,
                        }}
                      >
                        <rect x={-200} y={-200} width={800} height={400} fill="url(#ai-sky)" />
                        <rect x={-200} y={200} width={800} height={400} fill="url(#ai-ground)" />
                        <line x1={-200} y1={200} x2={600} y2={200} stroke="#f4efe6" strokeWidth={2} />

                        {/* Pitch ladder (±10°, ±20°) — 4px per degree of pitch */}
                        {[10, 20].map((deg) => {
                          const offset = deg * 4;
                          const half = deg === 10 ? 24 : 36;
                          return (
                            <g key={deg}>
                              <line x1={200 - half} y1={200 - offset} x2={200 + half} y2={200 - offset} stroke="#f4efe6" strokeWidth={1.5} strokeLinecap="round" />
                              <text x={200 - half - 6} y={200 - offset} textAnchor="end" dominantBaseline="middle" fontFamily="monospace" fontSize={10} fill="#f4efe6" fontWeight={500}>{deg}</text>
                              <text x={200 + half + 6} y={200 - offset} dominantBaseline="middle" fontFamily="monospace" fontSize={10} fill="#f4efe6" fontWeight={500}>{deg}</text>
                              <line x1={200 - half} y1={200 + offset} x2={200 + half} y2={200 + offset} stroke="#f4efe6" strokeWidth={1.5} strokeLinecap="round" />
                              <text x={200 - half - 6} y={200 + offset} textAnchor="end" dominantBaseline="middle" fontFamily="monospace" fontSize={10} fill="#f4efe6" fontWeight={500}>{deg}</text>
                              <text x={200 + half + 6} y={200 + offset} dominantBaseline="middle" fontFamily="monospace" fontSize={10} fill="#f4efe6" fontWeight={500}>{deg}</text>
                            </g>
                          );
                        })}

                        {/* Bank-scale tick triangles — mirrored each side, on the rotating card */}
                        {BANK_TICKS.flatMap(({ angle, kind }) =>
                          [-angle, angle].map((signed) => {
                            const rad = ((signed - 90) * Math.PI) / 180;
                            const rTip = 138;
                            const rBase = kind === "major" ? 158 : 152;
                            const halfW = kind === "major" ? 5 : 4;
                            const tipX = 200 + rTip * Math.cos(rad);
                            const tipY = 200 + rTip * Math.sin(rad);
                            const baseX = 200 + rBase * Math.cos(rad);
                            const baseY = 200 + rBase * Math.sin(rad);
                            const perpX = -Math.sin(rad);
                            const perpY = Math.cos(rad);
                            return (
                              <polygon
                                key={`${kind}-${signed}`}
                                points={`${round3(tipX)},${round3(tipY)} ${round3(baseX + halfW * perpX)},${round3(baseY + halfW * perpY)} ${round3(baseX - halfW * perpX)},${round3(baseY - halfW * perpY)}`}
                                fill="#f4efe6"
                              />
                            );
                          })
                        )}

                        {/* 0° tick on the card — small inverted triangle at top */}
                        <polygon points="200,40 194,28 206,28" fill="#f4efe6" />
                      </motion.g>

                      {/* Aircraft symbol — fixed: V-wings + center dot */}
                      <g stroke="#6b0f1a" strokeWidth={3.5} strokeLinecap="round" fill="none">
                        <line x1={120} y1={200} x2={172} y2={200} />
                        <line x1={228} y1={200} x2={280} y2={200} />
                        <line x1={172} y1={200} x2={180} y2={210} />
                        <line x1={228} y1={200} x2={220} y2={210} />
                      </g>
                      <circle cx={200} cy={200} r={4} fill="#6b0f1a" />
                    </g>

                    {/* Bank index pointer — FIXED, points down from the top of the case */}
                    <polygon points="200,52 188,32 212,32" fill="#6b0f1a" />
                  </svg>

                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.08)] pointer-events-none" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="aviation-mono text-xs text-[#78716c]">
                    0°
                  </span>
                  <span className="aviation-mono text-2xl text-[#6b0f1a] font-bold">
                    {bankAngle}°
                  </span>
                  <span className="aviation-mono text-xs text-[#78716c]">
                    60°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={1}
                  value={bankAngle}
                  onChange={(e) => setBankAngle(Number(e.target.value))}
                  className="w-full h-2 bg-[#d6d3d1] rounded-full appearance-none cursor-pointer accent-[#6b0f1a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="instrument-face p-5">
                <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-2">
                  {t.stall.stallSpeed}
                </div>
                <motion.div
                  key={currentStall}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="aviation-header text-3xl text-[#1f2937]"
                >
                  {currentStall}
                </motion.div>
                <div className="aviation-mono text-xs text-[#78716c]">
                  {labelIndicated}
                </div>
              </div>
              <div className="instrument-face p-5">
                <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-2">
                  {t.stall.loadFactor}
                </div>
                <motion.div
                  key={loadFactor}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="aviation-header text-3xl text-[#1f2937]"
                >
                  {loadFactor}
                </motion.div>
                <div className="aviation-mono text-xs text-[#78716c]">G</div>
              </div>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="instrument-bezel p-6 md:p-8"
          >
            <div className="aviation-mono text-xs tracking-[0.2em] text-[#78716c] mb-2">
              {t.stall.chartTitle}
            </div>
            <div className="aviation-mono text-[10px] text-[#a8a29e] mb-6">
              {fmt(t.stall.chartCaption, {
                config: flapLabel[flap],
                base: `${format(baseVs)} ${labelIndicated}`,
              })}
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stallData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#d6d3d1"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="bank"
                    tickFormatter={(v) => `${v}°`}
                    tick={{ fontSize: 11, fontFamily: "monospace", fill: "#78716c" }}
                    axisLine={{ stroke: "#a8a29e" }}
                    tickLine={{ stroke: "#a8a29e" }}
                    label={{
                      value: t.stall.chartXAxis,
                      position: "insideBottom",
                      offset: -5,
                      style: {
                        fontSize: 11,
                        fontFamily: "monospace",
                        fill: "#78716c",
                      },
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: "monospace", fill: "#78716c" }}
                    axisLine={{ stroke: "#a8a29e" }}
                    tickLine={{ stroke: "#a8a29e" }}
                    domain={yDomain}
                    label={{
                      value: fmt(t.stall.chartYAxis, { unit: labelIndicated }),
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fontSize: 11,
                        fontFamily: "monospace",
                        fill: "#78716c",
                      },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: 4,
                      fontFamily: "monospace",
                      fontSize: 12,
                      color: "#f4efe6",
                    }}
                    formatter={(value) => [
                      `${value} ${labelIndicated}`,
                      t.stall.chartStallTooltip,
                    ]}
                    labelFormatter={(label) => `${label}° ${t.stall.chartXAxis}`}
                  />
                  <ReferenceLine
                    x={bankAngle}
                    stroke="#6b0f1a"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="stallSpeed"
                    stroke="#6b0f1a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#6b0f1a", strokeWidth: 0 }}
                    activeDot={{
                      r: 6,
                      fill: "#6b0f1a",
                      stroke: "#f4efe6",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
              <div className="aviation-mono text-xs tracking-[0.15em] text-[#6b0f1a] mb-2">
                {t.stall.remember}
              </div>
              <p className="text-sm text-[#57534e] leading-relaxed">
                {t.stall.rememberBody}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
