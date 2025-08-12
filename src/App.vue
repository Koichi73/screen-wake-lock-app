<template>
  <div 
    class="min-h-screen bg-gray-50 py-4 px-4 sm:py-8 sm:px-6 lg:px-8"
    role="main"
    aria-label="画面スリープ防止webアプリケーション"
  >
    <div class="max-w-md mx-auto">
      <!-- Skip to main content link for screen readers -->
      <a 
        href="#main-content" 
        class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        tabindex="0"
      >
        メインコンテンツにスキップ
      </a>
      
      <!-- Main Card -->
      <div 
        id="main-content"
        class="bg-white rounded-xl shadow-lg p-6 sm:p-8"
        role="region"
        aria-labelledby="app-title"
      >
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 
            id="app-title"
            class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
          >
            画面スリープ防止アプリ
          </h1>
          <p 
            class="text-gray-600 text-sm sm:text-base"
            aria-describedby="app-description"
          >
            画面をスリープさせずに表示を維持します
          </p>
        </header>
        
        <!-- Wake Lock Toggle Component -->
        <section 
          aria-labelledby="wake-lock-section"
          class="mb-8"
        >
          <h2 id="wake-lock-section" class="sr-only">ウェイクロック制御</h2>
          <WakeLockToggle @request-wake-lock="handleWakeLockRequest" />
        </section>
        
        <!-- Info Section -->
        <footer class="mt-8 pt-6 border-t border-gray-200">
          <div class="text-center">
            <p 
              id="app-description"
              class="text-xs sm:text-sm text-gray-500 leading-relaxed"
              role="note"
            >
              このアプリケーションはお使いのデバイスの画面が<br class="hidden sm:inline">
              自動的にスリープするのを防ぎます。
            </p>
          </div>
        </footer>
      </div>
      
      <!-- Footer -->
      <div class="mt-6 text-center">
        <p 
          class="text-xs text-gray-400"
          role="note"
          aria-label="ブラウザサポート要件"
        >
          ブラウザがScreen Wake Lock APIをサポートしている必要があります
        </p>
      </div>
    </div>
    
    <!-- Warning Modal -->
    <WarningModal 
      :is-visible="showWarningModal"
      :is-processing="isModalProcessing"
      @confirm="handleModalConfirm"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WakeLockToggle, WarningModal } from './components'

// Modal state management
const showWarningModal = ref(false)
const hasShownWarning = ref(false)
const isModalProcessing = ref(false)

// Pending wake lock request callback
let pendingWakeLockRequest: (() => Promise<void>) | null = null

/**
 * Handle wake lock request from WakeLockToggle component
 * Shows warning modal on first request, then proceeds with wake lock
 */
const handleWakeLockRequest = async (requestCallback: () => Promise<void>) => {
  // If user hasn't seen the warning yet, show modal first
  if (!hasShownWarning.value) {
    pendingWakeLockRequest = requestCallback
    showWarningModal.value = true
    return
  }
  
  // If warning has been shown, proceed directly with wake lock request
  try {
    await requestCallback()
  } catch (error) {
    console.error('Wake lock request failed:', error)
    // Error handling is managed by the useWakeLock composable
    // No additional user feedback needed here as the component will show the error
  }
}

/**
 * Handle modal confirmation - user clicked "理解した"
 */
const handleModalConfirm = async () => {
  if (isModalProcessing.value) {
    return
  }

  isModalProcessing.value = true
  hasShownWarning.value = true
  
  try {
    // Execute the pending wake lock request
    if (pendingWakeLockRequest) {
      await pendingWakeLockRequest()
    }
  } catch (error) {
    console.error('Wake lock request failed after modal confirmation:', error)
    // Error handling is managed by the useWakeLock composable
    // The WakeLockToggle component will display the error to the user
  } finally {
    showWarningModal.value = false
    isModalProcessing.value = false
    pendingWakeLockRequest = null
  }
}

/**
 * Handle modal close - user dismissed modal without confirming
 */
const handleModalClose = () => {
  showWarningModal.value = false
  pendingWakeLockRequest = null
}
</script>