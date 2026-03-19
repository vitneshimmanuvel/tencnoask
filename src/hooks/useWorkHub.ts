import { useState, useEffect, useCallback } from 'react';

export function useWorkTimer(maxHours: number = 7) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const storedStart = localStorage.getItem('work_start_time');
    if (storedStart) {
      setStartTime(parseInt(storedStart));
    } else {
      const now = Date.now();
      setStartTime(now);
      localStorage.setItem('work_start_time', now.toString());
    }
  }, []);

  useEffect(() => {
    if (!startTime || isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const remainingSeconds = Math.max(0, maxHours * 3600 - elapsedSeconds);

  return {
    elapsedTime: formatTime(elapsedSeconds),
    remainingTime: formatTime(remainingSeconds),
    elapsedSeconds,
    remainingSeconds,
    isOverLimit: elapsedSeconds >= maxHours * 3600,
  };
}

export function useIdleDetection(timeoutMinutes: number = 10, onIdle: () => void) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onIdle, timeoutMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(timeoutId);
    };
  }, [timeoutMinutes, onIdle]);
}
