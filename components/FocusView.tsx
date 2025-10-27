// This file is now components/FocusView.js
import React, { useState, useEffect } from 'react';
import { FocusMode } from '../types.js';
import { formatTime } from '../utils/helpers.js';
import { useTimer } from '../hooks/useTimer.js';
import { POMODORO_SETTINGS } from '../constants.js';

const QUOTES = {
  focus: [
    "The only way to do great work is to love what you do.",
    "Concentrate all your thoughts upon the work at hand.",
    "The successful warrior is the average man, with laser-like focus.",
    "Your future is created by what you do today, not tomorrow."
  ],
  break: [
    "Rest and be thankful.",
    "Almost everything will work again if you unplug it for a few minutes... including you.",
    "Take a deep breath. It's just a bad day, not a bad life.",
    "Time to relax and recharge."
  ]
};

export default function FocusView({ sessionConfig, onSessionEnd, subject }) {
  const [showQuote, setShowQuote] = useState(true);
  const [quote, setQuote] = useState("");

  const handleEnd = (focused, paused) => {
    onSessionEnd(focused, paused, sessionConfig.subjectId);
  };
  
  const { timeValue, isRunning, pausedTime, pomodoroState, start, pause, resume, stop } = useTimer(
    sessionConfig.mode,
    sessionConfig.mode === FocusMode.Pomodoro ? POMODORO_SETTINGS.focusDuration : sessionConfig.duration,
    handleEnd
  );

  useEffect(() => {
    const isBreak = pomodoroState.stage.includes('Break');
    const quotePool = isBreak ? QUOTES.break : QUOTES.focus;
    setQuote(quotePool[Math.floor(Math.random() * quotePool.length)]);
    setShowQuote(true);
    const quoteTimer = setTimeout(() => setShowQuote(false), 2500);
    return () => clearTimeout(quoteTimer);
  }, [pomodoroState.stage]);

  useEffect(() => {
    start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPomodoroStatusText = () => {
    if (sessionConfig.mode !== FocusMode.Pomodoro) return subject.name;
    return `${pomodoroState.stage} (${pomodoroState.cycle}/${POMODORO_SETTINGS.cycles})`;
  };

  const renderUI = () => {
    if (showQuote) {
      return (
        <div className="animate-fadeIn text-center">
          <p className="text-3xl italic text-gray-300">"{quote}"</p>
        </div>
      );
    }
    return (
      <div className="animate-fadeIn w-full h-full flex flex-col items-center justify-center text-center">
        <div className="absolute top-8 left-8 text-lg font-semibold" style={{ color: subject.colorHex }}>
          {subject.name}
        </div>
        
        {sessionConfig.mode === FocusMode.Pomodoro && (
           <div className="mb-4 text-2xl font-semibold text-gray-300">
             {getPomodoroStatusText()}
           </div>
        )}
        
        <h1 className="text-8xl md:text-9xl font-mono font-bold tracking-tighter" style={{ color: subject.colorHex }}>
          {formatTime(timeValue)}
        </h1>

        <div className="mt-12 flex space-x-6">
          {isRunning ? (
            <button
              onClick={pause}
              className="px-8 py-3 text-lg font-semibold rounded-lg bg-yellow-500 text-black hover:bg-yellow-600 transition"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={resume}
              className="px-8 py-3 text-lg font-semibold rounded-lg bg-green-500 text-black hover:bg-green-600 transition"
            >
              Resume
            </button>
          )}
          <button
            onClick={stop}
            className="px-8 py-3 text-lg font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Stop
          </button>
        </div>
        <div className="mt-6 text-gray-400">
            Paused Time: {formatTime(pausedTime)}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
      {renderUI()}
    </div>
  );
}
