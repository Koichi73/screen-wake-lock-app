<template>
  <div class="space-y-12">

    <!-- Wake Lock Control Section -->
    <section aria-labelledby="wake-lock-control-section" class="max-w-md mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <WakeLockControl />
      </div>
    </section>
    
    <!-- Clock Display Section -->
    <section aria-labelledby="clock-section">
      <h2 id="clock-section" class="sr-only">デジタル時計</h2>
      <DigitalClock />
    </section>

  </div>
</template>

<script setup lang="ts">
import DigitalClock from '../components/clock/DigitalClock.vue';
import { WakeLockControl } from '../components';
</script>
