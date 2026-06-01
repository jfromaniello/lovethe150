import { Fragment } from "react";
import HeroSection from "./components/HeroSection";
import AircraftOverview from "./components/AircraftOverview";
import HeritageSection from "./components/HeritageSection";
import AirspeedIndicator from "./components/AirspeedIndicator";
import StallBankAngle from "./components/StallBankAngle";
import FlapsConfig from "./components/FlapsConfig";
import ThrottlePower from "./components/ThrottlePower";
import FuelSystem from "./components/FuelSystem";
import ElevatorTrim from "./components/ElevatorTrim";
import PilotNotes from "./components/PilotNotes";
import ChapterDivider from "./components/ChapterDivider";
import SectionNav from "./components/SectionNav";
import PageControls from "./components/PageControls";
import { UnitsModalProvider } from "./components/UnitsModal";
import { CHAPTERS, type NavItemId } from "./components/sections";
import { UnitsProvider } from "./UnitsContext";
import { LanguageProvider } from "./LanguageContext";
import { SoundProvider } from "./SoundContext";

const SECTIONS: Record<NavItemId, React.ComponentType> = {
  heritage: HeritageSection,
  overview: AircraftOverview,
  airspeed: AirspeedIndicator,
  stall: StallBankAngle,
  flaps: FlapsConfig,
  throttle: ThrottlePower,
  fuel: FuelSystem,
  trim: ElevatorTrim,
  procedures: PilotNotes,
};

export default function HomePage() {
  return (
    <LanguageProvider>
      <UnitsProvider>
        <SoundProvider>
          <UnitsModalProvider>
            <PageControls />
          <SectionNav />
          <main className="relative overflow-x-hidden">
            <HeroSection />
            {CHAPTERS.map((chapter) => (
              <Fragment key={chapter.key}>
                <ChapterDivider chapter={chapter} />
                {chapter.items.map((id) => {
                  const Section = SECTIONS[id];
                  return <Section key={id} />;
                })}
              </Fragment>
            ))}
          </main>
          </UnitsModalProvider>
        </SoundProvider>
      </UnitsProvider>
    </LanguageProvider>
  );
}
