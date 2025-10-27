// This file is now components/modals/AddSubjectModal.js
import React, { useState, useEffect } from 'react';

const colors = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#10B981',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#D946EF', '#EC4899', '#F43F5E'
];

export default function AddSubjectModal({ isOpen, onClose, onAddSubject, onUpdateSubject, existingSubject }) {
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState(colors[0]);
  const [studyPoints, setStudyPoints] = useState('');
  const [hasCourseMaterial, setHasCourseMaterial] = useState(false);
  const [totalPages, setTotalPages] = useState('');
  const [totalChapters, setTotalChapters] = useState('');

  useEffect(() => {
    if (existingSubject) {
      setName(existingSubject.name);
      setColorHex(existingSubject.colorHex);
      setStudyPoints(existingSubject.studyPoints?.toString() || '');
      setHasCourseMaterial(!!existingSubject.courseMaterial);
      setTotalPages(existingSubject.courseMaterial?.totalPages.toString() || '');
      setTotalChapters(existingSubject.courseMaterial?.totalChapters.toString() || '');
    } else {
      // Reset form for new subject
      setName('');
      setColorHex(colors[Math.floor(Math.random() * colors.length)]);
      setStudyPoints('');
      setHasCourseMaterial(false);
      setTotalPages('');
      setTotalChapters('');
    }
  }, [existingSubject, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const subjectData = {
      name,
      colorHex,
      studyPoints: studyPoints ? parseInt(studyPoints, 10) : undefined,
      courseMaterial: hasCourseMaterial ? {
        totalPages: totalPages ? parseInt(totalPages, 10) : 0,
        totalChapters: totalChapters ? parseInt(totalChapters, 10) : 0,
        pagesRead: existingSubject?.courseMaterial?.pagesRead || 0,
        pagesUnderlined: existingSubject?.courseMaterial?.pagesUnderlined || 0,
        pagesSummarized: existingSubject?.courseMaterial?.pagesSummarized || 0,
      } : undefined,
    };

    if (existingSubject) {
      onUpdateSubject({
        ...existingSubject,
        ...subjectData,
      });
    } else {
      onAddSubject(subjectData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{existingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-400 mb-2">Subject Name</label>
            <input
              type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button
                  key={color} type="button" onClick={() => setColorHex(color)}
                  className={`w-8 h-8 rounded-full transition-transform duration-150 ${colorHex === color ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="studyPoints" className="block text-gray-400 mb-2">Study Points (Optional)</label>
            <input
              type="number" id="studyPoints" value={studyPoints} onChange={(e) => setStudyPoints(e.target.value)}
              placeholder="e.g., 6"
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-gray-400">
                <input
                    type="checkbox"
                    checked={hasCourseMaterial}
                    onChange={(e) => setHasCourseMaterial(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <span>Track course material (e.g., a book)</span>
            </label>
          </div>
          {hasCourseMaterial && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-700 rounded-lg">
                <div>
                    <label htmlFor="totalPages" className="block text-gray-400 mb-2 text-sm">Total Pages</label>
                    <input type="number" id="totalPages" value={totalPages} onChange={(e) => setTotalPages(e.target.value)} className="w-full bg-gray-600 text-white rounded-md p-2 border border-gray-500" />
                </div>
                 <div>
                    <label htmlFor="totalChapters" className="block text-gray-400 mb-2 text-sm">Total Chapters</label>
                    <input type="number" id="totalChapters" value={totalChapters} onChange={(e) => setTotalChapters(e.target.value)} className="w-full bg-gray-600 text-white rounded-md p-2 border border-gray-500" />
                </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 rounded-md transition">{existingSubject ? 'Save Changes' : 'Add Subject'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
