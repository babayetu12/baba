// This file is now components/modals/SessionReportModal.js
import React from 'react';
import { formatTotalTime } from '../../utils/helpers.js';

export default function SessionReportModal({ report, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Session Complete!</h2>
        <div className="space-y-4 text-lg">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">Time Focused</p>
            <p className="font-bold text-white text-3xl">{formatTotalTime(report.focusedDuration)}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">Break Time</p>
            <p className="font-bold text-white text-3xl">{formatTotalTime(report.breakDuration)}</p>
          </div>
           <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">Total Focus Time</p>
            <p className="font-bold text-white text-3xl">{formatTotalTime(report.totalFocusTimeAfter)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
