import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePomodoro } from '../usePomodoro';
import { nextTick } from 'vue';

const TEST_WORK_DURATION = 25 * 60; // Original default work duration
const TEST_BREAK_DURATION = 5 * 60; // Original default break duration

// Mock the useAudio composable before it's imported by usePomodoro
const playAlarmMock = vi.fn();
vi.mock('../useAudio', () => ({
  useAudio: () => ({
    playAlarm: playAlarmMock,
  }),
}));

describe('usePomodoro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default work session state', () => {
    const { state } = usePomodoro();
    expect(state.isRunning).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.sessionType).toBe('work');
    expect(state.remainingTime).toBe(25 * 60);
    expect(state.cycleCount).toBe(0);
  });

  it('starts the timer, sets cycle to 1, and decrements time', async () => {
    const { state, startTimer } = usePomodoro();
    startTimer();
    expect(state.isRunning).toBe(true);
    expect(state.cycleCount).toBe(1);

    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(state.remainingTime).toBe(25 * 60 - 1);
  });

  it('pauses the timer', async () => {
    const { state, startTimer, pauseTimer } = usePomodoro();
    startTimer();
    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(state.remainingTime).toBe(25 * 60 - 2);

    pauseTimer();
    expect(state.isPaused).toBe(true);

    vi.advanceTimersByTime(3000);
    await nextTick();
    expect(state.remainingTime).toBe(25 * 60 - 2); // Time should not change
  });

  it('resumes the timer', async () => {
    const { state, startTimer, pauseTimer } = usePomodoro();
    startTimer();
    pauseTimer();
    expect(state.isPaused).toBe(true);

    // Resume by calling startTimer again
    startTimer();
    expect(state.isPaused).toBe(false);

    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(state.remainingTime).toBe(25 * 60 - 1);
  });

  it('resets the timer to initial work session', () => {
    const { state, startTimer, resetTimer } = usePomodoro();
    startTimer();
    state.remainingTime = 100;
    state.cycleCount = 3;

    resetTimer();
    expect(state.isRunning).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.sessionType).toBe('work');
    expect(state.remainingTime).toBe(25 * 60);
    expect(state.cycleCount).toBe(0);
  });

  it('switches from work to break session automatically', async () => {
    const { state, startTimer } = usePomodoro();
    startTimer();
    state.remainingTime = 1; // Set time to 1 second before end

    vi.advanceTimersByTime(1000); // remainingTime becomes 0
    await nextTick();
    expect(state.remainingTime).toBe(0);
    expect(playAlarmMock).not.toHaveBeenCalled(); // Not yet called

    vi.advanceTimersByTime(1000); // switchSession is called
    await nextTick();

    expect(playAlarmMock).toHaveBeenCalled();
    expect(state.sessionType).toBe('break');
    expect(state.remainingTime).toBe(5 * 60);
    expect(state.isRunning).toBe(true); // Should automatically start the break timer
  });

  it('switches from break to work session and increments cycle', async () => {
    const { state, startTimer } = usePomodoro();
    // Setup break session state
    state.sessionType = 'break';
    state.remainingTime = 1;
    state.cycleCount = 1;

    startTimer();

    vi.advanceTimersByTime(1000); // remainingTime becomes 0
    await nextTick();
    expect(state.remainingTime).toBe(0);
    expect(playAlarmMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000); // switchSession is called
    await nextTick();

    expect(playAlarmMock).toHaveBeenCalled();
    expect(state.sessionType).toBe('work');
    expect(state.remainingTime).toBe(25 * 60);
    expect(state.cycleCount).toBe(2);
    expect(state.isRunning).toBe(true); // Should automatically start the work timer
  });
});
