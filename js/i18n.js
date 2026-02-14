/**
 * Lightweight i18n module.
 * No library dependency. Translation dictionaries as plain objects.
 * DOM walker applies translations via data-i18n attributes.
 */

const translations = {
  en: {
    'app.name': 'FlowPomo',
    'idle.ready': 'Ready',
    'idle.startWork': 'Start Work Now',
    'idle.startGrace': '5-min Break, Then Start',
    'grace.label': 'Grace Period',
    'grace.message': 'Take a breath. Work starts soon.',
    'grace.startNow': "I'm Ready \u2014 Start Now",
    'grace.cancel': 'Cancel',
    'work.label': 'Working\u2026',
    'work.takeBreak': 'Take Break',
    'work.stop': 'Stop',
    'break.label': 'Break Time',
    'break.overtime': 'overtime',
    'break.backToWork': 'Back to Work',
    'break.stop': 'Stop',
    'break.ended': 'Break is over!',
    'stats.title': 'Statistics',
    'stats.today': 'Today',
    'stats.thisWeek': 'This Week',
    'stats.totalWork': 'Total Work',
    'stats.totalBreak': 'Total Break',
    'stats.sessions': 'Sessions',
    'stats.work': 'work',
    'stats.history': 'History',
    'stats.clear': 'Clear All Data',
    'stats.clearConfirm': 'Are you sure? This will delete all session data.',
    'stats.empty': 'No sessions yet.',
    'settings.title': 'Settings',
    'settings.durations': 'Durations',
    'settings.workDuration': 'Work target (min)',
    'settings.breakDuration': 'Break (min)',
    'settings.graceDuration': 'Grace period (min)',
    'settings.sound': 'Sound',
    'settings.soundEnabled': 'Enabled',
    'settings.soundVolume': 'Volume',
    'settings.testSound': 'Test Sound',
    'settings.save': 'Save',
    'nav.timer': 'Timer',
    'nav.stats': 'Stats',
    'notification.breakEnded': 'Break time is over. Ready to get back?',
  },
  ja: {
    'app.name': 'FlowPomo',
    'idle.ready': '\u6e96\u5099OK',
    'idle.startWork': '\u4f5c\u696d\u3092\u958b\u59cb',
    'idle.startGrace': '5\u5206\u4f11\u61a9\u3057\u3066\u304b\u3089\u958b\u59cb',
    'grace.label': '\u6e96\u5099\u671f\u9593',
    'grace.message': '\u6df1\u547c\u5438\u3057\u3066\u3002\u3082\u3046\u3059\u3050\u59cb\u307e\u308b\u3088\u3002',
    'grace.startNow': '\u6e96\u5099\u3067\u304d\u305f \u2014 \u4eca\u3059\u3050\u958b\u59cb',
    'grace.cancel': '\u30ad\u30e3\u30f3\u30bb\u30eb',
    'work.label': '\u4f5c\u696d\u4e2d\u2026',
    'work.takeBreak': '\u4f11\u61a9\u3059\u308b',
    'work.stop': '\u7d42\u4e86',
    'break.label': '\u4f11\u61a9\u4e2d',
    'break.overtime': '\u8d85\u904e',
    'break.backToWork': '\u4f5c\u696d\u306b\u623b\u308b',
    'break.stop': '\u7d42\u4e86',
    'break.ended': '\u4f11\u61a9\u7d42\u4e86\uff01',
    'stats.title': '\u7d71\u8a08',
    'stats.today': '\u4eca\u65e5',
    'stats.thisWeek': '\u4eca\u9031',
    'stats.totalWork': '\u4f5c\u696d\u6642\u9593',
    'stats.totalBreak': '\u4f11\u61a9\u6642\u9593',
    'stats.sessions': '\u30bb\u30c3\u30b7\u30e7\u30f3',
    'stats.work': '\u4f5c\u696d',
    'stats.history': '\u5c65\u6b74',
    'stats.clear': '\u5168\u30c7\u30fc\u30bf\u3092\u524a\u9664',
    'stats.clearConfirm': '\u672c\u5f53\u306b\u524a\u9664\u3057\u307e\u3059\u304b\uff1f\u5168\u3066\u306e\u30bb\u30c3\u30b7\u30e7\u30f3\u30c7\u30fc\u30bf\u304c\u5931\u308f\u308c\u307e\u3059\u3002',
    'stats.empty': '\u307e\u3060\u30bb\u30c3\u30b7\u30e7\u30f3\u304c\u3042\u308a\u307e\u305b\u3093\u3002',
    'settings.title': '\u8a2d\u5b9a',
    'settings.durations': '\u6642\u9593\u8a2d\u5b9a',
    'settings.workDuration': '\u4f5c\u696d\u76ee\u5b89\uff08\u5206\uff09',
    'settings.breakDuration': '\u4f11\u61a9\uff08\u5206\uff09',
    'settings.graceDuration': '\u6e96\u5099\u671f\u9593\uff08\u5206\uff09',
    'settings.sound': '\u30b5\u30a6\u30f3\u30c9',
    'settings.soundEnabled': '\u6709\u52b9',
    'settings.soundVolume': '\u97f3\u91cf',
    'settings.testSound': '\u30c6\u30b9\u30c8\u518d\u751f',
    'settings.save': '\u4fdd\u5b58',
    'nav.timer': '\u30bf\u30a4\u30de\u30fc',
    'nav.stats': '\u7d71\u8a08',
    'notification.breakEnded': '\u4f11\u61a9\u6642\u9593\u304c\u7d42\u308f\u308a\u307e\u3057\u305f\u3002\u623b\u308b\u6e96\u5099\u306f\u3067\u304d\u307e\u3057\u305f\u304b\uff1f',
  },
};

let currentLang = 'en';

export function initI18n(lang = 'en') {
  currentLang = lang;
  applyTranslations();
}

export function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang === 'ja' ? 'ja' : 'en';
  applyTranslations();
}

export function t(key) {
  return translations[currentLang]?.[key] ?? translations['en']?.[key] ?? key;
}

export function toggleLanguage() {
  const next = currentLang === 'en' ? 'ja' : 'en';
  setLanguage(next);
  return next;
}

export function getCurrentLang() {
  return currentLang;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = t(key);
    if (text !== key) {
      el.textContent = text;
    }
  });
  document.title = t('app.name');
}
