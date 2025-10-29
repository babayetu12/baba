import { useState, useEffect, useRef, useCallback } from 'react';
import { FocusMode } from '../types';
import { POMODORO_SETTINGS } from '../constants';

export const useTimer = (mode: FocusMode, initialDuration: number, onSessionEnd: (focusedDuration: number, pausedTime: number) => void) => {
    const [timeValue, setTimeValue] = useState(mode === FocusMode.Stopwatch ? 0 : initialDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [pausedTime, setPausedTime] = useState(0); // Note: Paused time tracking might be less accurate with this new model, but focus time will be perfect.
    const [pomodoroState, setPomodoroState] = useState({ stage: 'Focus', cycle: 1 });

    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const elapsedBeforePauseRef = useRef<number>(0); // Time in milliseconds

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    }, []);

    const handlePomodoroTransition = useCallback(() => {
        // This logic remains largely the same, but the timer driving it is now timestamp-based
        let nextStage: string;
        let nextCycle = pomodoroState.cycle;
        let nextDuration: number;

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
        
        stopTimer();
        setPomodoroState({ stage: nextStage, cycle: nextCycle });
        setTimeValue(nextDuration);
        
        // Auto-start the next stage
        startTimeRef.current = Date.now();
        elapsedBeforePauseRef.current = 0;
        setIsRunning(true);
    }, [pomodoroState, stopTimer]);
    
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                const totalElapsedMs = elapsedBeforePauseRef.current + (Date.now() - startTimeRef.current);
                const totalElapsedSec = Math.floor(totalElapsedMs / 1000);

                if (mode === FocusMode.Stopwatch) {
                    setTimeValue(totalElapsedSec);
                } else {
                    const remaining = initialDuration - totalElapsedSec;
                    if (remaining <= 0) {
                        if (mode === FocusMode.Pomodoro) {
                            handlePomodoroTransition();
                        } else {
                            // Ensure we don't go negative and call onSessionEnd correctly
                            setTimeValue(0);
                            stopTimer();
                            onSessionEnd(initialDuration, pausedTime);
                        }
                    } else {
                        setTimeValue(remaining);
                    }
                }
            }, 250); // Update UI 4 times a second for smoother display
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, mode, initialDuration, handlePomodoroTransition]);

    const start = () => {
        startTimeRef.current = Date.now();
        elapsedBeforePauseRef.current = 0;
        setIsRunning(true);
    };

    const pause = () => {
        if (isRunning) {
            stopTimer();
            // Add the time from the last run segment to the total paused time
            elapsedBeforePauseRef.current += Date.now() - startTimeRef.current;
        }
    };

    const resume = () => {
        if (!isRunning) {
            // Start a new run segment
            startTimeRef.current = Date.now();
            setIsRunning(true);
        }
    };

    const stop = () => {
        let focusedDurationMs = elapsedBeforePauseRef.current;
        if (isRunning) {
            // If it was running when stopped, add the current segment's time
            focusedDurationMs += Date.now() - startTimeRef.current;
        }
        
        stopTimer();
        onSessionEnd(Math.floor(focusedDurationMs / 1000), pausedTime);
    };

    return { timeValue, isRunning, pausedTime, pomodoroState, start, pause, resume, stop };
};
