<template>
  <div class="text-center text-gray-500" role="status" aria-live="polite">
    <p class="text-lg tracking-wider">
      Cycle: <span class="font-bold text-gray-800">{{ cycleCount }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  cycleCount: number;
}>();

</script>
