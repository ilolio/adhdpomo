/**
 * FlowPomo - ADHD-friendly work timer
 * Entry point. Bootstraps all modules and binds event handlers.
 */

import { initI18n, toggleLanguage, getCurrentLang, t } from './i18n.js';
import { initUI, getElements, showStatsView, showTimerView, updateTodaySummary, updateStats, updateLangLabel } from './ui.js';
import { initSettings, setOnSettingsSaved } from './settings.js';
import { loadSettings, saveSettings, clearSessions, migrateIfNeeded } from './storage.js';
import { States, transition, getCurrentState, setOnStateChange } from './state.js';
import { getTodayStats, getWeekStats, getDailyBreakdown } from './stats.js';
import { registerSW } from './notifications.js';

let currentNav = 'timer';

function main() {
  migrateIfNeeded();

  const settings = loadSettings();

  // Initialize i18n
  initI18n(settings.language);

  // Initialize UI (cache DOM references)
  initUI();
  const els = getElements();

  // Initialize settings dialog
  initSettings();

  // Update language label
  updateLangLabel(settings.language);

  // Refresh today's summary on idle screen
  refreshTodaySummary();

  // --- Event bindings ---

  // Start Work Now
  els.btnStartWork.addEventListener('click', () => {
    transition(States.WORKING);
  });

  // Start Grace Period
  els.btnStartGrace.addEventListener('click', () => {
    transition(States.GRACE);
  });

  // Grace: I'm Ready
  els.btnGraceStartNow.addEventListener('click', () => {
    transition(States.WORKING);
  });

  // Grace: Cancel
  els.btnGraceCancel.addEventListener('click', () => {
    transition(States.IDLE);
  });

  // Work: Take Break
  els.btnWorkBreak.addEventListener('click', () => {
    transition(States.BREAK);
  });

  // Work: Stop
  els.btnWorkStop.addEventListener('click', () => {
    transition(States.IDLE);
  });

  // Break: Back to Work
  els.btnBreakBack.addEventListener('click', () => {
    transition(States.WORKING);
  });

  // Break: Stop
  els.btnBreakStop.addEventListener('click', () => {
    transition(States.IDLE);
  });

  // Language toggle
  els.btnLang.addEventListener('click', () => {
    const newLang = toggleLanguage();
    const settings = loadSettings();
    settings.language = newLang;
    saveSettings(settings);
    updateLangLabel(newLang);
    // Refresh stats view if visible
    if (currentNav === 'stats') {
      refreshStats();
    }
  });

  // Bottom navigation
  els.navTimer.addEventListener('click', () => {
    if (currentNav === 'timer') return;
    currentNav = 'timer';
    showCurrentTimerView();
  });

  els.navStats.addEventListener('click', () => {
    if (currentNav === 'stats') return;
    currentNav = 'stats';
    refreshStats();
    showStatsView();
  });

  // Clear stats
  els.btnClearStats.addEventListener('click', () => {
    if (confirm(t('stats.clearConfirm'))) {
      clearSessions();
      refreshStats();
      refreshTodaySummary();
    }
  });

  // State change listener
  setOnStateChange((newState) => {
    if (newState === States.IDLE) {
      refreshTodaySummary();
      if (currentNav === 'stats') {
        refreshStats();
      }
    }
  });

  // Settings saved listener
  setOnSettingsSaved(() => {
    // Update grace button text with current duration
    refreshGraceButtonText();
  });

  // Initial grace button text
  refreshGraceButtonText();

  // Register service worker
  registerSW();
}

function showCurrentTimerView() {
  const state = getCurrentState();
  showTimerView(state);
}

function refreshTodaySummary() {
  const today = getTodayStats();
  updateTodaySummary(today.totalWorkMs, today.sessionCount);
}

function refreshStats() {
  const today = getTodayStats();
  const week = getWeekStats();
  const history = getDailyBreakdown(14);
  updateStats(today, week, history);
}

function refreshGraceButtonText() {
  const settings = loadSettings();
  const els = getElements();
  const lang = getCurrentLang();
  if (lang === 'ja') {
    els.btnStartGrace.textContent = `${settings.graceDurationMin}\u5206\u4f11\u61a9\u3057\u3066\u304b\u3089\u958b\u59cb`;
  } else {
    els.btnStartGrace.textContent = `${settings.graceDurationMin}-min Break, Then Start`;
  }
}

// Boot
main();
