// This file is now components/SubjectsView.js
import React, { useState } from 'react';
import { formatTotalTime } from '../utils/helpers.js';
import { PlusIcon, GearIcon } from './ui/Icons.js';
import AddSubjectModal from './modals/AddSubjectModal.js';
import DeveloperMenuModal from './modals/DeveloperMenuModal.js';

export default function SubjectsView({
  subjects,
  onSelectSubject,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  setSubjects
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const handleAddClick = () => {
    setEditingSubject(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (subject, e) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setIsAddModalOpen(true);
  };
  
  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    onDeleteSubject(id);
  };

  return (
    <div className="animate-fadeIn">
      {isAddModalOpen && (
        <AddSubjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddSubject={onAddSubject}
          onUpdateSubject={onUpdateSubject}
          existingSubject={editingSubject}
        />
      )}
      {isDevMenuOpen && (
        <DeveloperMenuModal
            isOpen={isDevMenuOpen}
            onClose={() => setIsDevMenuOpen(false)}
            subjects={subjects}
            setSubjects={setSubjects}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Subjects</h1>
        <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDevMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition"
              aria-label="Developer Menu"
            >
              <GearIcon />
            </button>
            <button
              onClick={handleAddClick}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold p-2 rounded-full shadow-lg transition"
            >
              <PlusIcon />
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {subjects.length > 0 ? (
          subjects.map(subject => {
            const totalTime = (subject.sessions || []).reduce((sum, s) => sum + s.duration, 0);
            return (
              <div
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                style={{ borderLeft: `5px solid ${subject.colorHex}` }}
              >
                <div className="flex-1 mr-4">
                  <h3 className="font-bold text-lg text-white">{subject.name}</h3>
                  <div className="text-sm text-gray-400 flex space-x-4">
                    <span>
                      Total focus: {formatTotalTime(totalTime)}
                    </span>
                    {subject.studyPoints && (
                        <span>
                            Study Points: <strong>{subject.studyPoints}</strong>
                        </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => handleEditClick(subject, e)}
                    className="text-gray-400 hover:text-cyan-400 text-sm font-semibold py-1 px-3 rounded-md transition"
                    aria-label={`Edit ${subject.name}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => handleDeleteClick(subject.id, e)}
                    className="text-gray-400 hover:text-red-400 text-sm font-semibold py-1 px-3 rounded-md transition"
                    aria-label={`Delete ${subject.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No subjects found. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
