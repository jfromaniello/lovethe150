"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

/**
 * Global sound switch. Sounds are ON by default; the user's choice is
 * persisted in localStorage. Individual sections read `enabled` to gate their
 * Web Audio output — there are no per-section mute buttons. Each section is
 * also responsible for stopping its own audio when it scrolls out of view.
 */

const STORAGE_KEY = "lovethe150-sound";
const CHANGE_EVENT = "lovethe150-sound-change";

interface SoundContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  toggle: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

function readEnabled(): boolean {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "off") return false;
  } catch {}
  return true; // default: sounds on
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore<boolean>(
    subscribe,
    readEnabled,
    () => true,
  );

  const setEnabled = useCallback((v: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? "on" : "off");
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = useMemo<SoundContextValue>(
    // toggle reads the live stored value (not the closured `enabled`) so rapid
    // clicks flip correctly even before React re-renders.
    () => ({ enabled, setEnabled, toggle: () => setEnabled(!readEnabled()) }),
    [enabled, setEnabled],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used within SoundProvider");
  }
  return ctx;
}
