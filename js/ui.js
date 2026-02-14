/**
 * UI module. All DOM access is centralized here.
 * Caches element references, binds events, updates display.
 */

import { t } from './i18n.js';

const els = {};

export function initUI() {
  // Views
  els.viewIdle = document.getElementById('view-idle');
  els.viewGrace = document.getElementById('view-grace');
  els.viewWork = document.getElementById('view-work');
  els.viewBreak = document.getElementById('view-break');
  els.viewStats = document.getElementById('view-stats');

  // Clocks
  els.graceClock = document.getElementById('grace-clock');
  els.workClock = document.getElementById('work-clock');
  els.breakClock = document.getElementById('break-clock');
  els.breakLabel = document.getElementById('break-label');

  // Buttons
  els.btnStartWork = document.getElementById('btn-start-work');
  els.btnStartGrace = document.getElementById('btn-start-grace');
  els.btnGraceStartNow = document.getElementById('btn-grace-start-now');
  els.btnGraceCancel = document.getElementById('btn-grace-cancel');
  els.btnWorkBreak = document.getElementById('btn-work-break');
  els.btnWorkStop = document.getElementById('btn-work-stop');
  els.btnBreakBack = document.getElementById('btn-break-back');
  els.btnBreakStop = document.getElementById('btn-break-stop');

  // Navigation
  els.navTimer = document.getElementById('nav-timer');
  els.navStats = document.getElementById('nav-stats');

  // Header
  els.btnLang = document.getElementById('btn-lang');
  els.langLabel = document.getElementById('lang-label');
  els.btnSettings = document.getElementById('btn-settings');
  els.btnSettingsClose = document.getElementById('btn-settings-close');
  els.settingsDialog = document.getElementById('settings-dialog');

  // Summary
  els.todayWork = document.getElementById('today-work');
  els.todaySessions = document.getElementById('today-sessions');

  // Stats
  els.statTodayWork = document.getElementById('stat-today-work');
  els.statTodayBreak = document.getElementById('stat-today-break');
  els.statTodaySessions = document.getElementById('stat-today-sessions');
  els.statWeekWork = document.getElementById('stat-week-work');
  els.statWeekBreak = document.getElementById('stat-week-break');
  els.statWeekSessions = document.getElementById('stat-week-sessions');
  els.statsHistory = document.getElementById('stats-history');
  els.btnClearStats = document.getElementById('btn-clear-stats');
}

export function getElements() {
  return els;
}

// --- View management ---

const timerViews = ['viewIdle', 'viewGrace', 'viewWork', 'viewBreak'];

export function showView(viewName) {
  // Hide all timer views
  timerViews.forEach(key => {
    if (els[key]) els[key].hidden = true;
  });
  els.viewStats.hidden = true;

  const target = els[`view${capitalize(viewName)}`];
  if (target) target.hidden = false;

  // Update nav active state
  const isStats = viewName === 'stats';
  els.navTimer.classList.toggle('nav-btn--active', !isStats);
  els.navStats.classList.toggle('nav-btn--active', isStats);
}

export function showTimerView(viewName) {
  timerViews.forEach(key => {
    if (els[key]) els[key].hidden = true;
  });

  const target = els[`view${capitalize(viewName)}`];
  if (target) target.hidden = false;

  els.viewStats.hidden = true;
  els.navTimer.classList.add('nav-btn--active');
  els.navStats.classList.remove('nav-btn--active');
}

export function showStatsView() {
  timerViews.forEach(key => {
    if (els[key]) els[key].hidden = true;
  });
  els.viewStats.hidden = false;
  els.navTimer.classList.remove('nav-btn--active');
  els.navStats.classList.add('nav-btn--active');
}

// --- Clock updates ---

export function updateGraceClock(remainingMs) {
  els.graceClock.textContent = formatTime(remainingMs);
}

export function updateWorkClock(elapsedMs) {
  els.workClock.textContent = formatTime(elapsedMs);
}

export function updateBreakClock(remainingMs, isOvertime = false) {
  if (isOvertime) {
    els.breakClock.textContent = formatTime(Math.abs(remainingMs));
    els.breakLabel.textContent = t('break.overtime');
    els.breakLabel.classList.add('break-overtime');
  } else {
    els.breakClock.textContent = formatTime(remainingMs);
    els.breakLabel.textContent = t('break.label');
    els.breakLabel.classList.remove('break-overtime');
  }
}

// --- Summary updates ---

export function updateTodaySummary(workMs, sessionCount) {
  els.todayWork.textContent = formatDuration(workMs);
  els.todaySessions.textContent = String(sessionCount);
}

// --- Stats updates ---

export function updateStats(today, week, history) {
  els.statTodayWork.textContent = formatDuration(today.totalWorkMs);
  els.statTodayBreak.textContent = formatDuration(today.totalBreakMs);
  els.statTodaySessions.textContent = String(today.sessionCount);

  els.statWeekWork.textContent = formatDuration(week.totalWorkMs);
  els.statWeekBreak.textContent = formatDuration(week.totalBreakMs);
  els.statWeekSessions.textContent = String(week.sessionCount);

  renderHistory(history);
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    els.statsHistory.innerHTML = `<p class="stats-empty">${t('stats.empty')}</p>`;
    return;
  }

  els.statsHistory.innerHTML = history.map(day => `
    <div class="history-row">
      <span class="history-date">${day.date}</span>
      <span class="history-values">
        <span>${formatDuration(day.totalWorkMs)}</span>
        <span>${day.sessionCount}s</span>
      </span>
    </div>
  `).join('');
}

// --- Language label ---

export function updateLangLabel(lang) {
  els.langLabel.textContent = lang === 'en' ? 'EN' : 'JP';
}

// --- Settings dialog ---

export function openSettings() {
  els.settingsDialog.showModal();
}

export function closeSettings() {
  els.settingsDialog.close();
}

// --- Document title ---

export function updateTitle(mode, timeStr) {
  if (mode === 'idle') {
    document.title = 'FlowPomo';
  } else {
    const modeLabel = t(`${mode}.label`);
    document.title = `${timeStr} - ${modeLabel}`;
  }
}

// --- Formatting helpers ---

export function formatTime(ms) {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  }
  return `0:${String(minutes).padStart(2, '0')}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
