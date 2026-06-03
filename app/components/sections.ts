import type { Dict } from "../i18n/en";

/**
 * Single source of truth for the page's chapter → section structure.
 * Consumed by both SectionNav (the scroll-spy rail) and page.tsx (which
 * renders the chapter dividers and section components in this order), so
 * the navigation and the document can never drift out of sync.
 *
 * Each `id` matches the anchor id passed to the corresponding
 * <SectionHeader id=…>, and each `key` matches a label in `Dict["nav"]`.
 */

export type NavItemId =
  | "heritage"
  | "overview"
  | "airspeed"
  | "stall"
  | "flaps"
  | "throttle"
  | "mixture"
  | "fuel"
  | "trim"
  | "procedures";

export type ChapterKey = keyof Dict["nav"]["chapters"];

export interface Chapter {
  key: ChapterKey;
  /** Roman numeral shown in the divider and the rail overline. */
  part: string;
  items: NavItemId[];
}

export const CHAPTERS: Chapter[] = [
  { key: "aircraft", part: "I", items: ["heritage", "overview"] },
  { key: "speeds", part: "II", items: ["airspeed", "stall"] },
  // Ordered to follow a real flight: dip the fuel (preflight), set power, lean
  // the mixture, trim off the load, configure flaps for approach/landing.
  { key: "controls", part: "III", items: ["fuel", "throttle", "mixture", "trim", "flaps"] },
  { key: "operation", part: "IV", items: ["procedures"] },
];
// MPH vs Knots is no longer a section — it lives in the "why?" units modal.

/** Flat, ordered list of every section id — handy for scroll-spy. */
export const ALL_ITEMS: NavItemId[] = CHAPTERS.flatMap((c) => c.items);
