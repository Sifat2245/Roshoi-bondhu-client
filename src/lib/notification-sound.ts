import { getNotificationPreferences } from "./notification-preferences";

let audioCtx: AudioContext | null = null;
let lastPlayedAt = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  return audioCtx;
}

/**
 * Unlocks Web Audio on the first user gesture so incoming socket chimes play reliably.
 */
export function unlockNotificationAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

/**
 * Plays a gentle two-tone Facebook-style notification pop using Web Audio API.
 */
export function playNotificationSound(): void {
  try {
    const prefs = getNotificationPreferences();
    if (prefs.SOUND === false) return;

    const nowMs = Date.now();
    if (nowMs - lastPlayedAt < 650) return;
    lastPlayedAt = nowMs;

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const startTime = ctx.currentTime + 0.01;

    const playTone = (freq: number, offset: number, duration: number, peakGain: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime + offset);

      gain.gain.setValueAtTime(0.0001, startTime + offset);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime + offset);
      osc.stop(startTime + offset + duration + 0.01);
    };

    playTone(587.33, 0, 0.09, 0.08); // D5
    playTone(880.0, 0.065, 0.14, 0.095); // A5
  } catch {
    /* Autoplay restrictions or headless environments silently ignore */
  }
}

