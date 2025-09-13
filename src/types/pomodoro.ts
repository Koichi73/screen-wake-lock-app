export interface PomodoroState {
  // Timer status
  isRunning: boolean;
  isPaused: boolean;

  // Time management
  remainingTime: number; // in seconds
  totalTime: number; // in seconds

  // Session management
  sessionType: 'work' | 'break';
  cycleCount: number;

  // Settings
  workDuration: number; // default: 25 minutes (1500 seconds)
  breakDuration: number; // default: 5 minutes (300 seconds)
}

export interface TimerConfig {
  workDuration: number;
  breakDuration: number;
  alarmDuration: number; // default: 3 seconds
}
