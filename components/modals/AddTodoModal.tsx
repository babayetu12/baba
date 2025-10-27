// This file is now components/modals/AddTodoModal.js
import React, { useState, useEffect } from 'react';
import { generateId, requestNotificationPermission, scheduleNotification, cancelNotification } from '../../utils/helpers.js';

export default function AddTodoModal({ isOpen, onClose, subject, subjects, onUpdateSubject, existingTodo }) {
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [hasSpecificTime, setHasSpecificTime] = useState(false);

  useEffect(() => {
    if (existingTodo) {
      setTitle(existingTodo.title);
      setSelectedSubjectId(existingTodo.subjectId);
      const date = new Date(existingTodo.dueDate);
      setDueDate(date.toISOString().split('T')[0]);
      if (existingTodo.hasSpecificTime) {
        setHasSpecificTime(true);
        setDueTime(date.toTimeString().slice(0, 5));
      }
    } else if (subject) {
      setSelectedSubjectId(subject.id);
    } else if (subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [existingTodo, subject, subjects]);

  useEffect(() => {
      requestNotificationPermission();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !selectedSubjectId) return;

    const targetSubject = subjects.find(s => s.id === selectedSubjectId);
    if (!targetSubject) return;

    let finalDueDate = new Date(dueDate);
    if (hasSpecificTime && dueTime) {
        const [hours, minutes] = dueTime.split(':').map(Number);
        finalDueDate.setHours(hours, minutes, 0, 0);
    } else {
        finalDueDate.setHours(23, 59, 59, 999); // End of day
    }

    const newTodo = {
      id: existingTodo?.id || generateId(),
      subjectId: selectedSubjectId,
      title,
      isCompleted: existingTodo?.isCompleted || false,
      dueDate: finalDueDate.toISOString(),
      hasSpecificTime: hasSpecificTime,
    };
    
    // Cancel any previous notification for this todo before scheduling a new one
    if (existingTodo?.id) {
        cancelNotification(existingTodo.id);
    }
    if (hasSpecificTime) {
        scheduleNotification(newTodo.id, `Reminder: ${newTodo.title}`, finalDueDate);
    }


    const updatedTodos = existingTodo
      ? targetSubject.todos.map(t => t.id === existingTodo.id ? newTodo : t)
      : [...(targetSubject.todos || []), newTodo];

    onUpdateSubject({ ...targetSubject, todos: updatedTodos });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{existingTodo ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-400 mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          {!subject && (
            <div className="mb-4">
              <label htmlFor="subject" className="block text-gray-400 mb-2">Subject</label>
              <select
                id="subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-gray-400 mb-2">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
           <div className="mb-4">
                <label className="flex items-center space-x-2 text-gray-400">
                    <input
                        type="checkbox"
                        checked={hasSpecificTime}
                        onChange={(e) => setHasSpecificTime(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <span>Add specific time (for reminders)</span>
                </label>
            </div>
          {hasSpecificTime && (
            <div className="mb-6">
                <label htmlFor="dueTime" className="block text-gray-400 mb-2">Time</label>
                <input
                    type="time"
                    id="dueTime"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required={hasSpecificTime}
                />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 rounded-md transition">{existingTodo ? 'Save Changes' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
