/**
 * Timer module.
 * - Countdown mode: grace period, break (counts down from target)
 * - Count-up mode: work (counts up from 0, no alarm)
 * Uses Date.now() for drift correction.
 */

export function createTimer({ mode, durationMs, onTick, onComplete, continueAfterComplete = false }) {
  let startTime = null;
  let elapsed = 0;
  let intervalId = null;
  let completed = false;

  function start() {
    startTime = Date.now();
    elapsed = 0;
    completed = false;
    intervalId = setInterval(tick, 250);
    tick();
  }

  function tick() {
    elapsed = Date.now() - startTime;

    if (mode === 'countdown') {
      const remaining = Math.max(0, durationMs - elapsed);
      onTick(remaining, elapsed);
      if (remaining <= 0 && !completed) {
        completed = true;
        onComplete?.();
        if (!continueAfterComplete) {
          stop();
        }
      }
    } else {
      onTick(elapsed, elapsed);
    }
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    return elapsed;
  }

  function getElapsed() {
    return elapsed;
  }

  function isRunning() {
    return intervalId !== null;
  }

  return { start, stop, getElapsed, isRunning };
}
