import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudio } from '../useAudio';

// Mock the global Audio object
const playMock = vi.fn(() => Promise.resolve());
const pauseMock = vi.fn();
const volumeSetter = vi.fn();

global.Audio = vi.fn(() => ({
  play: playMock,
  pause: pauseMock,
  get volume() {
    return 1; // Default volume
  },
  set volume(value) {
    volumeSetter(value);
  },
  currentTime: 0,
})) as any;

describe('useAudio', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  it('should initialize with a given audio source', () => {
    const audioSrc = '/audio/test.mp3';
    useAudio(audioSrc);
    expect(global.Audio).toHaveBeenCalledWith(audioSrc);
  });

  it('should play audio when playAlarm is called', async () => {
    const { playAlarm, isPlaying } = useAudio('/audio/test.mp3');

    expect(isPlaying.value).toBe(false);
    await playAlarm();

    expect(playMock).toHaveBeenCalled();
    expect(isPlaying.value).toBe(true);
  });

  it('should stop audio when stopAlarm is called', async () => {
    const { playAlarm, stopAlarm, isPlaying } = useAudio('/audio/test.mp3');

    await playAlarm();
    expect(isPlaying.value).toBe(true);

    stopAlarm();
    expect(pauseMock).toHaveBeenCalled();
    expect(isPlaying.value).toBe(false);
  });

  it('should set volume correctly', () => {
    const { setVolume } = useAudio('/audio/test.mp3');

    setVolume(0.5);
    expect(volumeSetter).toHaveBeenCalledWith(0.5);
  });

  it('should not set volume outside the 0-1 range', () => {
    const { setVolume } = useAudio('/audio/test.mp3');

    setVolume(1.5);
    expect(volumeSetter).not.toHaveBeenCalled();

    setVolume(-0.5);
    expect(volumeSetter).not.toHaveBeenCalled();
  });

  it('should handle playback errors', async () => {
    const error = new Error('Playback failed');
    playMock.mockRejectedValueOnce(error);

    const { playAlarm, isPlaying, error: audioError } = useAudio('/audio/test.mp3');

    await playAlarm();

    expect(isPlaying.value).toBe(false);
    expect(audioError.value).toContain('音声の再生に失敗しました');
  });
});
