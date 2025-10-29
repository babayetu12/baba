// FIX: Removed self-import of 'Achievement' which caused a name conflict with the interface defined below.

export interface Subject {
  id: string;
  name: string;
  colorHex: string;
  sessions: FocusSession[];
  todos: TodoItem[];
  studyPoints?: number;
  courseMaterial?: CourseMaterial;
}

export interface FocusSession {
  id: string;
  date: string; // ISO string
  duration: number; // in seconds
  breakDuration: number; // in seconds
}

export interface TodoItem {
  id: string;
  subjectId: string;
  title: string;
  isCompleted: boolean;
  dueDate: string; // ISO string
  hasSpecificTime: boolean;
  reminderType?: 'none' | 'onTime' | '15m' | '1h' | '1d';
  notificationId?: string;
  subject?: Subject; // This is added dynamically and not stored
}

export interface DailyGoal {
  id: string;
  text: string;
  subjectId: string;
  isCompleted: boolean;
}

export interface CourseMaterial {
  totalPages: number;
  totalChapters: number;
  pagesRead: number;
  pagesUnderlined: number;
  pagesSummarized: number;
}

export interface SessionReport {
  focusedDuration: number;
  breakDuration: number;
  totalFocusTimeBefore: number;
  totalFocusTimeAfter: number;
}

export interface StudyBlock {
  id: string;
  subjectId: string;
  startTime: string; // ISO string for date and time
  endTime: string; // ISO string for date and time
  title: string;
  isCompleted: boolean;
  goalId?: string; // Link to a daily goal
}

export interface Exam {
  id: string;
  subjectId: string;
  date: string; // ISO string for date
  title: string;
  notes?: string;
}

export enum FocusMode {
  Pomodoro = 'Pomodoro',
  Countdown = 'Countdown',
  Stopwatch = 'Stopwatch',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isSecret?: boolean;
}
