"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "../LanguageContext";
import SectionHeader from "./SectionHeader";

export default function HeritageSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useI18n();

  const facts = [
    { label: t.heritage.facts.firstFlight, value: "1957" },
    { label: t.heritage.facts.production, value: "1958–1977" },
    { label: t.heritage.facts.units, value: "≈ 23,800" },
    { label: t.heritage.facts.refPoh, value: "150J · 1969" },
  ];

  return (
    <section ref={ref} className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <SectionHeader
            id="heritage"
            overline={t.heritage.section}
            title={t.heritage.heading}
          />
          <div className="space-y-4 text-[#57534e] leading-relaxed text-lg max-w-3xl">
            <p>
              {t.heritage.p1Pre}
              <strong className="text-[#1f2937]">{t.heritage.p1Aircraft}</strong>
              {t.heritage.p1Post}
            </p>
            <p>
              {t.heritage.p2}{" "}
              <span className="aviation-mono text-[#6b0f1a]">3A19</span>.
            </p>
            <p className="text-base text-[#78716c]">{t.heritage.p3}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-[#e8e2d8]/40 border border-[#1f2937]/10"
          >
            {facts.map((f) => (
              <div key={f.label}>
                <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-1">
                  {f.label}
                </div>
                <div className="aviation-header text-xl md:text-2xl text-[#1f2937]">
                  {f.value}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
