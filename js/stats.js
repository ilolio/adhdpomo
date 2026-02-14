/**
 * Statistics module. Computes aggregates from session history.
 */

import { loadSessions } from './storage.js';

export function getTodayStats() {
  const today = getDateString(new Date());
  const sessions = loadSessions().filter(s => s.date === today);
  return aggregateSessions(sessions);
}

export function getWeekStats() {
  const weekStart = getWeekStart(new Date());
  const sessions = loadSessions().filter(s => new Date(s.date) >= weekStart);
  return aggregateSessions(sessions);
}

export function getDailyBreakdown(days = 7) {
  const sessions = loadSessions();
  const breakdown = {};

  sessions.forEach(s => {
    if (!breakdown[s.date]) breakdown[s.date] = [];
    breakdown[s.date].push(s);
  });

  return Object.entries(breakdown)
    .map(([date, dateSessions]) => ({
      date,
      ...aggregateSessions(dateSessions),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days);
}

function aggregateSessions(sessions) {
  return {
    totalWorkMs: sessions.reduce((sum, s) => sum + (s.totalWorkMs || 0), 0),
    totalBreakMs: sessions.reduce((sum, s) => sum + (s.totalBreakMs || 0), 0),
    sessionCount: sessions.length,
  };
}

function getDateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekStart(d) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}
