/**
 * Settings management module.
 * Populates the settings dialog and handles save.
 */

import { loadSettings, saveSettings } from './storage.js';
import { playTestSound } from './sound.js';
import { openSettings, closeSettings } from './ui.js';

let onSettingsSaved = null;

export function setOnSettingsSaved(callback) {
  onSettingsSaved = callback;
}

export function initSettings() {
  const settings = loadSettings();
  populateForm(settings);
  bindSettingsEvents();
}

function populateForm(settings) {
  document.getElementById('setting-work-duration').value = settings.workDurationMin;
  document.getElementById('setting-break-duration').value = settings.breakDurationMin;
  document.getElementById('setting-grace-duration').value = settings.graceDurationMin;
  document.getElementById('setting-sound-enabled').checked = settings.soundEnabled;
  document.getElementById('setting-sound-volume').value = settings.soundVolume;
}

function bindSettingsEvents() {
  const btnSettings = document.getElementById('btn-settings');
  const btnClose = document.getElementById('btn-settings-close');
  const form = document.getElementById('settings-form');
  const btnTestSound = document.getElementById('btn-test-sound');
  const dialog = document.getElementById('settings-dialog');

  btnSettings.addEventListener('click', () => {
    populateForm(loadSettings());
    openSettings();
  });

  btnClose.addEventListener('click', () => {
    closeSettings();
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeSettings();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = loadSettings();
    const settings = {
      workDurationMin: parseInt(document.getElementById('setting-work-duration').value) || 25,
      breakDurationMin: parseInt(document.getElementById('setting-break-duration').value) || 5,
      graceDurationMin: parseInt(document.getElementById('setting-grace-duration').value) || 5,
      soundEnabled: document.getElementById('setting-sound-enabled').checked,
      soundVolume: parseInt(document.getElementById('setting-sound-volume').value) || 50,
      language: current.language,
    };
    saveSettings(settings);
    closeSettings();
    onSettingsSaved?.(settings);
  });

  btnTestSound.addEventListener('click', () => {
    const volume = parseInt(document.getElementById('setting-sound-volume').value) || 50;
    playTestSound(volume / 100);
  });
}
