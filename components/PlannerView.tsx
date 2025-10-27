// This file is now components/PlannerView.js
import React, { useState, useMemo } from 'react';
import { usePersistence } from '../hooks/usePersistence.js';
import { LOCAL_STORAGE_KEY_PLANNER } from '../constants.js';
import AddStudyBlockModal from './modals/AddStudyBlockModal.js';
import AddExamModal from './modals/AddExamModal.js';
import { hexToRgba, getWeekDays, formatWeekRange } from '../utils/helpers.js';
import { PlusIcon } from './ui/Icons.js';

const HOURS_IN_DAY = 24;
const HOUR_HEIGHT = 60; // pixels

export default function PlannerView({ subjects }) {
    const [studyBlocks, setStudyBlocks] = usePersistence(`${LOCAL_STORAGE_KEY_PLANNER}-blocks`, []);
    const [exams, setExams] = usePersistence(`${LOCAL_STORAGE_KEY_PLANNER}-exams`, []);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
    const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [editingExam, setEditingExam] = useState(null);
    const [modalDate, setModalDate] = useState(new Date());

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    const handleAddStudyBlock = (block) => setStudyBlocks(prev => [...prev, block]);
    const handleUpdateStudyBlock = (block) => setStudyBlocks(prev => prev.map(b => b.id === block.id ? block : b));
    const handleDeleteStudyBlock = (id) => setStudyBlocks(prev => prev.filter(b => b.id !== id));
    
    const handleAddExam = (exam) => setExams(prev => [...prev, exam]);
    const handleUpdateExam = (exam) => setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
    const handleDeleteExam = (id) => setExams(prev => prev.filter(e => e.id !== id));

    const getSubject = (id) => subjects.find(s => s.id === id);

    const openAddBlockModal = (date) => {
      setModalDate(date);
      setEditingBlock(null);
      setIsAddBlockModalOpen(true);
    };
    
    const openEditBlockModal = (block) => {
      setModalDate(new Date(block.startTime));
      setEditingBlock(block);
      setIsAddBlockModalOpen(true);
    };
    
    const openAddExamModal = () => {
        setEditingExam(null);
        setIsAddExamModalOpen(true);
    };
    
    const openEditExamModal = (exam) => {
        setEditingExam(exam);
        setIsAddExamModalOpen(true);
    };

    const isToday = (date) => date.toDateString() === new Date().toDateString();

    const changeWeek = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + offset * 7);
            return newDate;
        });
    };

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl font-bold mb-4">My Planner</h1>
            
            {isAddBlockModalOpen && <AddStudyBlockModal isOpen={isAddBlockModalOpen} onClose={() => setIsAddBlockModalOpen(false)} subjects={subjects} onAddStudyBlock={handleAddStudyBlock} onUpdateStudyBlock={handleUpdateStudyBlock} onDeleteStudyBlock={handleDeleteStudyBlock} existingBlock={editingBlock} selectedDate={modalDate} />}
            {isAddExamModalOpen && <AddExamModal isOpen={isAddExamModalOpen} onClose={() => setIsAddExamModalOpen(false)} subjects={subjects} onAddExam={handleAddExam} onUpdateExam={handleUpdateExam} onDeleteExam={handleDeleteExam} existingExam={editingExam} />}

            {/* Header and Navigation */}
            <div className="flex justify-between items-center mb-4 bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeWeek(-1)} className="p-2 rounded-md hover:bg-gray-700 transition">&larr;</button>
                    <button onClick={() => changeWeek(1)} className="p-2 rounded-md hover:bg-gray-700 transition">&rarr;</button>
                     <button onClick={() => setCurrentDate(new Date())} className="py-2 px-4 text-sm font-semibold rounded-md hover:bg-gray-700 border border-gray-600 transition">Today</button>
                </div>
                <h2 className="text-xl font-semibold">{formatWeekRange(weekDays[0])}</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={openAddExamModal} className="text-sm flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition">
                        <span>Add Exam</span>
                    </button>
                    <button onClick={() => openAddBlockModal(new Date())} className="text-sm flex items-center space-x-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-lg transition">
                       <span>Add Block</span>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-700">
                    {weekDays.map(day => (
                        <div key={day.toString()} className="text-center py-3 border-r border-gray-700 last:border-r-0">
                            <p className="text-xs uppercase text-gray-400">{day.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                            <p className={`text-2xl font-bold mt-1 ${isToday(day) ? 'text-cyan-400' : ''}`}>{day.getDate()}</p>
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 relative" style={{ height: `${HOURS_IN_DAY * HOUR_HEIGHT}px`}}>
                    {/* Hour Lines */}
                    {Array.from({ length: HOURS_IN_DAY -1 }).map((_, i) => (
                        <div key={i} className="col-span-7 border-b border-gray-700 absolute w-full" style={{ top: `${(i + 1) * HOUR_HEIGHT}px`, zIndex: 1 }}></div>
                    ))}
                    
                    {weekDays.map((day, dayIndex) => {
                        const dayExams = exams.filter(e => new Date(e.date).toDateString() === day.toDateString());
                        const dayBlocks = studyBlocks.filter(b => new Date(b.startTime).toDateString() === day.toDateString());

                        return (
                            <div key={day.toISOString()} className="border-r border-gray-700 last:border-r-0 relative" onClick={() => openAddBlockModal(day)}>
                                {/* All-day exams */}
                                <div className="absolute top-0 left-0 right-0 z-10 p-1 space-y-1">
                                    {dayExams.map(exam => {
                                        const subject = getSubject(exam.subjectId);
                                        return (
                                            <div key={exam.id} onClick={(e) => { e.stopPropagation(); openEditExamModal(exam); }} className="p-1.5 rounded-md text-xs font-semibold text-white truncate cursor-pointer" style={{ backgroundColor: subject?.colorHex || '#4B5563' }}>
                                                &#128276; {exam.title}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Timed study blocks */}
                                {dayBlocks.map(block => {
                                    const startTime = new Date(block.startTime);
                                    const endTime = new Date(block.endTime);
                                    const top = (startTime.getHours() + startTime.getMinutes() / 60) * HOUR_HEIGHT;
                                    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                                    const height = durationHours * HOUR_HEIGHT;
                                    const subject = getSubject(block.subjectId);
                                    
                                    return (
                                        <div 
                                            key={block.id} 
                                            onClick={(e) => { e.stopPropagation(); openEditBlockModal(block); }}
                                            className="absolute left-1 right-1 p-2 rounded-lg text-white text-xs z-20 cursor-pointer overflow-hidden" 
                                            style={{ top: `${top}px`, height: `${height}px`, backgroundColor: hexToRgba(subject?.colorHex || '#4B5563', 0.8), borderLeft: `3px solid ${subject?.colorHex || '#4B5563'}`}}
                                        >
                                           <p className="font-bold">{block.title}</p>
                                           <p className="opacity-80">{subject?.name}</p>
                                           <p className="opacity-70 text-xxs">{startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
