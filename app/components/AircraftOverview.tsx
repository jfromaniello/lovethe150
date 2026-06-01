"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useUnits } from "../UnitsContext";
import { useI18n } from "../LanguageContext";
import SectionHeader from "./SectionHeader";

type Spec = {
  label: string;
  value: string;
  detail: string;
  icon: string;
};

function SpecCard({ spec, index }: { spec: Spec; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="instrument-bezel p-5 h-full flex flex-col">
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#6b0f1a]/0 group-hover:border-[#6b0f1a]/40 transition-colors" />

        <div className="flex items-start justify-between mb-4">
          <div className="aviation-mono text-[10px] tracking-[0.2em] text-[#78716c] uppercase">
            {spec.label}
          </div>
          <svg
            className="w-5 h-5 text-[#a8a29e] group-hover:text-[#6b0f1a] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={spec.icon} />
          </svg>
        </div>

        <div className="aviation-header text-2xl md:text-3xl text-[#1f2937] mb-1 group-hover:text-[#6b0f1a] transition-colors">
          {spec.value}
        </div>
        <div className="aviation-mono text-xs text-[#78716c]">
          {spec.detail}
        </div>

        <div className="mt-auto pt-4">
          <div className="h-px bg-[#1f2937]/10 group-hover:bg-[#6b0f1a]/30 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

const ICONS = {
  engine: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  propeller:
    "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16z",
  fuel: "M19 5h-2V3H7v2H5v14h14V5zm-7 11a2 2 0 100-4 2 2 0 000 4z",
  emptyWeight: "M3 6h18M3 12h18M3 18h18",
  usefulLoad: "M12 3v18M3 12h18",
  ceiling: "M5 10l7-7 7 7M12 3v18",
  cruise: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  range: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
};

export default function AircraftOverview() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { label, labelIndicated, format } = useUnits();
  const { t } = useI18n();

  const s = t.overview.specs;
  const specs: Spec[] = [
    { label: s.engine.label, value: s.engine.value, detail: s.engine.detail, icon: ICONS.engine },
    { label: s.propeller.label, value: s.propeller.value, detail: s.propeller.detail, icon: ICONS.propeller },
    { label: s.fuel.label, value: s.fuel.value, detail: s.fuel.detail, icon: ICONS.fuel },
    { label: s.emptyWeight.label, value: s.emptyWeight.value, detail: s.emptyWeight.detail, icon: ICONS.emptyWeight },
    { label: s.usefulLoad.label, value: s.usefulLoad.value, detail: s.usefulLoad.detail, icon: ICONS.usefulLoad },
    { label: s.ceiling.label, value: s.ceiling.value, detail: s.ceiling.detail, icon: ICONS.ceiling },
    { label: s.cruise.label, value: `${format(117)} ${label}`, detail: s.cruise.detail, icon: ICONS.cruise },
    { label: s.range.label, value: s.range.value, detail: s.range.detail, icon: ICONS.range },
  ];

  const limits = [
    { label: "VNE", mph: 162, desc: t.overview.limits.vne },
    { label: "VNO", mph: 120, desc: t.overview.limits.vno },
    { label: "VA", mph: 109, desc: t.overview.limits.va },
    { label: "VS0", mph: 48, desc: t.overview.limits.vs0 },
  ];

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="overview" title={t.overview.title}>
            <p className="text-[#57534e] max-w-2xl text-lg leading-relaxed">
              {t.overview.intro}
            </p>
          </SectionHeader>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {specs.map((spec, i) => (
            <SpecCard key={spec.label} spec={spec} index={i} />
          ))}
        </div>

        {/* Quick reference strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 p-6 md:p-8 bg-[#e8e2d8]/40 border border-[#1f2937]/10"
        >
          <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
            <div className="aviation-mono text-xs tracking-[0.2em] text-[#6b0f1a]">
              {t.overview.limits.heading} ({labelIndicated})
            </div>
            <div className="aviation-mono text-[10px] text-[#78716c]">
              {t.overview.limits.note}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {limits.map((limit) => (
              <div key={limit.label} className="text-center md:text-left">
                <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-1">
                  {limit.label}
                </div>
                <div className="aviation-header text-3xl text-[#1f2937]">
                  {format(limit.mph)}
                </div>
                <div className="aviation-mono text-xs text-[#78716c]">
                  {limit.desc}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
