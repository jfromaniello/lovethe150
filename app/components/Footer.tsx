"use client";

import { useI18n } from "../LanguageContext";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-[#1f2937]/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="aviation-mono text-xs tracking-[0.18em] text-[#78716c]">
          {t.footer.madeWith}{" "}
          <span className="text-[#6b0f1a]" aria-hidden="true">
            ♥
          </span>{" "}
          {t.footer.by}{" "}
          <a
            href="https://x.com/jfroma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6b0f1a] underline-offset-2 hover:underline"
          >
            @jfroma
          </a>
        </p>
        <a
          href="https://github.com/jfromaniello/lovethe150"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 aviation-mono text-[11px] tracking-[0.15em] text-[#57534e] transition-colors hover:text-[#6b0f1a]"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {t.footer.source}
        </a>
        <div className="mt-2 flex max-w-2xl flex-col gap-1 text-[11px] leading-relaxed text-[#a8a29e]">
          <p>{t.footer.disclaimerProject}</p>
          <p>{t.footer.disclaimerTrademark}</p>
          <p>{t.footer.disclaimerAffiliation}</p>
        </div>
      </div>
    </footer>
  );
}
