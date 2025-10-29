import React, { useState, useEffect, useMemo } from 'react';
import { StudyBlock, Subject, DailyGoal } from '../../types';

interface AddStudyBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddStudyBlock: (block: Omit<StudyBlock, 'id'>) => void;
  onUpdateStudyBlock: (block: StudyBlock) => void;
  onDeleteStudyBlock: (id: string) => void;
  existingBlock: StudyBlock | null;
  selectedDate: Date;
  dailyGoals: DailyGoal[];
}

export default function AddStudyBlockModal({
  isOpen,
  onClose,
  subjects,
  onAddStudyBlock,
  onUpdateStudyBlock,
  onDeleteStudyBlock,
  existingBlock,
  selectedDate,
  dailyGoals,
}: AddStudyBlockModalProps) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [goalId, setGoalId] = useState('');

  const availableGoals = useMemo(() => {
      if (!subjectId || !dailyGoals) return [];
      return dailyGoals.filter(g => g.subjectId === subjectId && !g.isCompleted);
  }, [dailyGoals, subjectId]);

  useEffect(() => {
    if (existingBlock) {
      setTitle(existingBlock.title);
      setSubjectId(existingBlock.subjectId);
      const start = new Date(existingBlock.startTime);
      setDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndTime(new Date(existingBlock.endTime).toTimeString().slice(0, 5));
      setGoalId(existingBlock.goalId || '');
    } else {
      setTitle('');
      setSubjectId(subjects.length > 0 ? subjects[0].id : '');
      setDate(selectedDate.toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setGoalId('');
    }
  }, [existingBlock, selectedDate, subjects, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectId || !date || !startTime || !endTime) return;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const finalStartTime = new Date(date);
    finalStartTime.setHours(startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const finalEndTime = new Date(date);
    finalEndTime.setHours(endHours, endMinutes, 0, 0);

    if (finalEndTime <= finalStartTime) {
        alert("End time must be after start time.");
        return;
    }

    const blockData = {
      subjectId,
      title,
      startTime: finalStartTime.toISOString(),
      endTime: finalEndTime.toISOString(),
      isCompleted: existingBlock?.isCompleted || false,
      goalId: goalId || undefined,
    };

    if (existingBlock) {
      onUpdateStudyBlock({ ...blockData, id: existingBlock.id });
    } else {
      onAddStudyBlock(blockData);
    }
    onClose();
  };

  const handleDelete = () => {
      if (existingBlock && window.confirm("Are you sure you want to delete this study block?")) {
          onDeleteStudyBlock(existingBlock.id);
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{existingBlock ? 'Edit Study Block' : 'Add Study Block'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="block-title" className="block text-gray-400 mb-2">Title</label>
            <input type="text" id="block-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="block-subject" className="block text-gray-400 mb-2">Subject</label>
            <select id="block-subject" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setGoalId(''); }} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" required>
              <option value="" disabled>Select a subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          
          {availableGoals.length > 0 && (
              <div className="mb-4">
                <label htmlFor="block-goal" className="block text-gray-400 mb-2">Assign to Goal (Optional)</label>
                <select id="block-goal" value={goalId} onChange={(e) => setGoalId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="">None</option>
                  {availableGoals.map(g => <option key={g.id} value={g.id}>{g.text}</option>)}
                </select>
              </div>
          )}

          <div className="mb-4">
            <label htmlFor="block-date" className="block text-gray-400 mb-2">Date</label>
            <input type="date" id="block-date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600" required />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="block-start-time" className="block text-gray-400 mb-2">Start Time</label>
              <input type="time" id="block-start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600" required />
            </div>
            <div>
              <label htmlFor="block-end-time" className="block text-gray-400 mb-2">End Time</label>
              <input type="time" id="block-end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600" required />
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div>
              {existingBlock && (
                  <button type="button" onClick={handleDelete} className="py-2 px-4 bg-red-700 hover:bg-red-800 rounded-md transition">Delete</button>
              )}
            </div>
            <div className="space-x-2">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Cancel</button>
              <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 rounded-md transition">{existingBlock ? 'Save Changes' : 'Add Block'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}