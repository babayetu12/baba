// This file is now components/SubjectDetailView.js
import React, { useState } from 'react';
import { getTotalFocusTime, formatTotalTime, hexToRgba } from '../utils/helpers.js';
import { PlusIcon } from './ui/Icons.js';
import AddTodoModal from './modals/AddTodoModal.js';
import FocusSettingsModal from './modals/FocusSettingsModal.js';
import UpdateProgressModal from './modals/UpdateProgressModal.js';

const ProgressBar = ({ label, value, total, color }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <span className="text-sm text-gray-400">{value} / {total}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="h-2.5 rounded-full" style={{ width: `${Math.min(100, (value / total) * 100)}%`, backgroundColor: color }}></div>
        </div>
    </div>
);


export default function SubjectDetailView({ subject, onBack, onUpdateSubject, subjects, onStartSession }) {
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isFocusSettingsOpen, setIsFocusSettingsOpen] = useState(false);
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);
  
  const totalTime = getTotalFocusTime(subject.sessions || []);

  const toggleTodoCompletion = (todoId) => {
    const updatedTodos = (subject.todos || []).map(todo =>
      todo.id === todoId ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    onUpdateSubject({ ...subject, todos: updatedTodos });
  };
  
  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setIsAddTodoModalOpen(true);
  };
  
  const closeTodoModal = () => {
    setIsAddTodoModalOpen(false);
    setEditingTodo(null);
  };
  
  const handleStart = (mode, duration) => {
    setIsFocusSettingsOpen(false);
    onStartSession(subject.id, mode, duration);
  };

  const handleProgressUpdate = (newProgress) => {
    if (subject.courseMaterial) {
        const updatedCourseMaterial = { ...subject.courseMaterial, ...newProgress };
        onUpdateSubject({ ...subject, courseMaterial: updatedCourseMaterial });
    }
    setIsUpdateProgressOpen(false);
  };

  return (
    <div className="animate-fadeIn">
      {isAddTodoModalOpen && (
        <AddTodoModal
          isOpen={isAddTodoModalOpen}
          onClose={closeTodoModal}
          subject={subject}
          onUpdateSubject={onUpdateSubject}
          existingTodo={editingTodo}
          subjects={subjects}
        />
      )}
      
      {isFocusSettingsOpen && (
        <FocusSettingsModal
          isOpen={isFocusSettingsOpen}
          onClose={() => setIsFocusSettingsOpen(false)}
          onStart={handleStart}
        />
      )}

      {isUpdateProgressOpen && subject.courseMaterial && (
        <UpdateProgressModal
            isOpen={isUpdateProgressOpen}
            onClose={() => setIsUpdateProgressOpen(false)}
            courseMaterial={subject.courseMaterial}
            onSave={handleProgressUpdate}
            colorHex={subject.colorHex}
        />
      )}

      <div className="mb-6 flex items-center">
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 mr-4">&larr; Back</button>
        <h1 className="text-3xl font-bold" style={{ color: subject.colorHex }}>{subject.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
            <p className="text-gray-400 text-sm">TOTAL FOCUS TIME</p>
            <p className="text-4xl font-bold text-white">{formatTotalTime(totalTime)}</p>
        </div>
        <button 
          onClick={() => setIsFocusSettingsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg p-6 rounded-lg transition-transform duration-200 hover:scale-105"
        >
          Start Focus Session
        </button>
      </div>
      
      {subject.courseMaterial && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold">Course Progress</h2>
                 <button onClick={() => setIsUpdateProgressOpen(true)} className="text-sm text-cyan-400 hover:underline">Update Progress</button>
            </div>
            <div className="space-y-4">
                <ProgressBar label="Read" value={subject.courseMaterial.pagesRead} total={subject.courseMaterial.totalPages} color={subject.colorHex} />
                <ProgressBar label="Underlined" value={subject.courseMaterial.pagesUnderlined} total={subject.courseMaterial.totalPages} color={subject.colorHex} />
                <ProgressBar label="Summarized" value={subject.courseMaterial.pagesSummarized} total={subject.courseMaterial.totalPages} color={subject.colorHex} />
            </div>
        </div>
      )}

      {subject.studyPoints && (
         <div className="bg-gray-800 p-4 rounded-lg mb-8 text-center">
            <p className="text-gray-300">
                <strong>{subject.studyPoints}</strong> Study Points · Estimated Workload: <strong>{subject.studyPoints * 27} hours</strong>
            </p>
         </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <button onClick={() => setIsAddTodoModalOpen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold p-2 rounded-full shadow-lg transition">
                <PlusIcon />
            </button>
        </div>
        <div className="space-y-3">
            {(subject.todos || []).length > 0 ? (subject.todos || []).map(todo => (
              <div key={todo.id} onClick={() => handleEditTodo(todo)} className="p-4 rounded-lg flex items-center transition-all duration-300 cursor-pointer hover:shadow-xl" style={{ backgroundColor: hexToRgba(subject.colorHex, 0.15) }}>
                  <div className="flex-shrink-0 mr-4">
                      <button onClick={(e) => { e.stopPropagation(); toggleTodoCompletion(todo.id); }} className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center`} style={{ borderColor: subject.colorHex, backgroundColor: todo.isCompleted ? subject.colorHex : 'transparent' }}>
                          {todo.isCompleted && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </button>
                  </div>
                  <div className="flex-grow">
                      <p className={`font-medium ${todo.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>{todo.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{new Date(todo.dueDate).toLocaleDateString()}</p>
                  </div>
              </div>
            )) : <p className="text-gray-500 text-center py-4">No tasks for this subject.</p>}
        </div>
      </div>
    </div>
  );
}
