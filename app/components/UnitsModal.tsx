"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "../LanguageContext";
import UnitsExplainer from "./UnitsExplainer";

interface UnitsModalValue {
  open: () => void;
}

const UnitsModalContext = createContext<UnitsModalValue | null>(null);

export function useUnitsModal() {
  const ctx = useContext(UnitsModalContext);
  if (!ctx) {
    throw new Error("useUnitsModal must be used within UnitsModalProvider");
  }
  return ctx;
}

export function UnitsModalProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Lock body scroll and wire ESC while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  return (
    <UnitsModalContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1a1a1a]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={t.units.title}
          >
            <motion.div
              className="flex max-h-[90vh] w-full max-w-3xl flex-col bg-[#f4efe6] border border-[#1f2937]/15 shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-shrink-0 items-start justify-between gap-4 px-6 sm:px-8 py-4 border-b border-[#1f2937]/10">
                <div>
                  <div className="aviation-mono text-[10px] tracking-[0.25em] text-[#6b0f1a] mb-1">
                    {t.controls.why}
                  </div>
                  <h2 className="aviation-header text-2xl sm:text-3xl text-[#1f2937] leading-none">
                    {t.units.title}
                  </h2>
                </div>
                <button
                  onClick={close}
                  aria-label={t.controls.close}
                  className="cursor-pointer flex-shrink-0 -mr-1 -mt-1 p-1 text-2xl leading-none text-[#57534e] hover:text-[#6b0f1a] transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto px-6 sm:px-8 py-6">
                <UnitsExplainer />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </UnitsModalContext.Provider>
  );
}
