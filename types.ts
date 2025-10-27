// This file is now types.js

/**
 * @typedef {object} Subject
 * @property {string} id
 * @property {string} name
 * @property {string} colorHex
 * @property {FocusSession[]} sessions
 * @property {TodoItem[]} todos
 * @property {number} [studyPoints]
 * @property {CourseMaterial} [courseMaterial]
 */

/**
 * @typedef {object} FocusSession
 * @property {string} id
 * @property {string} date - ISO string
 * @property {number} duration - in seconds
 * @property {number} breakDuration - in seconds
 */

/**
 * @typedef {object} TodoItem
 * @property {string} id
 * @property {string} subjectId
 * @property {string} title
 * @property {boolean} isCompleted
 * @property {string} dueDate - ISO string
 * @property {boolean} hasSpecificTime
 * @property {'none' | 'onTime' | '15m' | '1h' | '1d'} [reminderType]
 * @property {string} [notificationId]
 * @property {Subject} [subject] - This is added dynamically and not stored
 */

/**
 * @typedef {object} CourseMaterial
 * @property {number} totalPages
 * @property {number} totalChapters
 * @property {number} pagesRead
 * @property {number} pagesUnderlined
 * @property {number} pagesSummarized
 */

/**
 * @typedef {object} SessionReport
 * @property {number} focusedDuration
 * @property {number} breakDuration
 * @property {number} totalFocusTimeBefore
 * @property {number} totalFocusTimeAfter
 */

/**
 * @typedef {object} StudyBlock
 * @property {string} id
 * @property {string} subjectId
 * @property {string} startTime - ISO string for date and time
 * @property {string} endTime - ISO string for date and time
 * @property {string} title
 * @property {boolean} isCompleted
 */

/**
 * @typedef {object} Exam
 * @property {string} id
 * @property {string} subjectId
 * @property {string} date - ISO string for date
 * @property {string} title
 * @property {string} [notes]
 */

export const FocusMode = {
  Pomodoro: 'Pomodoro',
  Countdown: 'Countdown',
  Stopwatch: 'Stopwatch',
};
