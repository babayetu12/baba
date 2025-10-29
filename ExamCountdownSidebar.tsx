// FIX: Added component implementation and fixed import paths to resolve module errors.
import React from 'react';
import { Exam, Subject } from './types';

interface ExamCountdownSidebarProps {
  exams: Exam[];
  subjects: Subject[];
}

export default function ExamCountdownSidebar({ exams, subjects }: ExamCountdownSidebarProps) {
  const upcomingExams = exams
    .map(exam => {
      const examDate = new Date(exam.date);
      examDate.setHours(23, 59, 59, 999); // Compare with end of day
      const today = new Date();
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return { ...exam, diffDays, subject: subjects.find(s => s.id === exam.subjectId) };
    })
    .filter(exam => exam.diffDays >= 0)
    .sort((a, b) => a.diffDays - b.diffDays);

  const getCountdownText = (days: number) => {
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow!';
    return `${days} days`;
  }

  return (
    <aside className="hidden lg:block w-64 p-4 sticky top-8">
      <h2 className="text-lg font-bold text-gray-400 mb-4">Upcoming Exams</h2>
      {upcomingExams.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4 bg-gray-800 rounded-lg">No upcoming exams.</div>
      ) : (
        <div className="space-y-3">
          {upcomingExams.map(exam => (
            <div key={exam.id} className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                   <p className="font-bold truncate" style={{ color: exam.subject?.colorHex || 'white' }}>{exam.title}</p>
                   <p className="text-xs text-gray-400 truncate">{exam.subject?.name}</p>
                </div>
                <div className={`text-sm font-bold ml-2 px-2 py-1 rounded-md ${exam.diffDays <= 7 ? 'text-red-300 bg-red-500 bg-opacity-20' : 'text-cyan-300'}`}>
                  {getCountdownText(exam.diffDays)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
