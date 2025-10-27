// This file is now components/modals/RanksModal.js
import React from 'react';
import { USER_RANKS } from '../../constants.js';

export default function RanksModal({ isOpen, onClose, totalFocusTime }) {
  if (!isOpen) return null;

  const totalHours = totalFocusTime / 3600;
  const currentRank = USER_RANKS.slice().reverse().find(rank => totalHours >= rank.minHours) || USER_RANKS[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center">Focus Ranks</h2>
        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
          {USER_RANKS.map(rank => (
            <div
              key={rank.name}
              className={`p-4 rounded-lg flex items-center transition-all duration-300 ${currentRank.name === rank.name ? 'bg-cyan-500 bg-opacity-30 border-l-4 border-cyan-400' : 'bg-gray-700'}`}
            >
              <span className="text-4xl mr-4">{rank.icon}</span>
              <div>
                <p className={`font-bold text-lg ${currentRank.name === rank.name ? 'text-white' : 'text-gray-200'}`}>{rank.name}</p>
                <p className="text-sm text-gray-400">{rank.minHours}+ hours</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition">Close</button>
        </div>
      </div>
    </div>
  );
}
