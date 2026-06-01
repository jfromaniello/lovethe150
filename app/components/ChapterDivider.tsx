"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "../LanguageContext";
import type { Chapter } from "./sections";

/**
 * Full-width chapter break. Reads heavier than a SectionHeader so the eye
 * registers a new "act", but keeps the chapter title quieter than the
 * section titles that follow it — a burgundy PART overline plus a large,
 * ghosted roman numeral, so it frames the sections without competing.
 */
export default function ChapterDivider({ chapter }: { chapter: Chapter }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const { t } = useI18n();
  const title = t.nav.chapters[chapter.key];

  return (
    <div
      ref={ref}
      id={`part-${chapter.key}`}
      className="relative px-6 pt-24 pb-6 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-5 mb-3">
            <span className="aviation-mono text-xs tracking-[0.3em] text-[#6b0f1a]">
              {t.nav.partLabel} {chapter.part}
            </span>
            <div className="h-px flex-1 bg-[#6b0f1a]/20" />
          </div>
          <div className="flex items-end justify-between gap-6">
            <h2 className="aviation-header text-4xl md:text-6xl text-[#1f2937] leading-none">
              {title}
            </h2>
            <span
              aria-hidden
              className="aviation-header text-7xl md:text-9xl leading-none text-[#6b0f1a]/10 select-none"
            >
              {chapter.part}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
