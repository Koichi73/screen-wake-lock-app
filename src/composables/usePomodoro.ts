import { reactive, computed, onUnmounted } from 'vue';
import type { PomodoroState, TimerConfig } from '../types/pomodoro';
import { useAudio } from './useAudio';

// Default durations and audio source
const DEFAULT_WORK_DURATION = 25 * 60; // 25 minutes
const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes
const DEFAULT_ALARM_SRC = '/audio/alarm.mp3'; // Placeholder for alarm sound

export function usePomodoro(config?: Partial<TimerConfig>) {
  // --- State ---
  const state = reactive<PomodoroState>({
    isRunning: false,
    isPaused: false,
    remainingTime: config?.workDuration ?? DEFAULT_WORK_DURATION,
    totalTime: config?.workDuration ?? DEFAULT_WORK_DURATION,
    sessionType: 'work',
    cycleCount: 0,
    workDuration: config?.workDuration ?? DEFAULT_WORK_DURATION,
    breakDuration: config?.breakDuration ?? DEFAULT_BREAK_DURATION,
  });

  const { playAlarm } = useAudio(DEFAULT_ALARM_SRC);
  let timerId: number | null = null;

  // --- Computed Properties ---
  const formattedTime = computed(() => {
    const minutes = Math.floor(state.remainingTime / 60);
    const seconds = state.remainingTime % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  const isWorkSession = computed(() => state.sessionType === 'work');
  const isBreakSession = computed(() => state.sessionType === 'break');

  // --- Private Methods ---
  const stopTimerInterval = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const startTimerInterval = () => {
    stopTimerInterval(); // Ensure no multiple intervals are running
    timerId = setInterval(() => {
      if (state.remainingTime > 0) {
        state.remainingTime--;
      } else {
        switchSession();
      }
    }, 1000);
  };

  // --- Public Methods ---
  const switchSession = () => {
    playAlarm(); // Notify user that a session has ended

    if (state.sessionType === 'work') {
      state.sessionType = 'break';
      state.remainingTime = state.breakDuration;
      state.totalTime = state.breakDuration;
    } else {
      state.sessionType = 'work';
      state.remainingTime = state.workDuration;
      state.totalTime = state.workDuration;
      state.cycleCount++;
    }

    // Automatically start the next session timer
    startTimer();
  };

  const startTimer = () => {
    if (state.isRunning && !state.isPaused) return;

    // On first start, set cycle to 1
    if (state.cycleCount === 0) {
      state.cycleCount = 1;
    }

    state.isRunning = true;
    state.isPaused = false;
    startTimerInterval();
  };

  const pauseTimer = () => {
    if (!state.isRunning || state.isPaused) return;
    state.isPaused = true;
    stopTimerInterval();
  };

  const resetTimer = () => {
    stopTimerInterval();
    state.isRunning = false;
    state.isPaused = false;
    state.sessionType = 'work';
    state.cycleCount = 1;
    state.remainingTime = state.workDuration;
    state.totalTime = state.workDuration;
  };

  // --- Lifecycle Hook ---
  onUnmounted(() => {
    stopTimerInterval();
  });

  // --- Return ---
  return {
    state,
    formattedTime,
    isWorkSession,
    isBreakSession,
    startTimer,
    pauseTimer,
    resetTimer,
    switchSession, // Exposing as per design document
  };
}
