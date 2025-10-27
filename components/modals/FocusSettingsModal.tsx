// This file is now components/modals/FocusSettingsModal.js
import React, { useState } from 'react';
import { FocusMode } from '../../types.js';
import { POMODORO_SETTINGS } from '../../constants.js';

export default function FocusSettingsModal({ isOpen, onClose, onStart }) {
  const [mode, setMode] = useState(FocusMode.Pomodoro);
  const [durationMinutes, setDurationMinutes] = useState('25');

  const handleStart = () => {
    let durationSeconds = 0;
    if (mode === FocusMode.Pomodoro) {
      durationSeconds = POMODORO_SETTINGS.focusDuration;
    } else if (mode === FocusMode.Countdown) {
      durationSeconds = parseInt(durationMinutes, 10) * 60;
    }
    onStart(mode, durationSeconds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Focus Session Setup</h2>
        <div className="mb-6">
          <label className="block text-gray-400 mb-2">Focus Mode</label>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-700 p-1">
            {Object.values(FocusMode).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${mode === m ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {mode === FocusMode.Countdown && (
          <div className="mb-6 animate-fadeIn">
            <label htmlFor="duration" className="block text-gray-400 mb-2">Duration (minutes)</label>
            <input
              type="number" id="duration" value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              min="1"
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-8">
            <button onClick={onClose} className="py-3 px-6 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Cancel</button>
            <button
                onClick={handleStart}
                className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-transform duration-200 hover:scale-105"
            >
                Start Focusing
            </button>
        </div>
      </div>
    </div>
  );
}
