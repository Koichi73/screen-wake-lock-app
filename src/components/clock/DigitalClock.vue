<template>
  <div class="text-center">
    <p 
      class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-11xl font-bold font-mono text-gray-900 tracking-wider"
      aria-live="polite"
      aria-atomic="true"
      aria-label="現在の時刻"
    >
      {{ formattedTime }}
    </p>
    <p 
      class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl text-gray-500 mt-2"
      aria-label="現在の日付"
    >
      {{ formattedDate }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useClock } from '../../composables/useClock';

const { formattedTime, formattedDate } = useClock();
</script>
