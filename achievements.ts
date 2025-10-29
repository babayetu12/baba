import { Achievement } from './types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Session based
  { id: 'first_session', name: 'First Step', description: 'Complete your first focus session.', icon: '🎉' },
  { id: 'ten_sessions', name: 'Getting Serious', description: 'Complete 10 focus sessions.', icon: '🔥' },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a focus session after 10 PM.', icon: '🦉' },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a focus session before 6 AM.', icon: '☀️' },

  // Time based
  { id: 'one_hour_total', name: 'Hour Power', description: 'Reach 1 hour of total focus time.', icon: '⏱️' },
  { id: 'ten_hours_total', name: 'Scholar', description: 'Reach 10 hours of total focus time.', icon: '📚' },
  { id: 'fifty_hours_total', name: 'Adept', description: 'Reach 50 hours of total focus time.', icon: '🧠' },
  { id: 'one_hour_session', name: 'Marathoner', description: 'Complete a single focus session of at least 1 hour.', icon: '🏃' },
  { id: 'ten_hour_week', name: 'Weekly Warrior', description: 'Focus for 10 hours in a single week.', icon: '🗓️' },

  // Streak based
  { id: 'three_day_streak', name: 'On a Roll', description: 'Maintain a 3-day study streak.', icon: '🎲' },
  { id: 'seven_day_streak', name: 'Committed', description: 'Maintain a 7-day study streak.', icon: '💪' },

  // Task based
  { id: 'first_task', name: 'Task Taker', description: 'Complete your first task.', icon: '✅' },
  { id: 'ten_tasks', name: 'Task Manager', description: 'Complete 10 tasks.', icon: '📋' },
  { id: 'task_master', name: 'Task Master', description: 'Complete all tasks due on a single day.', icon: '🏆' },
];
