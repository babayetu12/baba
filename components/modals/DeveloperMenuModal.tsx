// This file is now components/modals/DeveloperMenuModal.js
import React from 'react';
import { generateId } from '../../utils/helpers.js';
import { LOCAL_STORAGE_KEY_SUBJECTS, LOCAL_STORAGE_KEY_PLANNER } from '../../constants.js';

export default function DeveloperMenuModal({ isOpen, onClose, subjects, setSubjects }) {

  const addDummyData = () => {
    const dummySubjects = [
      { id: 'math101', name: 'Calculus I', colorHex: '#EF4444', sessions: Array.from({length: 15}).map((_, i) => ({ id: generateId(), date: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(), duration: Math.random() * 3600 + 1800, breakDuration: 300 })), todos: [{id: generateId(), subjectId: 'math101', title: 'Finish Chapter 3 problems', isCompleted: false, dueDate: new Date().toISOString(), hasSpecificTime: false}] },
      { id: 'cs202', name: 'Data Structures', colorHex: '#3B82F6', sessions: Array.from({length: 25}).map((_, i) => ({ id: generateId(), date: new Date(Date.now() - i * 48 * 3600 * 1000).toISOString(), duration: Math.random() * 4500 + 2000, breakDuration: 600 })), todos: [] },
      { id: 'phy301', name: 'Modern Physics', colorHex: '#F59E0B', sessions: [], todos: [] },
    ];
    setSubjects(dummySubjects);
    onClose();
  };

  const clearAllData = () => {
    if (window.confirm("ARE YOU SURE you want to delete ALL application data? This cannot be undone.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SUBJECTS);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PLANNER}-blocks`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PLANNER}-exams`);
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Developer Menu</h2>
        <div className="space-y-4">
          <button onClick={addDummyData} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md transition">Add Dummy Data</button>
          <button onClick={clearAllData} className="w-full py-2 px-4 bg-red-700 hover:bg-red-800 rounded-md transition">Clear All Data</button>
        </div>
        <div className="flex justify-end mt-6">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Close</button>
        </div>
      </div>
    </div>
  );
}
