/**
 * Storage abstraction layer (DAO pattern).
 * Currently backed by localStorage.
 * Designed for future platform portability (Android/REST API).
 */

const KEYS = {
  SETTINGS: 'flowpomo_settings',
  SESSIONS: 'flowpomo_sessions',
  VERSION: 'flowpomo_version',
};

const CURRENT_VERSION = '1';

const DEFAULT_SETTINGS = {
  workDurationMin: 25,
  breakDurationMin: 5,
  graceDurationMin: 5,
  soundEnabled: true,
  soundVolume: 50,
  language: 'en',
};

// --- Settings ---

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

// --- Sessions ---

export function loadSessions() {
  try {
    const raw = localStorage.getItem(KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session) {
  const sessions = loadSessions();
  sessions.push(session);
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

export function clearSessions() {
  localStorage.removeItem(KEYS.SESSIONS);
}

// --- Schema migration ---

export function migrateIfNeeded() {
  const version = localStorage.getItem(KEYS.VERSION);
  if (version !== CURRENT_VERSION) {
    localStorage.setItem(KEYS.VERSION, CURRENT_VERSION);
  }
}
