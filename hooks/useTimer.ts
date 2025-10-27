// This file is now hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { FocusMode } from '../types.js';
import { POMODORO_SETTINGS } from '../constants.js';

export const useTimer = (mode, initialDuration, onSessionEnd) => {
    const [timeValue, setTimeValue] = useState(mode === FocusMode.Stopwatch ? 0 : initialDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [pausedTime, setPausedTime] = useState(0);
    const [pomodoroState, setPomodoroState] = useState({ stage: 'Focus', cycle: 1 });

    const intervalRef = useRef(null);
    const pausedTimeIntervalRef = useRef(null);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (pausedTimeIntervalRef.current) clearInterval(pausedTimeIntervalRef.current);
        setIsRunning(false);
        intervalRef.current = null;
        pausedTimeIntervalRef.current = null;
    }, []);

    const handlePomodoroTransition = useCallback(() => {
        stopTimer();
        let nextStage;
        let nextCycle = pomodoroState.cycle;
        let nextDuration;

        if (pomodoroState.stage === 'Focus') {
            if (pomodoroState.cycle < POMODORO_SETTINGS.cycles) {
                nextStage = 'Short Break';
                nextDuration = POMODORO_SETTINGS.shortBreakDuration;
            } else {
                nextStage = 'Long Break';
                nextDuration = POMODORO_SETTINGS.longBreakDuration;
            }
        } else { // Short or Long Break
            nextStage = 'Focus';
            nextCycle = pomodoroState.stage === 'Long Break' ? 1 : pomodoroState.cycle + 1;
            nextDuration = POMODORO_SETTINGS.focusDuration;
        }

        setPomodoroState({ stage: nextStage, cycle: nextCycle });
        setTimeValue(nextDuration);
        setIsRunning(true);
    }, [pomodoroState, stopTimer]);
    
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                if (mode === FocusMode.Stopwatch) {
                    setTimeValue(prev => prev + 1);
                } else {
                    setTimeValue(prev => {
                        if (prev <= 1) {
                            if (mode === FocusMode.Pomodoro) {
                                handlePomodoroTransition();
                            } else {
                                stopTimer();
                                onSessionEnd(initialDuration, pausedTime);
                            }
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, mode, handlePomodoroTransition]);

    const start = () => setIsRunning(true);

    const pause = () => {
        setIsRunning(false);
        pausedTimeIntervalRef.current = window.setInterval(() => {
            setPausedTime(prev => prev + 1);
        }, 1000);
    };

    const resume = () => {
        if (pausedTimeIntervalRef.current) clearInterval(pausedTimeIntervalRef.current);
        pausedTimeIntervalRef.current = null;
        setIsRunning(true);
    };

    const stop = () => {
        stopTimer();
        const focusedDuration = mode === FocusMode.Stopwatch ? timeValue : initialDuration - timeValue;
        onSessionEnd(focusedDuration, pausedTime);
    };

    return { timeValue, isRunning, pausedTime, pomodoroState, start, pause, resume, stop };
};
