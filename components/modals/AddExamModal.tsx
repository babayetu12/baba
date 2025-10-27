// This file is now components/modals/AddExamModal.js
import React, { useState, useEffect } from 'react';
import { generateId } from '../../utils/helpers.js';

export default function AddExamModal({ isOpen, onClose, subjects, onAddExam, onUpdateExam, onDeleteExam, existingExam }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingExam) {
      setTitle(existingExam.title);
      setSubjectId(existingExam.subjectId);
      setDate(new Date(existingExam.date).toISOString().split('T')[0]);
      setNotes(existingExam.notes || '');
    } else if (subjects.length > 0) {
      setSubjectId(subjects[0].id);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [existingExam, subjects, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !subjectId || !date) return;

    const examData = {
      id: existingExam?.id || generateId(),
      subjectId,
      title,
      date,
      notes,
    };

    if (existingExam) {
      onUpdateExam(examData);
    } else {
      onAddExam(examData);
    }
    onClose();
  };
  
  const handleDelete = () => {
      if (existingExam) {
          onDeleteExam(existingExam.id);
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{existingExam ? 'Edit Exam' : 'Add New Exam'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="exam-title" className="block text-gray-400 mb-2">Exam Title</label>
            <input type="text" id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" required />
          </div>
          <div className="mb-4">
            <label htmlFor="exam-subject" className="block text-gray-400 mb-2">Subject</label>
            <select id="exam-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" required>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="exam-date" className="block text-gray-400 mb-2">Date</label>
            <input type="date" id="exam-date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" required />
          </div>
          <div className="mb-4">
            <label htmlFor="exam-notes" className="block text-gray-400 mb-2">Notes (Optional)</label>
            <textarea id="exam-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2" rows={3}></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            {existingExam && (
                <button type="button" onClick={handleDelete} className="py-2 px-4 bg-red-700 hover:bg-red-800 rounded-md transition mr-auto">Delete</button>
            )}
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition">{existingExam ? 'Save Changes' : 'Add Exam'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
