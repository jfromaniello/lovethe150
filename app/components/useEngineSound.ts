"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSound } from "../SoundContext";

/**
 * Shared Web Audio engine for the interactive cockpit sections (throttle,
 * mixture, …). It synthesises a small piston-engine growl — a sawtooth plus a
 * square sub-octave through a lowpass — whose pitch tracks RPM, and adds an LFO
 * that chops the gain when the engine runs rough (the "áspero" cue used when a
 * carbureted engine is leaned past peak).
 *
 * The hook owns the whole lifecycle: it lazily builds the graph on the first
 * `poke()` (a user gesture, so the AudioContext is allowed to start), gates
 * output on the global sound switch and on whether the section is in view,
 * idles the engine back to silence after `idleMs` of no interaction, cuts the
 * moment the section scrolls away, and tears the graph down on unmount.
 *
 * Callers compute `rpm` and `roughness` each render and call `poke()` whenever
 * the user touches the control. A section with no rough mode (the throttle)
 * simply leaves `roughness` at its default 0, which keeps the LFO silent.
 */

const RPM_MIN = 600;
const RPM_MAX = 2750;

type EngineAudio = {
  ctx: AudioContext;
  osc: OscillatorNode;
  sub: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
};

interface UseEngineSoundOptions {
  /** Current engine speed in RPM; drives the pitch. */
  rpm: number;
  /** 0…1 roughness; chops the gain and quiets the engine as it approaches
   *  cut-off. Defaults to 0 (smooth) for sections without a rough mode. */
  roughness?: number;
  /** Whether the section is on screen. Audio is gated on this and cut when it
   *  becomes false. */
  inView: boolean;
  /** Milliseconds of no `poke()` before the engine idles back to silence. */
  idleMs?: number;
}

export function useEngineSound({
  rpm,
  roughness = 0,
  inView,
  idleMs = 10000,
}: UseEngineSoundOptions) {
  const { enabled: soundOn } = useSound();
  // The engine "runs" for a few seconds after the user touches the control,
  // then idles back to silence. It also cuts the instant the section leaves view.
  const [active, setActive] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<EngineAudio | null>(null);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 60;
    const sub = ctx.createOscillator();
    sub.type = "square";
    sub.frequency.value = 120;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    // Roughness path: a slow oscillator added into the gain param. Its depth
    // scales with how rough the engine is running, so it starts to stutter.
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 8;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0;
    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.start();
    sub.start();
    lfo.start();
    audioRef.current = { ctx, osc, sub, filter, gain, lfo, lfoGain };
    return audioRef.current;
  }, []);

  // Pitch tracks RPM; roughness detunes the oscillators slightly and drives the
  // gain-chop LFO. Tracks the live values so the audio reacts immediately.
  useEffect(() => {
    const nodes = audioRef.current;
    if (!nodes) return;
    const now = nodes.ctx.currentTime;
    const norm = Math.max(0, Math.min(1, (rpm - RPM_MIN) / (RPM_MAX - RPM_MIN)));
    const base = 28 + norm * 72; // 28→100 Hz, low growl → buzzy bass
    nodes.osc.frequency.setTargetAtTime(base * (1 - 0.05 * roughness), now, 0.08);
    nodes.sub.frequency.setTargetAtTime(base * 2 * (1 + 0.04 * roughness), now, 0.08);
    nodes.filter.frequency.setTargetAtTime(500 + norm * 1500, now, 0.08);
    nodes.lfo.frequency.setTargetAtTime(7 + roughness * 8, now, 0.1);
    nodes.lfoGain.gain.setTargetAtTime(roughness * 0.18, now, 0.1);
  }, [rpm, roughness]);

  const audible = soundOn && inView && active;
  useEffect(() => {
    const nodes = audioRef.current;
    if (!nodes) return;
    if (audible && nodes.ctx.state === "suspended") void nodes.ctx.resume();
    const now = nodes.ctx.currentTime;
    // Quiet down as the engine starves near cut-off.
    const target = audible ? 0.16 * (1 - 0.6 * roughness) : 0;
    nodes.gain.gain.cancelScheduledValues(now);
    nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
    nodes.gain.gain.linearRampToValueAtTime(target, now + 0.18);
  }, [audible, roughness]);

  // Cut the engine the instant the section scrolls out of view.
  useEffect(() => {
    if (!inView) {
      setActive(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    }
  }, [inView]);

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      const nodes = audioRef.current;
      if (!nodes) return;
      try {
        nodes.osc.stop();
        nodes.sub.stop();
        nodes.lfo.stop();
        nodes.ctx.close();
      } catch {}
      audioRef.current = null;
    };
  }, []);

  // Call on user interaction: (re)start the engine and reset the idle timer.
  const poke = useCallback(() => {
    if (!soundOn) return;
    const nodes = ensureAudio();
    if (nodes && nodes.ctx.state === "suspended") void nodes.ctx.resume();
    setActive(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setActive(false), idleMs);
  }, [soundOn, ensureAudio, idleMs]);

  return { poke };
}
