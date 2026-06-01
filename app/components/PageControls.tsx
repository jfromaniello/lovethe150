"use client";

import UnitsToggle from "./UnitsToggle";

/**
 * Page-wide unit/language controls, pinned to the top-right corner on desktop
 * so they're always reachable without scrolling back to the hero. On mobile
 * the same controls live inside the nav jump menu (see SectionNav).
 */
export default function PageControls() {
  return (
    <div className="fixed top-4 right-4 z-40 hidden lg:block">
      <UnitsToggle />
    </div>
  );
}
