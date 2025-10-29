import React, { useState, useEffect, useMemo } from 'react';
import { generateInspirationalQuote } from '../services/geminiService';
import { hexToRgba, generateId, calculateDailyFocusStats } from '../utils/helpers';
import AddTodoModal from './modals/AddTodoModal';
import AddStudyBlockModal from './modals/AddStudyBlockModal';
import AddGoalModal from './modals/AddGoalModal';
import FocusSettingsModal from './modals/FocusSettingsModal';
import DailyFocusTracker from './DailyFocusTracker';
import { Subject, TodoItem, StudyBlock, DailyGoal, FocusMode } from '../types';

type PlanItem = {
    type: 'task';
    sortTime: Date;
    data: TodoItem & { subject: Subject };
} | {
    type: 'block';
    sortTime: Date;
    data: StudyBlock & { subject: Subject };
};

interface PlanItemCardProps {
    item: PlanItem;
    onUpdateSubject: (subject: Subject) => void;
    onEdit: (item: PlanItem) => void;
}

const PlanItemCard: React.FC<PlanItemCardProps> = ({ item, onUpdateSubject, onEdit }) => {
    const { type, data } = item;
    const subject = data.subject;
    
    const toggleTodoCompletion = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (type === 'task') {
            const updatedTodo = { ...data, isCompleted: !data.isCompleted };
            const { subject, ...todoToSave } = updatedTodo;
            const updatedSubject = {
                ...subject,
                todos: subject.todos.map(t => t.id === data.id ? todoToSave : t)
            };
            onUpdateSubject(updatedSubject);
        }
    };

    const isTaskCompleted = type === 'task' && data.isCompleted;

    return (
        <div
            onClick={() => onEdit(item)}
            className={`p-4 rounded-lg flex items-start space-x-4 transition-all duration-300 cursor-pointer hover:shadow-xl ${isTaskCompleted ? 'opacity-50' : ''}`}
            style={{ backgroundColor: hexToRgba(subject.colorHex, 0.2), borderLeft: `4px solid ${subject.colorHex}`}}
        >
            {type === 'task' && (
                <button
                    onClick={toggleTodoCompletion}
                    className="w-6 h-6 mt-1 rounded-full border-2 flex-shrink-0 transition-all duration-200 flex items-center justify-center"
                    style={{
                        borderColor: subject.colorHex,
                        backgroundColor: isTaskCompleted ? subject.colorHex : 'transparent',
                    }}
                >
                    {isTaskCompleted && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
            )}

            {type === 'block' && (
                <div className="w-6 h-6 mt-1 flex-shrink-0 flex items-center justify-center text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                </div>
            )}
            
            <div className="flex-grow">
                <p className={`font-medium ${isTaskCompleted ? 'line-through text-gray-400' : 'text-white'}`}>{data.title}</p>
                <div className="text-sm text-gray-400 flex items-center mt-1 space-x-2">
                    <span className="font-semibold" style={{ color: subject.colorHex }}>{subject.name}</span>
                    <span>·</span>
                    <span>
                        {type === 'task'
                            ? (data.hasSpecificTime ? new Date(data.dueDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'All-day')
                            : `${new Date(data.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${new Date(data.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function HomeView({ subjects, allTodos, onUpdateSubject, studyBlocks, onAddStudyBlock, onUpdateStudyBlock, onDeleteStudyBlock, onStartSession, allDailyGoals, onAddGoal, onToggleGoal }) {
    const [quote, setQuote] = useState('');
    
    const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
    const [isFocusSettingsOpen, setIsFocusSettingsOpen] = useState(false);
    const [focusGoalSubjectId, setFocusGoalSubjectId] = useState<string | null>(null);

    const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);
    const [viewedDate, setViewedDate] = useState(new Date());

    const today = useMemo(() => new Date(), []);
    const todayKey = today.toISOString().slice(0, 10);
    const dailyGoals = useMemo(() => allDailyGoals[todayKey] || [], [allDailyGoals, todayKey]);

    useEffect(() => {
        const fetchQuote = async () => {
            const newQuote = await generateInspirationalQuote();
            setQuote(newQuote);
        };
        fetchQuote();
    }, []);

    const dailyFocusStats = useMemo(() => calculateDailyFocusStats(subjects), [subjects]);

    const viewedDateKey = viewedDate.toISOString().slice(0, 10);
    
    const focusForViewedDay = dailyFocusStats.dailyTotals[viewedDateKey] || 0;
    const focusForToday = dailyFocusStats.dailyTotals[todayKey] || 0;
    
    const isNewRecordToday = focusForToday > 0 && focusForToday >= dailyFocusStats.allTimeRecord;

    const handlePrevDay = () => {
        setViewedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        });
    };
    
    const handleNextDay = () => {
        setViewedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 1);
            return newDate;
        });
    };

    const goToToday = () => {
        setViewedDate(new Date());
    };
    
    const todaysPlanItems = useMemo(() => {
        const todayStr = new Date().toDateString();
        const getSubject = (id: string) => subjects.find(s => s.id === id);

        const todaysTodos = allTodos.filter(t => new Date(t.dueDate).toDateString() === todayStr);
        const todaysBlocks = studyBlocks
            .filter(b => new Date(b.startTime).toDateString() === todayStr)
            .map(b => ({...b, subject: getSubject(b.subjectId)}))
            .filter(b => b.subject);

        const mappedTodos = todaysTodos.map(t => ({
            type: 'task' as const,
            sortTime: t.hasSpecificTime ? new Date(t.dueDate) : new Date(new Date(t.dueDate).setHours(23, 59, 58)),
            data: t
        }));

        const mappedBlocks = todaysBlocks.map(b => ({
            type: 'block' as const,
            sortTime: new Date(b.startTime),
            data: b
        }));

        const combined: PlanItem[] = [...mappedTodos, ...mappedBlocks];
        combined.sort((a, b) => a.sortTime.getTime() - b.sortTime.getTime());
        return combined;
    }, [allTodos, studyBlocks, subjects]);

    const handleEditItem = (item: PlanItem) => {
        setEditingItem(item);
        if (item.type === 'task') {
            setIsAddTodoModalOpen(true);
        } else {
            setIsAddBlockModalOpen(true);
        }
    };
    
    const handleAddGoal = (goalData: { text: string; subjectId: string }) => {
        onAddGoal(today, goalData);
    };
    
    const handleToggleGoal = (goalId: string) => {
        onToggleGoal(today, goalId);
    };

    const handleGoalClick = (goal: DailyGoal) => {
        if (goal.isCompleted) return;
        setFocusGoalSubjectId(goal.subjectId);
        setIsFocusSettingsOpen(true);
    };

    const handleStartFocusFromGoal = (mode: FocusMode, duration: number) => {
        if (focusGoalSubjectId) {
            onStartSession(focusGoalSubjectId, mode, duration);
            setIsFocusSettingsOpen(false);
            setFocusGoalSubjectId(null);
        }
    };
    
    const closeModals = () => {
        setIsAddTodoModalOpen(false);
        setIsAddBlockModalOpen(false);
        setEditingItem(null);
    };
    
    const getSubject = (id: string) => subjects.find(s => s.id === id);

    return (
        <div className="animate-fadeIn space-y-8">
            <DailyFocusTracker
                date={viewedDate}
                totalTime={focusForViewedDay}
                allTimeRecord={dailyFocusStats.allTimeRecord}
                isNewRecord={isNewRecordToday && viewedDate.toDateString() === new Date().toDateString()}
                onPrev={handlePrevDay}
                onNext={handleNextDay}
                onToday={goToToday}
            />
            
             {quote && (
                <div className="text-center">
                    <p className="italic text-sm text-cyan-300">"{quote}"</p>
                </div>
            )}
            
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Today's Goals</h2>
                    <button onClick={() => setIsAddGoalModalOpen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm">
                        + Add Goal
                    </button>
                </div>
                 <div className="space-y-3">
                    {dailyGoals.length > 0 ? (
                        dailyGoals.map(goal => {
                            const subject = getSubject(goal.subjectId);
                            if (!subject) return null;
                            return (
                                <div key={goal.id} className="p-4 rounded-lg flex items-center space-x-4 transition-all duration-300" style={{ backgroundColor: hexToRgba(subject.colorHex, 0.2)}}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleGoal(goal.id); }}
                                        className="w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all duration-200 flex items-center justify-center"
                                        style={{ borderColor: subject.colorHex, backgroundColor: goal.isCompleted ? subject.colorHex : 'transparent' }}
                                    >
                                        {goal.isCompleted && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </button>
                                    <div onClick={() => handleGoalClick(goal)} className="flex-grow cursor-pointer">
                                        <p className={`font-medium ${goal.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>{goal.text}</p>
                                        <div className="text-sm text-gray-400 flex items-center mt-1 space-x-2">
                                            <span className="font-semibold" style={{ color: subject.colorHex }}>{subject.name}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                         <div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
                            <p className="text-gray-400">No goals set for today. What's your focus?</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 mt-8">
                    <h2 className="text-2xl font-bold text-white">Today's Plan</h2>
                    <div className="flex items-center space-x-2">
                         <button onClick={() => { setEditingItem(null); setIsAddBlockModalOpen(true); }} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm">
                           + Block
                        </button>
                        <button onClick={() => { setEditingItem(null); setIsAddTodoModalOpen(true); }} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm">
                           + Task
                        </button>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {todaysPlanItems.length > 0 ? (
                        todaysPlanItems.map(item => (
                            <PlanItemCard
                                key={`${item.type}-${item.data.id}`}
                                item={item}
                                onUpdateSubject={onUpdateSubject}
                                onEdit={handleEditItem}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
                            <p className="text-gray-400">Your plan for today is clear. Add a task or a study block to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {isAddTodoModalOpen && (
                 <AddTodoModal
                    isOpen={isAddTodoModalOpen}
                    onClose={closeModals}
                    subject={editingItem?.data.subject}
                    subjects={subjects}
                    onUpdateSubject={onUpdateSubject}
                    existingTodo={editingItem?.type === 'task' ? editingItem.data : null}
                />
            )}
             {isAddBlockModalOpen && (
                <AddStudyBlockModal
                    isOpen={isAddBlockModalOpen}
                    onClose={closeModals}
                    subjects={subjects}
                    onAddStudyBlock={onAddStudyBlock}
                    onUpdateStudyBlock={onUpdateStudyBlock}
                    onDeleteStudyBlock={onDeleteStudyBlock}
                    existingBlock={editingItem?.type === 'block' ? editingItem.data : null}
                    selectedDate={new Date()}
                    dailyGoals={dailyGoals}
                />
            )}
            {isAddGoalModalOpen && (
                <AddGoalModal
                    isOpen={isAddGoalModalOpen}
                    onClose={() => setIsAddGoalModalOpen(false)}
                    subjects={subjects}
                    onAddGoal={handleAddGoal}
                />
            )}
            {isFocusSettingsOpen && (
                <FocusSettingsModal
                    isOpen={isFocusSettingsOpen}
                    onClose={() => setIsFocusSettingsOpen(false)}
                    onStart={handleStartFocusFromGoal}
                />
            )}
        </div>
    );
}