"use client";

import { useI18n } from "../LanguageContext";
import SpeedSlider from "./SpeedSlider";

type DecoderKey =
  | "sm"
  | "mph"
  | "mias"
  | "mtas"
  | "nm"
  | "kts"
  | "kias"
  | "ktas";

const STATUTE_ITEMS: Array<{ abbr: string; key: DecoderKey }> = [
  { abbr: "SM", key: "sm" },
  { abbr: "MPH", key: "mph" },
  { abbr: "MIAS", key: "mias" },
  { abbr: "MTAS", key: "mtas" },
];

const NAUTICAL_ITEMS: Array<{ abbr: string; key: DecoderKey }> = [
  { abbr: "NM", key: "nm" },
  { abbr: "KTS", key: "kts" },
  { abbr: "KIAS", key: "kias" },
  { abbr: "KTAS", key: "ktas" },
];

/**
 * The MPH-vs-knots reference content. Lives in the "why?" modal rather than
 * a standalone section — it's a deep dive, not part of the main walkthrough.
 */
export default function UnitsExplainer() {
  const { t } = useI18n();
  const u = t.units;

  const blocks = [
    { label: u.whyMph.label, body: u.whyMph.body },
    { label: u.whyKnots.label, body: u.whyKnots.body },
    { label: u.smVsNm.label, body: u.smVsNm.body },
    { label: u.modernized.label, body: u.modernized.body },
  ];

  return (
    <div>
      <p className="text-[#57534e] text-base leading-relaxed mb-8">{u.intro}</p>

      {/* Decoder — glossary for the metric-system / non-aviation reader */}
      <div className="mb-8 p-6 md:p-7 bg-[#1f2937] text-[#f4efe6]">
        <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#9ca3af] mb-2">
          {u.decoder.title}
        </div>
        <p className="text-sm opacity-80 mb-6">{u.decoder.intro}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {[
            { heading: u.decoder.statuteHeading, items: STATUTE_ITEMS },
            { heading: u.decoder.nauticalHeading, items: NAUTICAL_ITEMS },
          ].map((col) => (
            <div key={col.heading}>
              <div className="aviation-mono text-[10px] tracking-[0.25em] text-[#f4efe6] mb-3 pb-2 border-b border-[#f4efe6]/20">
                {col.heading}
              </div>
              <div className="space-y-2">
                {col.items.map((item) => (
                  <div key={item.abbr} className="flex items-baseline gap-3 py-1">
                    <span className="aviation-mono text-sm font-bold w-14 flex-shrink-0 text-[#f4efe6]">
                      {item.abbr}
                    </span>
                    <span className="aviation-mono text-[#9ca3af]">→</span>
                    <span className="text-sm opacity-90">
                      {u.decoder.items[item.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanatory blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {blocks.map((b) => (
          <div
            key={b.label}
            className="p-6 bg-[#e8e2d8]/40 border border-[#1f2937]/10"
          >
            <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#6b0f1a] mb-3">
              {b.label}
            </div>
            <p className="text-[#57534e] leading-relaxed text-sm">{b.body}</p>
          </div>
        ))}
      </div>

      {/* Interactive slider */}
      <div className="mb-8">
        <SpeedSlider />
      </div>

      {/* Formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-[#e8e2d8]/40 border border-[#1f2937]/10">
          <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#6b0f1a] mb-3">
            {u.exactTitle}
          </div>
          <p className="text-[#57534e] text-sm leading-relaxed mb-4">
            {u.exactBody}
          </p>
          <div className="space-y-2 mb-4">
            <div className="aviation-mono text-base text-[#1f2937] bg-[#f4efe6] px-4 py-2 border-l-2 border-[#6b0f1a]">
              {u.exactKtsToMph}
            </div>
            <div className="aviation-mono text-base text-[#1f2937] bg-[#f4efe6] px-4 py-2 border-l-2 border-[#6b0f1a]">
              {u.exactMphToKts}
            </div>
          </div>
          <p className="aviation-mono text-xs text-[#78716c] leading-relaxed">
            {u.exactNote}
          </p>
        </div>

        <div className="p-6 bg-[#6b0f1a]/5 border-l-2 border-[#6b0f1a]">
          <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#6b0f1a] mb-3">
            {u.quickTitle}
          </div>
          <p className="text-[#57534e] text-sm leading-relaxed mb-4">
            {u.quickBody}
          </p>
          <div className="space-y-2 mb-4">
            <div className="aviation-mono text-base text-[#1f2937] bg-[#f4efe6] px-4 py-2 border-l-2 border-[#6b0f1a]">
              {u.quickKtsToMph}
            </div>
            <div className="aviation-mono text-base text-[#1f2937] bg-[#f4efe6] px-4 py-2 border-l-2 border-[#6b0f1a]">
              {u.quickMphToKts}
            </div>
          </div>
          <p className="aviation-mono text-xs text-[#78716c] leading-relaxed">
            {u.quickAccuracy}
          </p>
        </div>
      </div>
    </div>
  );
}
