// This file is now utils/helpers.js

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function getTotalFocusTime(sessions) {
  if (!sessions) return 0;
  return sessions.reduce((total, session) => total + session.duration, 0);
}

export function hexToRgba(hex, alpha = 1) {
    if (!hex || hex.length < 4) {
        return `rgba(0, 0, 0, ${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return `rgba(0, 0, 0, ${alpha})`; // fallback for invalid hex
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (num) => num.toString().padStart(2, '0');

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

export function formatTotalTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }
  
  if (minutes > 0) {
      return `${minutes}m`;
  }
  
  return `${Math.floor(seconds)}s`;
}

export function calculateOverallLongestStreak(subjects) {
    const allSessionDates = subjects.flatMap(s => s.sessions || []).map(sess => new Date(sess.date));
    
    if (allSessionDates.length === 0) return 0;

    // Normalize to the start of the day and get unique dates
    const uniqueDates = [...new Set(allSessionDates.map(d => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    }))];

    if (uniqueDates.length <= 1) return uniqueDates.length;

    // FIX: Explicitly cast to Number to satisfy TypeScript checker in JS file.
    uniqueDates.sort((a, b) => Number(a) - Number(b));

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const dayInMillis = 24 * 60 * 60 * 1000;
        // FIX: Explicitly cast to Number to satisfy TypeScript checker in JS file.
        const diff = Number(uniqueDates[i]) - Number(uniqueDates[i - 1]);

        if (diff === dayInMillis) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    return longestStreak;
}


export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission !== 'granted') {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission was not granted.');
            }
        } catch (error) {
            console.error('Notification permission request failed:', error);
        }
    }
}

// This is a simplified implementation. A robust solution would use a service worker.
// This stores timeout IDs to allow cancellation.
const notificationTimeouts = {};

export function scheduleNotification(id, message, triggerDate) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        const delay = triggerDate.getTime() - now.getTime();
        if (delay > 0) {
            const timeoutId = window.setTimeout(() => {
                // Check permission again right before showing, in case it was revoked.
                if (Notification.permission === 'granted') {
                    new Notification('Zenith Focus', {
                        body: message,
                        icon: '/logo192.png', // A default icon
                    });
                }
                delete notificationTimeouts[id];
            }, delay);
            notificationTimeouts[id] = timeoutId;
        }
    }
}

export function cancelNotification(id) {
    if (notificationTimeouts[id]) {
        clearTimeout(notificationTimeouts[id]);
        delete notificationTimeouts[id];
    }
}

export function getWeekDays(date) {
    const startOfWeek = new Date(date);
    // Use Sunday as start of the week for a typical calendar view
    startOfWeek.setDate(date.getDate() - date.getDay());
    const week = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
    }
    return week;
}

export function formatWeekRange(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const startMonth = startDate.toLocaleDateString(undefined, { month: 'short' });
    const endMonth = endDate.toLocaleDateString(undefined, { month: 'short' });

    if (startMonth === endMonth) {
        return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
}