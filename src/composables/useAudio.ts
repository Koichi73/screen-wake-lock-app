import { ref } from 'vue';

/**
 * Composable for managing audio playback.
 * @param audioSrc The source URL of the audio file.
 */
export function useAudio(audioSrc: string) {
  const audio = new Audio(audioSrc);
  const isPlaying = ref(false);
  const error = ref<string | null>(null);

  /**
   * Plays the audio.
   * Handles potential autoplay policy errors.
   */
  const play = async () => {
    try {
      await audio.play();
      isPlaying.value = true;
      error.value = null;
    } catch (err) {
      console.error('Audio playback failed:', err);
      error.value = '音声の再生に失敗しました。ブラウザの設定やユーザー操作を確認してください。';
      isPlaying.value = false;
    }
  };

  /**
   * Stops the audio and resets its time.
   */
  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
    isPlaying.value = false;
  };

  /**
   * Sets the audio volume.
   * @param volume The volume level (0.0 to 1.0).
   */
  const setVolume = (volume: number) => {
    if (volume >= 0 && volume <= 1) {
      audio.volume = volume;
    }
  };

  // Alias for playing alarm sound as per design document
  const playAlarm = play;
  const stopAlarm = stop;

  return {
    isPlaying,
    error,
    playAlarm,
    stopAlarm,
    setVolume,
  };
}
