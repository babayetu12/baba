import React, { useState, useEffect } from 'react';
import { Subject } from '../../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddGoal: (goalData: { text: string; subjectId: string }) => void;
}

export default function AddGoalModal({ isOpen, onClose, subjects, onAddGoal }: AddGoalModalProps) {
  const [text, setText] = useState('');
  const [subjectId, setSubjectId] = useState('');

  useEffect(() => {
    if (isOpen && subjects.length > 0) {
      // Reset form state when modal opens
      setText('');
      setSubjectId(subjects[0].id);
    }
  }, [isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !subjectId) return;

    onAddGoal({ text, subjectId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="goal-text" className="block text-gray-400 mb-2">Goal Description</label>
            <input
              type="text"
              id="goal-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label htmlFor="goal-subject" className="block text-gray-400 mb-2">Subject</label>
            <select
              id="goal-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            >
              {subjects.length > 0 ? (
                subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
              ) : (
                <option disabled>Please add a subject first</option>
              )}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 rounded-md transition" disabled={subjects.length === 0}>Add Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}