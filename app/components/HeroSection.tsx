"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import BlueprintGrid from "./BlueprintGrid";
import { useI18n } from "../LanguageContext";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const callouts = [
    { label: t.hero.specs.model, value: "150" },
    { label: t.hero.specs.seats, value: "2" },
    { label: t.hero.specs.production, value: "1958–1977" },
    { label: t.hero.specs.engine, value: "O-200-A" },
    { label: t.hero.specs.hp, value: "100" },
    { label: t.hero.specs.mtow, value: "1,600 lb" },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      <BlueprintGrid />

      {/* Parallax background layer */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(107,15,26,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(31,41,55,0.04),transparent_50%)]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Typography block */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-[#6b0f1a]/30" />
                <span className="aviation-mono text-xs tracking-[0.25em] text-[#6b0f1a]">
                  {t.hero.overline}
                </span>
                <div className="h-px flex-1 bg-[#6b0f1a]/30" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="aviation-header text-[clamp(3rem,10vw,7rem)] leading-[0.9] tracking-tight"
            >
              <span className="block text-[#1f2937]">CESSNA</span>
              <span className="block text-[#6b0f1a]">150</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-baseline gap-4 flex-wrap"
            >
              <span className="aviation-header text-4xl md:text-5xl text-[#1f2937]">
                {t.hero.subtitle}
              </span>
              <span className="aviation-mono text-sm text-[#57534e] tracking-wider">
                {t.hero.subtitleSecond}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="text-lg text-[#57534e] max-w-lg leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap gap-3 items-center"
            >
              <a
                href="#overview"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#6b0f1a] text-[#f4efe6] aviation-mono text-sm tracking-wider hover:bg-[#5a0d16] transition-colors"
              >
                {t.hero.cta}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>
              <a
                href="#procedures"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#1f2937]/20 text-[#1f2937] aviation-mono text-sm tracking-wider hover:border-[#6b0f1a] hover:text-[#6b0f1a] transition-colors"
              >
                {t.hero.procedures}
              </a>
            </motion.div>
          </div>

          {/* Right: Technical callout grid */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Decorative frame */}
              <div className="absolute -inset-4 border border-[#1f2937]/10 pointer-events-none" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#6b0f1a]/40" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#6b0f1a]/40" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#6b0f1a]/40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#6b0f1a]/40" />

              <div className="bg-[#e8e2d8]/50 backdrop-blur-sm p-6 md:p-8">
                <div className="aviation-mono text-xs tracking-[0.2em] text-[#6b0f1a] mb-6 pb-4 border-b border-[#1f2937]/10">
                  {t.hero.specsTitle}
                </div>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {callouts.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 + i * 0.08 }}
                      className="group"
                    >
                      <div className="aviation-mono text-[10px] tracking-[0.15em] text-[#78716c] mb-1">
                        {item.label}
                      </div>
                      <div className="aviation-header text-xl md:text-2xl text-[#1f2937] group-hover:text-[#6b0f1a] transition-colors">
                        {item.value}
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f4efe6] to-transparent pointer-events-none" />
    </section>
  );
}
