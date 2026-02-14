/**
 * Sound generation using Web Audio API.
 * All sounds are synthesized - no audio files needed.
 */

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Gentle 3-note ascending chime for break-end notification.
 * C5 -> E5 -> G5, sine wave, soft envelope.
 */
export function playBreakEndChime(volume = 0.5) {
  const ctx = getContext();
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.3, volume);
  playTone(ctx, 659.25, now + 0.35, 0.4, volume);
  playTone(ctx, 783.99, now + 0.75, 0.5, volume * 0.8);
}

/**
 * Soft rising tone for grace period ending.
 */
export function playGraceEndTone(volume = 0.3) {
  const ctx = getContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(330, now);
  osc.frequency.linearRampToValueAtTime(440, now + 0.6);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.1);
  gain.gain.linearRampToValueAtTime(0, now + 0.8);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.9);
}

function playTone(ctx, freq, startTime, duration, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
  gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function playTestSound(volume = 0.5) {
  playBreakEndChime(volume);
}

/**
 * Ensure AudioContext is initialized (call on first user interaction).
 */
export function ensureAudioContext() {
  getContext();
}
