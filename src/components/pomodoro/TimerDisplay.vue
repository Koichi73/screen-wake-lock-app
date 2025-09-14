<template>
  <div 
    class="flex flex-col items-center justify-center p-8 rounded-lg transition-colors duration-500"
    :class="sessionClass"
  >
    <div 
      class="text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-wider"
      aria-live="polite"
      aria-atomic="true"
      role="timer"
    >
      {{ formattedTime }}
    </div>
    <div class="mt-4 text-xl sm:text-2xl font-semibold uppercase tracking-widest">
      {{ sessionType }}
    </div>
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ sessionAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type SessionType = 'work' | 'break';

const props = defineProps<{
  formattedTime: string;
  sessionType: SessionType;
}>();

const sessionClass = computed(() => {
  // Using Tailwind CSS classes for background and text colors based on session type
  return props.sessionType === 'work'
    ? 'bg-blue-50 text-blue-900'
    : 'bg-green-50 text-green-900';
});

const sessionAnnouncement = computed(() => {
  return props.sessionType === 'work' ? '作業セッション' : '休憩セッション';
});
</script>
