<template>
  <div class="flex items-center justify-center space-x-4">
    <!-- Start/Pause/Resume Button -->
    <button 
      @click="handlePrimaryClick" 
      class="px-8 py-3 text-lg font-semibold rounded-lg text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      :class="primaryButtonClass"
      aria-live="polite"
    >
      {{ primaryButtonText }}
    </button>

    <!-- Reset Button -->
    <button 
      @click="emit('reset')" 
      class="px-8 py-3 text-lg font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      :disabled="!isRunning && !isPaused"
      aria-label="タイマーをリセットします"
    >
      Reset
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isRunning: boolean;
  isPaused: boolean;
}>();

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'pause'): void;
  (e: 'reset'): void;
}>();

const primaryButtonText = computed(() => {
  if (!props.isRunning) return 'Start';
  if (props.isPaused) return 'Resume';
  return 'Pause';
});

const primaryButtonClass = computed(() => {
  // Returns Tailwind CSS classes based on the button's state
  if (!props.isRunning) {
    return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'; // Start
  }
  if (props.isPaused) {
    return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'; // Resume
  }
  return 'bg-red-500 hover:bg-red-600 focus:ring-red-500'; // Pause
});

const handlePrimaryClick = () => {
  if (!props.isRunning || props.isPaused) {
    emit('start');
  } else {
    emit('pause');
  }
};
</script>
