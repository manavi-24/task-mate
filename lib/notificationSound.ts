"use client";

let audioContext: AudioContext | null = null;
let unlocked = false;
let lastPlayedAt = 0;

const MIN_GAP_MS = 1200;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    audioContext = Ctx ? new Ctx() : null;
  }
  return audioContext;
}

export function initNotificationSound() {
  if (typeof window === "undefined") return;
  if (unlocked) return;

  const unlock = () => {
    unlocked = true;
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export function playNotificationSound() {
  if (typeof window === "undefined") return;
  if (!unlocked) return;
  const now = Date.now();
  if (now - lastPlayedAt < MIN_GAP_MS) return;
  lastPlayedAt = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.001;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const startAt = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.35);

  oscillator.start(startAt);
  oscillator.stop(startAt + 0.36);
}