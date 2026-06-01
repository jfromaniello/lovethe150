"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Progressive disclosure for the dense hardware / POH-citation prose. The
 * practical lead stays visible; the deep detail folds behind this toggle so
 * the page is scannable for someone who just wants to play with the control.
 */
export default function TechnicalDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 max-w-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group inline-flex cursor-pointer items-center gap-2 aviation-mono text-xs tracking-[0.15em] text-[#6b0f1a] hover:text-[#5a0d16] transition-colors"
      >
        <span
          className={`inline-block transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden
        >
          ▸
        </span>
        {label}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
