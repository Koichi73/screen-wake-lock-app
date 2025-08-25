import { ref, computed, onMounted, onUnmounted, readonly } from 'vue';

/**
 * 時計機能を提供するためのコンポーザブル
 * @returns リアクティブな現在時刻とフォーマット済み文字列
 */
export function useClock() {
  const currentTime = ref(new Date());
  let timerId: number | null = null;

  const updateClock = () => {
    currentTime.value = new Date();
  };

  onMounted(() => {
    // 1秒ごとに時計を更新
    timerId = window.setInterval(updateClock, 1000);
  });

  onUnmounted(() => {
    // コンポーネントが破棄される際にタイマーを停止
    if (timerId) {
      clearInterval(timerId);
    }
  });

  // 24時間形式 (HH:MM:SS) にフォーマット
  const formattedTime = computed(() => {
    return currentTime.value.toLocaleTimeString('ja-JP', { hour12: false });
  });

  // 日付形式 (YYYY/MM/DD) にフォーマット
  const formattedDate = computed(() => {
    return currentTime.value.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  });

  return {
    currentTime: readonly(currentTime),
    formattedTime,
    formattedDate,
  };
}
