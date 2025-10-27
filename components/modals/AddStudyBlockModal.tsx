// This file is now components/modals/AddStudyBlockModal.js
import React, { useState, useEffect } from 'react';
import { generateId } from '../../utils/helpers.js';

export default function AddStudyBlockModal({ isOpen, onClose, subjects, onAddStudyBlock, onUpdateStudyBlock, onDeleteStudyBlock, existingBlock, selectedDate }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (existingBlock) {
      setTitle(existingBlock.title);
      setSubjectId(existingBlock.subjectId);
      setStartTime(new Date(existingBlock.startTime).toTimeString().slice(0, 5));
      setEndTime(new Date(existingBlock.endTime).toTimeString().slice(0, 5));
    } else if (subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }, [existingBlock, subjects, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !subjectId || !startTime || !endTime) return;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDate = new Date(selectedDate);
    startDate.setHours(startHour, startMinute, 0, 0);

    const [endHour, endMinute] = endTime.split(':').map(Number);
    const endDate = new Date(selectedDate);
    endDate.setHours(endHour, endMinute, 0, 0);

    const blockData = {
      id: existingBlock?.id || generateId(),
      subjectId,
      title,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      isCompleted: existingBlock?.isCompleted || false,
    };

    if (existingBlock) {
      onUpdateStudyBlock(blockData);
    } else {
      onAddStudyBlock(blockData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingBlock) {
        onDeleteStudyBlock(existingBlock.id);
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{existingBlock ? 'Edit Block' : 'Add Study Block'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="block-title" className="block text-gray-400 mb-2">Title</label>
            <input type="text" id="block-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" required />
          </div>
          <div className="mb-4">
            <label htmlFor="block-subject" className="block text-gray-400 mb-2">Subject</label>
            <select id="block-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" required>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="block-start-time" className="block text-gray-400 mb-2">Start Time</label>
                <input type="time" id="block-start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" required />
              </div>
              <div>
                <label htmlFor="block-end-time" className="block text-gray-400 mb-2">End Time</label>
                <input type="time" id="block-end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" required />
              </div>
          </div>
          <div className="flex justify-end space-x-2">
            {existingBlock && (
                <button type="button" onClick={handleDelete} className="py-2 px-4 bg-red-700 hover:bg-red-800 rounded-md transition mr-auto">Delete</button>
            )}
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 rounded-md transition">{existingBlock ? 'Save Changes' : 'Add Block'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
