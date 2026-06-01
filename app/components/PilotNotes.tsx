"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useUnits } from "../UnitsContext";
import { useI18n } from "../LanguageContext";
import type { Dict } from "../i18n/en";
import SectionHeader from "./SectionHeader";

type Procedure = {
  title: string;
  source?: string;
  steps: string[];
};

const NORMAL_TO_SOURCE = "POH §1-2";
const NORMAL_LDG_SOURCE = "POH §1-3";
const CLIMB_SOURCE = "POH §1-3";

function buildProcedures(
  t: Dict,
  fmt: (template: string, vars: Record<string, string | number>) => string,
  s: (mph: number) => string
): Procedure[] {
  const p = t.pilot.proc;
  return [
    {
      title: p.normalTo.title,
      source: NORMAL_TO_SOURCE,
      steps: p.normalTo.steps.map((step) =>
        fmt(step, { v1: s(50), v2: s(73) })
      ),
    },
    {
      title: p.maxPerfTo.title,
      source: p.maxPerfTo.source,
      steps: p.maxPerfTo.steps.map((step) => fmt(step, { v1: s(64) })),
    },
    {
      title: p.climb.title,
      source: CLIMB_SOURCE,
      steps: p.climb.steps.map((step) => fmt(step, { v1: s(75), v2: s(80) })),
    },
    {
      title: p.normalLdg.title,
      source: NORMAL_LDG_SOURCE,
      steps: p.normalLdg.steps.map((step) =>
        fmt(step, {
          v1: s(65),
          v2: s(75),
          v3: s(100),
          v4: s(60),
          v5: s(70),
        })
      ),
    },
    {
      title: p.shortFieldLdg.title,
      source: p.shortFieldLdg.source,
      steps: p.shortFieldLdg.steps.map((step) => fmt(step, { v1: s(58) })),
    },
    {
      title: p.goAround.title,
      source: p.goAround.source,
      steps: p.goAround.steps,
    },
  ];
}

function buildMemoryItems(t: Dict, s: (mph: number) => string) {
  return [
    { label: "VS0", mph: 48, desc: t.pilot.memory.vs0 },
    { label: "VS1", mph: 55, desc: t.pilot.memory.vs1 },
    { label: "VX", mph: 64, desc: t.pilot.memory.vx },
    { label: "VY", mph: 73, desc: t.pilot.memory.vy },
    { label: t.pilot.memory.bestGlide, mph: 65, desc: t.pilot.memory.bestGlideDesc },
    { label: "VFE", mph: 100, desc: t.pilot.memory.vfe },
    { label: "VA", mph: 109, desc: t.pilot.memory.va },
    { label: "VNO", mph: 120, desc: t.pilot.memory.vno },
    { label: "VNE", mph: 162, desc: t.pilot.memory.vne },
  ].map((m) => ({ ...m, value: s(m.mph) }));
}

export default function PilotNotes() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { format, labelIndicated } = useUnits();
  const { t, fmt } = useI18n();

  const speedStr = (mph: number) => `${format(mph)} ${labelIndicated}`;
  const procedures = buildProcedures(t, fmt, speedStr);
  const memoryItems = buildMemoryItems(t, format);

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader id="procedures" title={t.pilot.title}>
            <p className="text-[#57534e] max-w-2xl text-lg leading-relaxed">
              {t.pilot.intro}
            </p>
          </SectionHeader>
        </motion.div>

        {/* Memory items strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 p-6 bg-[#1f2937] text-[#f4efe6]"
        >
          <div className="aviation-mono text-xs tracking-[0.2em] text-[#a8a29e] mb-4">
            {t.pilot.memoryTitle} ({labelIndicated})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {memoryItems.map((item) => (
              <div key={item.label} className="text-center">
                <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#a8a29e] mb-1">
                  {item.label}
                </div>
                <div className="aviation-header text-2xl">{item.value}</div>
                <div className="aviation-mono text-[10px] text-[#78716c]">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Procedures grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {procedures.map((proc, i) => (
            <motion.div
              key={proc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="instrument-bezel p-6"
            >
              <div className="flex items-baseline justify-between gap-3 mb-5 pb-4 border-b border-[#1f2937]/10">
                <div className="flex items-center gap-3">
                  <span className="aviation-mono text-xs text-[#6b0f1a] font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="aviation-header text-lg text-[#1f2937]">
                    {proc.title}
                  </h3>
                </div>
                {proc.source && (
                  <span className="aviation-mono text-[10px] text-[#a8a29e]">
                    {proc.source}
                  </span>
                )}
              </div>

              <ol className="space-y-2.5">
                {proc.steps.map((step, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-sm text-[#57534e] leading-relaxed"
                  >
                    <span className="aviation-mono text-[10px] text-[#a8a29e] mt-0.5 flex-shrink-0 w-5">
                      {j + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </div>

        {/* Footer disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-[#1f2937]/10 text-center"
        >
          <p className="aviation-mono text-xs text-[#a8a29e] leading-relaxed max-w-2xl mx-auto">
            {t.pilot.disclaimer}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-[#6b0f1a]/30" />
            <span className="aviation-mono text-[10px] tracking-[0.2em] text-[#78716c]">
              {t.pilot.motto}
            </span>
            <div className="h-px w-8 bg-[#6b0f1a]/30" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
