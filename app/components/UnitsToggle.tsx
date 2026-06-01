"use client";

import { useUnits } from "../UnitsContext";
import { useI18n } from "../LanguageContext";
import { useSound } from "../SoundContext";
import { useUnitsModal } from "./UnitsModal";

export default function UnitsToggle({
  className = "",
}: {
  className?: string;
}) {
  const { unit, setUnit } = useUnits();
  const { t, locale, setLocale } = useI18n();
  const { enabled: soundOn, toggle: toggleSound } = useSound();
  const { open: openWhy } = useUnitsModal();
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div
        className="inline-flex items-center gap-0 border border-[#1f2937]/20 bg-[#f4efe6]/80 backdrop-blur-sm"
        role="group"
        aria-label={t.controls.units}
      >
        <span className="aviation-mono text-[10px] tracking-[0.18em] text-[#78716c] px-3 py-2 border-r border-[#1f2937]/10">
          {t.controls.units}
        </span>
        <button
          type="button"
          onClick={() => setUnit("mph")}
          aria-pressed={unit === "mph"}
          className={`aviation-mono text-xs tracking-wider px-3 py-2 transition-colors cursor-pointer ${
            unit === "mph"
              ? "bg-[#6b0f1a] text-[#f4efe6]"
              : "text-[#57534e] hover:bg-[#e8e2d8]"
          }`}
        >
          MPH
        </button>
        <button
          type="button"
          onClick={() => setUnit("kts")}
          aria-pressed={unit === "kts"}
          className={`aviation-mono text-xs tracking-wider px-3 py-2 transition-colors cursor-pointer ${
            unit === "kts"
              ? "bg-[#6b0f1a] text-[#f4efe6]"
              : "text-[#57534e] hover:bg-[#e8e2d8]"
          }`}
        >
          KTS
        </button>
        <button
          type="button"
          onClick={openWhy}
          aria-label={t.controls.why}
          title={t.controls.why}
          className="aviation-mono text-xs tracking-wider px-3 py-2 border-l border-[#1f2937]/10 text-[#57534e] hover:bg-[#e8e2d8] hover:text-[#6b0f1a] transition-colors cursor-pointer"
        >
          ?
        </button>
      </div>

      <div
        className="inline-flex items-center gap-0 border border-[#1f2937]/20 bg-[#f4efe6]/80 backdrop-blur-sm"
        role="group"
        aria-label={t.controls.language}
      >
        <span className="aviation-mono text-[10px] tracking-[0.18em] text-[#78716c] px-3 py-2 border-r border-[#1f2937]/10">
          {t.controls.language}
        </span>
        <button
          type="button"
          onClick={() => setLocale("es")}
          aria-pressed={locale === "es"}
          className={`aviation-mono text-xs tracking-wider px-3 py-2 transition-colors cursor-pointer ${
            locale === "es"
              ? "bg-[#6b0f1a] text-[#f4efe6]"
              : "text-[#57534e] hover:bg-[#e8e2d8]"
          }`}
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
          className={`aviation-mono text-xs tracking-wider px-3 py-2 transition-colors cursor-pointer ${
            locale === "en"
              ? "bg-[#6b0f1a] text-[#f4efe6]"
              : "text-[#57534e] hover:bg-[#e8e2d8]"
          }`}
        >
          EN
        </button>
      </div>

      <div
        className="inline-flex items-center gap-0 border border-[#1f2937]/20 bg-[#f4efe6]/80 backdrop-blur-sm"
        role="group"
        aria-label={t.controls.sound}
      >
        <span className="aviation-mono text-[10px] tracking-[0.18em] text-[#78716c] px-3 py-2 border-r border-[#1f2937]/10">
          {t.controls.sound}
        </span>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          title={t.controls.sound}
          className={`px-3 py-2 transition-colors cursor-pointer ${
            soundOn
              ? "text-[#6b0f1a] hover:bg-[#e8e2d8]"
              : "text-[#78716c] hover:bg-[#e8e2d8]"
          }`}
        >
          {soundOn ? (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.2 6a8 8 0 0 1 0 12" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
