// FIX: Component implementation was missing. Added full component from `components/PlannerView.tsx` and adjusted import paths to be relative to the root directory.
import React, { useState, useMemo } from 'react';
import { usePersistence } from './hooks/usePersistence';
import { LOCAL_STORAGE_KEY_PLANNER } from './constants';
import AddStudyBlockModal from './components/modals/AddStudyBlockModal';
import AddExamModal from './components/modals/AddExamModal';
import { generateId, hexToRgba, getWeekDays, formatWeekRange } from './utils/helpers';
import { StudyBlock, Exam, Subject } from './types';

const HOURS_IN_DAY = 24;
const HOUR_HEIGHT = 60; // pixels

const TimeGutter = () => (
    <div className="w-14 pr-2 text-right flex-shrink-0">
        {/* Empty space for header */}
        <div className="h-16"></div> 
        {Array.from({ length: HOURS_IN_DAY }).map((_, hour) => (
            <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="relative -top-3">
                <span className="text-xs text-gray-400">
                    {hour > 0 ? `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 || hour === 24 ? 'AM' : 'PM'}` : ''}
                </span>
            </div>
        ))}
    </div>
);

const DayView = ({ date, blocks, exams, getSubject, openAddBlockModal, openEditBlockModal, openEditExamModal }: { date: Date, blocks: StudyBlock[], exams: Exam[], getSubject: (id: string) => Subject | undefined, openAddBlockModal: (date: Date) => void, openEditBlockModal: (block: StudyBlock) => void, openEditExamModal: (exam: Exam) => void }) => {
    const isToday = date.toDateString() === new Date().toDateString();

    return (
        <div>
            <div className="text-center py-3 sticky top-0 bg-gray-800 z-30">
                <p className="text-xs uppercase text-gray-400">{date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                <p className={`text-2xl font-bold mt-1 ${isToday ? 'text-cyan-400' : ''}`}>{date.getDate()}</p>
            </div>
            <div className="relative" style={{ height: `${HOURS_IN_DAY * HOUR_HEIGHT}px`}} onClick={() => openAddBlockModal(date)}>
                 {/* All-day exams */}
                <div className="absolute top-0 left-0 right-0 z-10 p-1 space-y-1">
                    {exams.map(exam => {
                        const subject = getSubject(exam.subjectId);
                        return (
                            <div key={exam.id} onClick={(e) => { e.stopPropagation(); openEditExamModal(exam); }} className="p-1.5 rounded-md text-xs font-semibold text-white truncate cursor-pointer" style={{ backgroundColor: subject?.colorHex || '#4B5563' }}>
                                &#128276; {exam.title}
                            </div>
                        );
                    })}
                </div>

                {/* Timed study blocks */}
                {blocks.map(block => {
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
                            style={{ top: `${top}px`, height: `${Math.max(height, 20)}px`, backgroundColor: hexToRgba(subject?.colorHex || '#4B5563', 0.8), borderLeft: `3px solid ${subject?.colorHex || '#4B5563'}`}}
                        >
                           <p className="font-bold">{block.title}</p>
                           <p className="opacity-80">{subject?.name}</p>
                           <p className="opacity-70 text-xxs">{startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default function PlannerView({ subjects }: { subjects: Subject[] }) {
    const [studyBlocks, setStudyBlocks] = usePersistence<StudyBlock[]>(`${LOCAL_STORAGE_KEY_PLANNER}-blocks`, []);
    const [exams, setExams] = usePersistence<Exam[]>(`${LOCAL_STORAGE_KEY_PLANNER}-exams`, []);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
    const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [modalDate, setModalDate] = useState(new Date());

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const currentDayBlocks = useMemo(() => studyBlocks.filter(b => new Date(b.startTime).toDateString() === currentDate.toDateString()), [studyBlocks, currentDate]);
    const currentDayExams = useMemo(() => exams.filter(e => new Date(e.date).toDateString() === currentDate.toDateString()), [exams, currentDate]);

    const handleAddStudyBlock = (block: Omit<StudyBlock, 'id'>) => setStudyBlocks(prev => [...prev, { ...block, id: generateId() }]);
    const handleUpdateStudyBlock = (block: StudyBlock) => setStudyBlocks(prev => prev.map(b => b.id === block.id ? block : b));
    const handleDeleteStudyBlock = (id: string) => setStudyBlocks(prev => prev.filter(b => b.id !== id));
    
    const handleAddExam = (exam: Omit<Exam, 'id'>) => setExams(prev => [...prev, { ...exam, id: generateId() }]);
    const handleUpdateExam = (exam: Exam) => setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
    const handleDeleteExam = (id: string) => setExams(prev => prev.filter(e => e.id !== id));

    const getSubject = (id: string) => subjects.find(s => s.id === id);

    const openAddBlockModal = (date: Date) => {
      setModalDate(date);
      setEditingBlock(null);
      setIsAddBlockModalOpen(true);
    };
    
    const openEditBlockModal = (block: StudyBlock) => {
      setModalDate(new Date(block.startTime));
      setEditingBlock(block);
      setIsAddBlockModalOpen(true);
    };
    
    const openAddExamModal = () => {
        setEditingExam(null);
        setIsAddExamModalOpen(true);
    };
    
    const openEditExamModal = (exam: Exam) => {
        setEditingExam(exam);
        setIsAddExamModalOpen(true);
    };

    const changeDate = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            const increment = viewMode === 'week' ? offset * 7 : offset;
            newDate.setDate(newDate.getDate() + increment);
            return newDate;
        });
    };
    
    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

    const viewTitle = useMemo(() => {
        if (viewMode === 'week') {
            return formatWeekRange(weekDays[0]);
        }
        return currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }, [viewMode, currentDate, weekDays]);

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl font-bold mb-4">My Planner</h1>
            
            {/* FIX: Added missing 'dailyGoals' prop. Since this component doesn't manage goals, an empty array is passed to satisfy the type requirement. */}
            {isAddBlockModalOpen && <AddStudyBlockModal isOpen={isAddBlockModalOpen} onClose={() => setIsAddBlockModalOpen(false)} subjects={subjects} onAddStudyBlock={handleAddStudyBlock} onUpdateStudyBlock={handleUpdateStudyBlock} onDeleteStudyBlock={handleDeleteStudyBlock} existingBlock={editingBlock} selectedDate={modalDate} dailyGoals={[]} />}
            {isAddExamModalOpen && <AddExamModal isOpen={isAddExamModalOpen} onClose={() => setIsAddExamModalOpen(false)} subjects={subjects} onAddExam={handleAddExam} onUpdateExam={handleUpdateExam} onDeleteExam={handleDeleteExam} existingExam={editingExam} />}

            {/* Header and Navigation */}
            <div className="flex justify-between items-center mb-4 bg-gray-800 p-3 rounded-lg sticky top-0 z-40">
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeDate(-1)} className="p-2 rounded-md hover:bg-gray-700 transition">&larr;</button>
                    <button onClick={() => changeDate(1)} className="p-2 rounded-md hover:bg-gray-700 transition">&rarr;</button>
                     <button onClick={() => setCurrentDate(new Date())} className="py-2 px-4 text-sm font-semibold rounded-md hover:bg-gray-700 border border-gray-600 transition">Today</button>
                </div>
                <h2 className="text-lg font-semibold text-center hidden md:block">{viewTitle}</h2>
                <div className="flex items-center space-x-2">
                    <div className="p-1 bg-gray-700 rounded-lg flex items-center">
                        <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'day' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>Day</button>
                        <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'week' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>Week</button>
                    </div>
                    <button onClick={() => openAddBlockModal(new Date())} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm">
                       Add Block
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-gray-800 rounded-lg flex">
                <TimeGutter />
                <div className="flex-grow">
                    {viewMode === 'week' ? (
                        <div className="grid grid-cols-7">
                            {weekDays.map((day) => {
                                const dayExams = exams.filter(e => new Date(e.date).toDateString() === day.toDateString());
                                const dayBlocks = studyBlocks.filter(b => new Date(b.startTime).toDateString() === day.toDateString());
                                // FIX: Wrap DayView in a div and move the key prop to the wrapper to fix component prop error.
                                return <div key={day.toISOString()}><DayView date={day} blocks={dayBlocks} exams={dayExams} getSubject={getSubject} openAddBlockModal={openAddBlockModal} openEditBlockModal={openEditBlockModal} openEditExamModal={openEditExamModal} /></div>;
                            })}
                        </div>
                    ) : (
                         <DayView date={currentDate} blocks={currentDayBlocks} exams={currentDayExams} getSubject={getSubject} openAddBlockModal={openAddBlockModal} openEditBlockModal={openEditBlockModal} openEditExamModal={openEditExamModal} />
                    )}
                </div>
            </div>
        </div>
    );
}