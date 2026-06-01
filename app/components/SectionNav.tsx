"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "../LanguageContext";
import { ALL_ITEMS, CHAPTERS, type NavItemId } from "./sections";
import UnitsToggle from "./UnitsToggle";

/** Distance from the top of the viewport used to decide the active section. */
const ACTIVE_OFFSET = 140;

export default function SectionNav() {
  const { t } = useI18n();
  const [active, setActive] = useState<NavItemId | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
      // Reveal the nav once the hero is mostly scrolled past.
      setVisible(y > window.innerHeight * 0.55);
      // Active = the last section whose top has crossed the offset line.
      let current: NavItemId | null = null;
      for (const id of ALL_ITEMS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: string) => {
    // Close the menu first, then scroll on the next frame. Running the scroll
    // and the menu's collapse together lets the close animation cancel the
    // in-progress smooth scroll, so we separate them.
    setOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const activeChapter = CHAPTERS.find((c) => active && c.items.includes(active));
  const currentLabel =
    active && activeChapter
      ? `${t.nav.partLabel} ${activeChapter.part} · ${t.nav.items[active]}`
      : t.nav.index;

  return (
    <>
      {/* Desktop: vertical rail anchored to the right edge. */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.4 }}
            aria-label={t.nav.index}
            className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4"
          >
            {CHAPTERS.map((ch) => (
              <div key={ch.key} className="flex flex-col items-end gap-1.5">
                <button
                  onClick={() => go(`part-${ch.key}`)}
                  className="cursor-pointer aviation-mono text-[9px] tracking-[0.2em] text-[#6b0f1a]/50 hover:text-[#6b0f1a] transition-colors"
                >
                  {t.nav.partLabel} {ch.part}
                </button>
                {ch.items.map((id) => {
                  const isActive = active === id;
                  return (
                    <button
                      key={id}
                      onClick={() => go(id)}
                      aria-current={isActive ? "true" : undefined}
                      className="group flex cursor-pointer items-center justify-end gap-3"
                    >
                      <span
                        className={`aviation-mono text-xs whitespace-nowrap transition-opacity ${
                          isActive
                            ? "text-[#6b0f1a] opacity-100"
                            : "text-[#57534e] opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {t.nav.items[id]}
                      </span>
                      <span
                        className={`block h-px transition-all duration-300 ${
                          isActive
                            ? "w-8 bg-[#6b0f1a]"
                            : "w-4 bg-[#1f2937]/30 group-hover:w-6 group-hover:bg-[#6b0f1a]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile: thin scroll-progress bar (always) + collapsible jump menu. */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40">
        <div className="h-0.5 bg-[#1f2937]/10">
          <div
            className="h-full bg-[#6b0f1a]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="border-b border-[#1f2937]/10 bg-[#f4efe6]/90 backdrop-blur-sm"
            >
              <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-2.5"
              >
                <span className="aviation-mono text-xs tracking-wider text-[#1f2937]">
                  {currentLabel}
                </span>
                <span className="aviation-mono text-xs text-[#6b0f1a]">
                  {open ? "✕" : "☰"}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              // Exit fades only (no height animation): collapsing the height
              // while a jump is mid-flight cancels the smooth scroll.
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-[#1f2937]/10 bg-[#f4efe6]"
            >
              <div className="max-h-[70vh] overflow-y-auto px-5 py-3">
                <div className="mb-4 pb-3 border-b border-[#1f2937]/10">
                  <UnitsToggle />
                </div>
                {CHAPTERS.map((ch) => (
                  <div key={ch.key} className="mb-3 last:mb-0">
                    <button
                      onClick={() => go(`part-${ch.key}`)}
                      className="block w-full cursor-pointer text-left aviation-mono text-[10px] tracking-[0.2em] text-[#6b0f1a]/60 mb-1.5 hover:text-[#6b0f1a] transition-colors"
                    >
                      {t.nav.partLabel} {ch.part} · {t.nav.chapters[ch.key]}
                    </button>
                    <div className="flex flex-col">
                      {ch.items.map((id) => (
                        <button
                          key={id}
                          onClick={() => go(id)}
                          aria-current={active === id ? "true" : undefined}
                          className={`cursor-pointer py-1.5 text-left aviation-mono text-sm transition-colors ${
                            active === id ? "text-[#6b0f1a]" : "text-[#1f2937]"
                          }`}
                        >
                          {t.nav.items[id]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
