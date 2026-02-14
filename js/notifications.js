/**
 * Browser notification support and service worker registration.
 */

export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      return reg;
    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  }
}

export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

export function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: './icons/icon-192.png',
      tag: 'flowpomo-timer',
    });
  }
}
