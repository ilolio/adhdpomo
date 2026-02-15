/**
 * State machine for the timer application.
 *
 * States: IDLE | GRACE | WORKING | BREAK
 *
 * ADHD-specific behavior:
 * - No alarm during WORKING (don't interrupt flow)
 * - Break expiry plays sound but does NOT force transition
 * - Grace period eases into work mode
 */

import { createTimer } from './timer.js';
import { loadSettings, saveSession } from './storage.js';
import { playBreakEndChime, playGraceEndTone, ensureAudioContext } from './sound.js';
import { showNotification, requestNotificationPermission } from './notifications.js';
import { t } from './i18n.js';
import {
  showTimerView,
  updateGraceClock,
  updateWorkClock,
  updateBreakClock,
  updateTitle,
  formatTime,
  setWorkGraceButtonVisible,
} from './ui.js';

export const States = Object.freeze({
  IDLE: 'idle',
  GRACE: 'grace',
  WORKING: 'working',
  BREAK: 'break',
});

const ALLOWED_TRANSITIONS = {
  [States.IDLE]: [States.WORKING, States.GRACE],
  [States.GRACE]: [States.WORKING, States.IDLE],
  [States.WORKING]: [States.BREAK, States.IDLE, States.GRACE],
  [States.BREAK]: [States.WORKING, States.IDLE],
};

let currentState = States.IDLE;
let activeTimer = null;
let currentSession = null;
let currentSegmentStart = null;
let graceCount = 0;

// Callbacks for external listeners
let onStateChange = null;

export function setOnStateChange(callback) {
  onStateChange = callback;
}

export function getCurrentState() {
  return currentState;
}

export function transition(newState) {
  if (!ALLOWED_TRANSITIONS[currentState]?.includes(newState)) {
    console.warn(`Invalid transition: ${currentState} -> ${newState}`);
    return;
  }

  exitState(currentState);
  const prevState = currentState;
  currentState = newState;
  enterState(newState, prevState);

  document.documentElement.dataset.mode = newState;
  onStateChange?.(newState, prevState);
}

// --- State exit handlers ---

function exitState(state) {
  if (activeTimer) {
    activeTimer.stop();
    activeTimer = null;
  }

  if (state === States.GRACE && currentSession && currentSegmentStart) {
    recordSegment('grace');
  } else if (state === States.WORKING && currentSession && currentSegmentStart) {
    recordSegment('work');
  } else if (state === States.BREAK && currentSession && currentSegmentStart) {
    recordSegment('break');
  }
}

// --- State enter handlers ---

function enterState(state, prevState) {
  const settings = loadSettings();

  switch (state) {
    case States.IDLE:
      if (currentSession && currentSession.segments.length > 0) {
        finalizeSession();
      }
      currentSession = null;
      currentSegmentStart = null;
      showTimerView('idle');
      updateTitle('idle', '');
      break;

    case States.GRACE:
      ensureAudioContext();
      requestNotificationPermission();
      if (!currentSession) {
        createSession();
      }
      graceCount++;
      currentSegmentStart = Date.now();
      showTimerView('grace');

      const graceDurationMs = graceCount > 1
        ? 3 * 60 * 1000
        : settings.graceDurationMin * 60 * 1000;

      activeTimer = createTimer({
        mode: 'countdown',
        durationMs: graceDurationMs,
        onTick(remaining) {
          updateGraceClock(remaining);
          updateTitle('grace', formatTime(remaining));
        },
        onComplete() {
          transition(States.WORKING);
        },
      });
      activeTimer.start();
      break;

    case States.WORKING:
      if (!currentSession) {
        ensureAudioContext();
        requestNotificationPermission();
        createSession();
      }
      if (prevState === States.GRACE && settings.soundEnabled) {
        playGraceEndTone(settings.soundVolume / 100);
      }
      currentSegmentStart = Date.now();
      showTimerView('work');
      setWorkGraceButtonVisible(true);

      activeTimer = createTimer({
        mode: 'countup',
        onTick(elapsed) {
          updateWorkClock(elapsed);
          updateTitle('work', formatTime(elapsed));
          if (elapsed >= 60 * 1000) {
            setWorkGraceButtonVisible(false);
          }
        },
      });
      activeTimer.start();
      break;

    case States.BREAK:
      currentSegmentStart = Date.now();
      showTimerView('break');

      const breakDurationMs = settings.breakDurationMin * 60 * 1000;
      let breakSoundPlayed = false;

      activeTimer = createTimer({
        mode: 'countdown',
        durationMs: breakDurationMs,
        continueAfterComplete: true,
        onTick(remaining, elapsed) {
          if (remaining > 0) {
            updateBreakClock(remaining, false);
            updateTitle('break', formatTime(remaining));
          } else {
            // Overtime: keep counting past 0
            const overtime = elapsed - breakDurationMs;
            updateBreakClock(overtime, true);
            updateTitle('break', '+' + formatTime(overtime));
          }
        },
        onComplete() {
          if (!breakSoundPlayed) {
            breakSoundPlayed = true;
            if (settings.soundEnabled) {
              playBreakEndChime(settings.soundVolume / 100);
            }
            showNotification(t('break.ended'), t('notification.breakEnded'));
          }
          // Do NOT transition. User stays in BREAK.
        },
      });
      activeTimer.start();
      break;
  }
}

// --- Session management ---

function createSession() {
  graceCount = 0;
  currentSession = {
    id: `session_${Date.now()}`,
    date: getDateString(new Date()),
    startedAt: Date.now(),
    endedAt: null,
    totalWorkMs: 0,
    totalBreakMs: 0,
    totalGraceMs: 0,
    segments: [],
  };
}

function recordSegment(type) {
  if (!currentSession || !currentSegmentStart) return;

  const now = Date.now();
  const durationMs = now - currentSegmentStart;

  currentSession.segments.push({
    type,
    startedAt: currentSegmentStart,
    endedAt: now,
    durationMs,
  });

  if (type === 'work') currentSession.totalWorkMs += durationMs;
  else if (type === 'break') currentSession.totalBreakMs += durationMs;
  else if (type === 'grace') currentSession.totalGraceMs += durationMs;

  currentSegmentStart = null;
}

function finalizeSession() {
  if (!currentSession) return;

  currentSession.endedAt = Date.now();
  // Only save if there was actual work done
  if (currentSession.totalWorkMs > 0) {
    saveSession(currentSession);
  }
}

// --- Helpers ---

function getDateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
