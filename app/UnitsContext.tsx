"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type SpeedUnit = "mph" | "kts";

interface UnitsContextValue {
  unit: SpeedUnit;
  setUnit: (u: SpeedUnit) => void;
  toggleUnit: () => void;
  format: (mph: number, opts?: { decimals?: number }) => string;
  convert: (mph: number) => number;
  label: string;
  labelIndicated: string;
}

const STORAGE_KEY = "lovethe150-speed-unit";
const MPH_TO_KTS = 0.868976;

const UnitsContext = createContext<UnitsContextValue | null>(null);

function readUnit(): SpeedUnit {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "mph" || stored === "kts") return stored;
  } catch {}
  return "mph";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("lovethe150-unit-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("lovethe150-unit-change", callback);
  };
}

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const unit = useSyncExternalStore<SpeedUnit>(
    subscribe,
    readUnit,
    () => "mph"
  );

  const setUnit = useCallback((u: SpeedUnit) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, u);
    } catch {}
    window.dispatchEvent(new Event("lovethe150-unit-change"));
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit(unit === "mph" ? "kts" : "mph");
  }, [unit, setUnit]);

  const value = useMemo<UnitsContextValue>(() => {
    const convert = (mph: number) =>
      unit === "mph" ? mph : mph * MPH_TO_KTS;
    const format = (mph: number, opts?: { decimals?: number }) => {
      const v = convert(mph);
      const d = opts?.decimals ?? 0;
      return v.toFixed(d);
    };
    return {
      unit,
      setUnit,
      toggleUnit,
      format,
      convert,
      label: unit === "mph" ? "MPH" : "KTS",
      labelIndicated: unit === "mph" ? "MPH" : "KIAS",
    };
  }, [unit, setUnit, toggleUnit]);

  return (
    <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) {
    throw new Error("useUnits must be used within UnitsProvider");
  }
  return ctx;
}
