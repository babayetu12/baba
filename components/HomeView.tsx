import React, { useState, useEffect } from 'react';
import { generateInspirationalQuote } from '../services/geminiService';
import { hexToRgba } from '../utils/helpers';
import AddTodoModal from './modals/AddTodoModal';
import { PlusIcon } from './ui/Icons';
import { Subject, TodoItem } from '../types';

interface HomeViewProps {
    subjects: Subject[];
    allTodos: (TodoItem & { subject: Subject })[];
    onUpdateSubject: (subject: Subject) => void;
}

export default function HomeView({ subjects, allTodos, onUpdateSubject }: HomeViewProps) {
    const [quote, setQuote] = useState('Loading an inspiring thought...');
    const [isLoadingQuote, setIsLoadingQuote] = useState(true);
    const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState< (TodoItem & { subject: Subject }) | null>(null);

    useEffect(() => {
        const fetchQuote = async () => {
            setIsLoadingQuote(true);
            const newQuote = await generateInspirationalQuote();
            setQuote(newQuote);
            setIsLoadingQuote(false);
        };
        fetchQuote();
    }, []);

    const sortedTodos = [...allTodos].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const toggleTodoCompletion = (todo: TodoItem & { subject: Subject }) => {
        const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
        const { subject, ...todoToSave } = updatedTodo;
        const updatedSubject = {
            ...subject,
            todos: subject.todos.map(t => t.id === todo.id ? todoToSave : t)
        };
        onUpdateSubject(updatedSubject);
    };

    const handleEditTodo = (todo: TodoItem & { subject: Subject }) => {
        setEditingTodo(todo);
        setIsAddTodoModalOpen(true);
    };

    const handleAddNewTodo = () => {
        setEditingTodo(null);
        setIsAddTodoModalOpen(true);
    };

    const closeTodoModal = () => {
        setIsAddTodoModalOpen(false);
        setEditingTodo(null);
    };

    return (
        <div className="animate-fadeIn">
            <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center shadow-lg">
                <p className={`italic text-lg text-cyan-300 ${isLoadingQuote ? 'animate-pulse' : ''}`}>
                    "{quote}"
                </p>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">My Tasks</h2>
                <button onClick={handleAddNewTodo} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold p-2 rounded-full shadow-lg transition">
                    <PlusIcon />
                </button>
            </div>
            
            <div className="space-y-3">
                {sortedTodos.length > 0 ? sortedTodos.map(todo => (
                    <div
                        key={todo.id}
                        onClick={() => handleEditTodo(todo)}
                        className={`p-4 rounded-lg flex items-center transition-all duration-300 cursor-pointer hover:shadow-xl ${todo.isCompleted ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: hexToRgba(todo.subject.colorHex, 0.2) }}
                    >
                        <div className="flex-shrink-0 mr-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTodoCompletion(todo);
                                }}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center`}
                                style={{
                                    borderColor: todo.subject.colorHex,
                                    backgroundColor: todo.isCompleted ? todo.subject.colorHex : 'transparent',
                                }}
                            >
                                {todo.isCompleted && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className="flex-grow">
                            <p className={`font-medium ${todo.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                                {todo.title}
                            </p>
                            <div className="text-sm text-gray-400 flex items-center mt-1">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: todo.subject.colorHex }}></span>
                                <span>{todo.subject.name}</span>
                                <span className="mx-2">·</span>
                                <span>
                                    {new Date(todo.dueDate).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric',
                                        ...(todo.hasSpecificTime && { hour: 'numeric', minute: '2-digit' })
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">No tasks found. Add one in a subject!</p>
                    </div>
                )}
            </div>
            {isAddTodoModalOpen && (
                 <AddTodoModal
                    isOpen={isAddTodoModalOpen}
                    onClose={closeTodoModal}
                    subject={editingTodo?.subject}
                    subjects={subjects}
                    onUpdateSubject={onUpdateSubject}
                    existingTodo={editingTodo}
                />
            )}
        </div>
    );
}
