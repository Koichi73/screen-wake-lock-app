<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Toggle Button -->
    <div class="text-center">
      <button
        @click="handleToggle"
        :disabled="!isSupported || isLoading"
        :aria-pressed="isActive"
        :aria-describedby="isActive ? 'wake-lock-active-desc' : 'wake-lock-inactive-desc'"
        :aria-label="buttonAriaLabel"
        :class="[
          'px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-medium text-white transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
          'min-h-[48px] sm:min-h-[52px]', // Minimum touch target size
          'text-sm sm:text-base',
          'w-full max-w-xs sm:max-w-sm mx-auto',
          isActive 
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 active:bg-red-700' 
            : 'bg-green-500 hover:bg-green-600 focus:ring-green-500 active:bg-green-700',
          (!isSupported || isLoading) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-lg transform hover:scale-105 active:scale-95'
        ]"
        type="button"
      >
        <span v-if="isLoading" class="flex items-center justify-center">
          <svg 
            class="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span aria-live="polite">処理中...</span>
        </span>
        <span v-else>
          {{ buttonText }}
        </span>
      </button>
      
      <!-- Hidden descriptions for screen readers -->
      <div class="sr-only">
        <div id="wake-lock-active-desc">
          ウェイクロックが有効です。画面はスリープしません。クリックして無効にできます。
        </div>
        <div id="wake-lock-inactive-desc">
          ウェイクロックが無効です。画面は通常通りスリープします。クリックして有効にできます。
        </div>
      </div>
    </div>

    <!-- Status Display -->
    <div class="text-center">
      <div 
        :class="[
          'inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium',
          'min-h-[32px] sm:min-h-[36px]', // Ensure readable size
          isActive 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        ]"
        role="status"
        :aria-label="statusAriaLabel"
        aria-live="polite"
      >
        <div 
          :class="[
            'w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3',
            isActive ? 'bg-green-400' : 'bg-gray-400'
          ]"
          :aria-hidden="true"
        ></div>
        <span>{{ statusText }}</span>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="text-center">
      <div 
        class="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 shadow-sm"
        role="alert"
        aria-labelledby="error-title"
        aria-describedby="error-message"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg 
              class="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mt-0.5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 
              id="error-title"
              class="text-sm font-medium text-red-800 mb-1"
            >
              エラーが発生しました
            </h3>
            <p 
              id="error-message"
              class="text-sm text-red-700 mb-3"
            >
              {{ error }}
            </p>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <button
                @click="clearError"
                class="text-xs text-red-600 hover:text-red-800 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1 min-h-[32px]"
                type="button"
                aria-label="エラーメッセージを閉じる"
              >
                エラーを閉じる
              </button>
              <button
                @click="handleToggle"
                :disabled="isLoading"
                class="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[32px]"
                type="button"
                :aria-label="isLoading ? '処理中です' : 'ウェイクロックを再試行'"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Browser Support Warning -->
    <div v-if="!isSupported" class="text-center">
      <div 
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-5"
        role="alert"
        aria-labelledby="browser-support-warning"
      >
        <div class="flex items-center justify-center">
          <svg 
            class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mr-2 sm:mr-3 flex-shrink-0" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p 
            id="browser-support-warning"
            class="text-yellow-800 text-sm sm:text-base text-left"
          >
            このブラウザはScreen Wake Lock APIをサポートしていません。Chrome、Edge、またはSafariの最新版をお試しください。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWakeLock } from '../composables/useWakeLock'

// Use the wake lock composable
const { isActive, isSupported, error, isLoading, toggleWakeLock, clearError } = useWakeLock()

// Computed properties for dynamic text
const buttonText = computed(() => {
  if (!isSupported.value) {
    return 'サポートされていません'
  }
  return isActive.value ? '画面スリープ防止を解除' : '画面スリープ防止を有効化'
})

const statusText = computed(() => {
  return isActive.value ? '現在の状態：有効' : '現在の状態：無効'
})

// Computed properties for accessibility
const buttonAriaLabel = computed(() => {
  if (!isSupported.value) {
    return 'ウェイクロック機能はこのブラウザではサポートされていません'
  }
  if (isLoading.value) {
    return 'ウェイクロック処理中です'
  }
  return isActive.value 
    ? 'ウェイクロックを解除して画面のスリープを許可する' 
    : 'ウェイクロックを有効化して画面のスリープを防止する'
})

const statusAriaLabel = computed(() => {
  return isActive.value 
    ? 'ウェイクロックが有効です。画面はスリープしません。' 
    : 'ウェイクロックが無効です。画面は通常通りスリープします。'
})

// Define emits
interface Emits {
  (e: 'request-wake-lock', requestCallback: () => Promise<void>): void
}

const emit = defineEmits<Emits>()

// Handle toggle button click
const handleToggle = async () => {
  if (!isSupported.value || isLoading.value) {
    return
  }

  // Clear any previous errors when user tries again
  if (error.value) {
    clearError()
  }

  // If wake lock is currently active, release it directly
  if (isActive.value) {
    try {
      await toggleWakeLock()
    } catch (err) {
      console.error('Wake lock release failed:', err)
      // Error is already handled by the composable
    }
    return
  }

  // If wake lock is inactive, emit request event to parent
  // Parent will handle showing modal and then call the callback
  const requestCallback = async () => {
    try {
      await toggleWakeLock()
    } catch (err) {
      console.error('Wake lock request failed:', err)
      // Error is already handled by the composable
    }
  }

  emit('request-wake-lock', requestCallback)
}
</script>