"use client";

import { useState, type ReactNode } from "react";

interface SectionHeaderProps {
  id: string;
  /** Optional kicker above the title. Omit for a bare hairline — the chapter
   *  divider and nav rail already carry the structural numbering. */
  overline?: string;
  title: string;
  children?: ReactNode;
}

export default function SectionHeader({
  id,
  overline,
  title,
  children,
}: SectionHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle the hash navigation and update URL.
    // Also write the absolute link to the clipboard for easy sharing.
    if (typeof window !== "undefined" && navigator.clipboard) {
      e.preventDefault();
      const href = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(href).catch(() => {});
      // Manually update the URL hash so back-button history works.
      window.history.replaceState(null, "", `#${id}`);
      // Scroll the anchor into view manually since we prevented default.
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div id={id} className="mb-16 scroll-mt-24 lg:scroll-mt-8">
      <div className="mb-4">
        <a
          href={`#${id}`}
          onClick={handleClick}
          className="group inline-flex items-center gap-4 cursor-pointer w-fit"
          aria-label={`${title} – copy link`}
        >
          <div className="h-px w-12 bg-[#6b0f1a]" />
          {overline ? (
            <span className="aviation-mono text-xs tracking-[0.25em] text-[#6b0f1a]">
              {overline}
            </span>
          ) : null}
          <span
            className={`aviation-mono text-xs text-[#6b0f1a]/50 transition-opacity ${
              copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {copied ? "✓ link copied" : "#"}
          </span>
        </a>
      </div>
      <div>
        <a
          href={`#${id}`}
          onClick={handleClick}
          className="group/title inline-flex items-baseline gap-3 cursor-pointer w-fit"
        >
          <h2 className="aviation-header text-4xl md:text-5xl text-[#1f2937] group-hover/title:text-[#6b0f1a] transition-colors">
            {title}
          </h2>
          <span className="aviation-mono text-2xl md:text-3xl text-[#6b0f1a]/30 opacity-0 group-hover/title:opacity-100 transition-opacity">
            #
          </span>
        </a>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
