// This file is now constants.js

export const POMODORO_SETTINGS = {
  focusDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  cycles: 4, // Number of focus sessions before a long break
};

export const USER_RANKS = [
    { name: 'Novice', minHours: 0, icon: '🌱' },
    { name: 'Apprentice', minHours: 5, icon: '🔰' },
    { name: 'Journeyman', minHours: 20, icon: '🛠️' },
    { name: 'Adept', minHours: 50, icon: '🧠' },
    { name: 'Scholar', minHours: 100, icon: '📚' },
    { name: 'Expert', minHours: 200, icon: '🧑‍🏫' },
    { name: 'Master', minHours: 400, icon: '🎓' },
    { name: 'Grandmaster', minHours: 700, icon: '🏆' },
    { name: 'Sage', minHours: 1000, icon: '🧘' },
    { name: 'Zenith', minHours: 1500, icon: '🌟' },
];

export const APP_VERSION = '1.0.0';

export const LOCAL_STORAGE_KEY_SUBJECTS = 'zenith-focus-subjects';
export const LOCAL_STORAGE_KEY_PLANNER = 'zenith-focus-planner';
export const LOCAL_STORAGE_KEY_QUOTE = 'zenith-focus-quote';
export const LOCAL_STORAGE_KEY_API_KEY = 'zenith-focus-api-key';