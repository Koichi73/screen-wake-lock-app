<template>
  <Teleport to="body">
    <Transition
      name="modal"
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        @click="handleBackdropClick"
        @keydown.esc="handleEscape"
      >
        <Transition
          name="modal-content"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isVisible"
            class="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full sm:max-w-lg mx-auto"
            @click.stop
            ref="modalContent"
          >
            <div class="text-center">
              <!-- Close button for better UX -->
              <div class="flex justify-between items-start mb-4">
                <h2
                  id="modal-title"
                  class="text-lg sm:text-xl font-semibold text-gray-900 flex-1"
                >
                  画面スリープ防止機能について
                </h2>
                <button
                  @click="handleBackdropClick"
                  :disabled="props.isProcessing"
                  class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                  type="button"
                  aria-label="モーダルを閉じる"
                >
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div 
                id="modal-description"
                class="text-gray-700 mb-6 sm:mb-8 text-left"
              >
                <p class="mb-3 sm:mb-4 text-sm sm:text-base">
                  画面スリープ防止機能は、ブラウザで本webページを表示している間だけ有効です。以下のいずれかの操作を行うと、自動的に解除されます：
                </p>
                <ul 
                  class="list-decimal list-inside space-y-2 sm:space-y-3 ml-4 text-sm sm:text-base"
                  role="list"
                >
                  <li>他のタブに切り替える</li>
                  <li>ブラウザを閉じる</li>
                  <li>他のアプリを画面の前面に表示する</li>
                </ul>
                <p class="mt-4 sm:mt-6 text-sm sm:text-base">
                  この内容を理解した上でご利用ください。
                </p>
              </div>
              
              <button
                ref="confirmButton"
                :disabled="props.isProcessing"
                :aria-label="props.isProcessing ? 'ウェイクロック処理中です' : 'ウェイクロックの説明を理解しました。機能を有効化します。'"
                :class="[
                  'w-full font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'text-sm sm:text-base',
                  'min-h-[48px] sm:min-h-[52px]', // Minimum touch target
                  props.isProcessing 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 transform hover:scale-105 active:scale-95'
                ]"
                @click="handleConfirm"
                @keydown.enter="handleConfirm"
                @keydown.space.prevent="handleConfirm"
                type="button"
              >
                <span v-if="props.isProcessing" class="flex items-center justify-center text-white">
                  <svg 
                    class="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" 
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
                <span v-else class="text-white">
                  理解した
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

interface Props {
  isVisible: boolean
  isProcessing?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalContent = ref<HTMLElement>()
const confirmButton = ref<HTMLElement>()

// Handle confirm button click
const handleConfirm = () => {
  if (props.isProcessing) {
    return
  }
  emit('confirm')
}

// Handle backdrop click (close modal)
const handleBackdropClick = () => {
  if (props.isProcessing) {
    return
  }
  emit('close')
}

// Handle escape key
const handleEscape = () => {
  if (props.isProcessing) {
    return
  }
  emit('close')
}

// Focus management for accessibility
const focusModal = async () => {
  await nextTick()
  if (confirmButton.value) {
    confirmButton.value.focus()
  }
}

// Watch for modal visibility changes to manage focus
const handleVisibilityChange = () => {
  if (props.isVisible) {
    focusModal()
  }
}

// Get all focusable elements within the modal
const getFocusableElements = (): HTMLElement[] => {
  if (!modalContent.value) return []
  
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')
  
  return Array.from(modalContent.value.querySelectorAll(focusableSelectors)) as HTMLElement[]
}

// Keyboard navigation handler
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isVisible) return
  
  const focusableElements = getFocusableElements()
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  // Tab key handling for focus trap
  if (event.key === 'Tab') {
    if (focusableElements.length === 0) {
      event.preventDefault()
      return
    }
    
    if (event.shiftKey) {
      // Shift + Tab: move to previous element
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab: move to next element
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }
  
  // Arrow key navigation for better accessibility
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const currentIndex = focusableElements.findIndex(el => el === document.activeElement)
    
    if (event.key === 'ArrowDown') {
      const nextIndex = (currentIndex + 1) % focusableElements.length
      focusableElements[nextIndex]?.focus()
    } else {
      const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
      focusableElements[prevIndex]?.focus()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  if (props.isVisible) {
    focusModal()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Watch for prop changes
import { watch } from 'vue'
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    focusModal()
  }
})
</script>

<style scoped>
/* Additional styles for better visual hierarchy */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(1rem);
}
</style>