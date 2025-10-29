import React from 'react';
import { formatTotalTime } from '../utils/helpers';

interface DailyFocusTrackerProps {
  date: Date;
  totalTime: number;
  allTimeRecord: number;
  isNewRecord: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const formatDateLabel = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};

export default function DailyFocusTracker({ date, totalTime, allTimeRecord, isNewRecord, onPrev, onNext, onToday }: DailyFocusTrackerProps) {
    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <div className="bg-gray-800 p-6 rounded-lg text-center relative overflow-hidden">
            {isNewRecord && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                    🎉 New Record!
                </div>
            )}
            <div className="flex items-center justify-between mb-4">
                <button onClick={onPrev} className="p-2 rounded-full hover:bg-gray-700 transition">&larr;</button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">Focused {formatDateLabel(date)}</h2>
                    {!isToday && <button onClick={onToday} className="text-xs text-cyan-400 hover:underline">Back to Today</button>}
                </div>
                <button onClick={onNext} disabled={isToday} className="p-2 rounded-full hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed">&rarr;</button>
            </div>
            
            <p className="text-6xl font-bold text-cyan-400 my-4">{formatTotalTime(totalTime)}</p>

            <p className="text-sm text-gray-400">
                Daily Record: <span className="font-semibold text-gray-300">{formatTotalTime(allTimeRecord)}</span>
            </p>
        </div>
    );
}