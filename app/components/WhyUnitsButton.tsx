"use client";

import { useI18n } from "../LanguageContext";
import { useUnitsModal } from "./UnitsModal";

/**
 * Opens the MPH-vs-knots explainer modal. Drop it anywhere the unit question
 * naturally comes up (the units toggle, the airspeed callout, …).
 */
export default function WhyUnitsButton({ className = "" }: { className?: string }) {
  const { open } = useUnitsModal();
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={open}
      className={`group inline-flex cursor-pointer items-center gap-1 aviation-mono text-xs tracking-wider text-[#6b0f1a] hover:text-[#5a0d16] transition-colors ${className}`}
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.2"
        />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <span className="underline decoration-[#6b0f1a]/30 underline-offset-2 group-hover:decoration-[#6b0f1a]">
        {t.controls.why}
      </span>
    </button>
  );
}
