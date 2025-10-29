import React from 'react';
import { ALL_ACHIEVEMENTS } from '../../achievements';
import { Achievement } from '../../types';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    earnedAchievements: Achievement[];
}

export default function AchievementsModal({ isOpen, onClose, earnedAchievements }: AchievementsModalProps) {
    if (!isOpen) return null;

    const earnedIds = new Set(earnedAchievements.map(a => a.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-center">Achievements</h2>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ALL_ACHIEVEMENTS.map(ach => {
                            const isEarned = earnedIds.has(ach.id);
                            return (
                                <div
                                    key={ach.id}
                                    className={`p-4 rounded-lg flex items-center transition-all duration-300 ${isEarned ? 'bg-gray-700' : 'bg-gray-900 opacity-60'}`}
                                >
                                    <span className={`text-4xl mr-4 ${!isEarned ? 'filter grayscale' : ''}`}>{ach.icon}</span>
                                    <div>
                                        <p className={`font-bold ${isEarned ? 'text-white' : 'text-gray-400'}`}>{ach.name}</p>
                                        <p className="text-sm text-gray-400">{ach.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Close</button>
                </div>
            </div>
        </div>
    );
}
