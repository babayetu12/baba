// This file is now components/modals/UpdateProgressModal.js
import React, { useState, useEffect } from 'react';

const ProgressInput = ({ label, value, onChange, total }) => (
    <div>
        <label className="block text-gray-400 mb-2">{label}</label>
        <div className="flex items-center space-x-2">
            <input type="range" min="0" max={total} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} className="w-20 bg-gray-700 text-white rounded-md p-2 border border-gray-600" />
        </div>
    </div>
);

export default function UpdateProgressModal({ isOpen, onClose, courseMaterial, onSave, colorHex }) {
    const [pagesRead, setPagesRead] = useState(0);
    const [pagesUnderlined, setPagesUnderlined] = useState(0);
    const [pagesSummarized, setPagesSummarized] = useState(0);
    
    useEffect(() => {
        if (courseMaterial) {
            setPagesRead(courseMaterial.pagesRead);
            setPagesUnderlined(courseMaterial.pagesUnderlined);
            setPagesSummarized(courseMaterial.pagesSummarized);
        }
    }, [courseMaterial, isOpen]);

    const handleSave = () => {
        onSave({
            pagesRead,
            pagesUnderlined,
            pagesSummarized,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Update Course Progress</h2>
                <div className="space-y-6">
                    <ProgressInput label={`Pages Read (out of ${courseMaterial.totalPages})`} value={pagesRead} onChange={setPagesRead} total={courseMaterial.totalPages} />
                    <ProgressInput label={`Pages Underlined (out of ${courseMaterial.totalPages})`} value={pagesUnderlined} onChange={setPagesUnderlined} total={courseMaterial.totalPages} />
                    <ProgressInput label={`Pages Summarized (out of ${courseMaterial.totalPages})`} value={pagesSummarized} onChange={setPagesSummarized} total={courseMaterial.totalPages} />
                </div>
                 <div className="flex justify-end space-x-2 mt-8">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Cancel</button>
                    <button type="button" onClick={handleSave} className="py-2 px-4 text-white font-semibold rounded-md transition" style={{ backgroundColor: colorHex }}>Save Progress</button>
                </div>
            </div>
        </div>
    );
}
