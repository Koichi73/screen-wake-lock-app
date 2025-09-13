<template>
  <div class="space-y-12">

    <!-- Wake Lock Control Section -->
    <section aria-labelledby="wake-lock-control-section" class="max-w-md mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <WakeLockControl />
      </div>
    </section>

    <!-- Pomodoro Timer Section -->
    <section aria-labelledby="pomodoro-timer-section">
      <h2 id="pomodoro-timer-section" class="sr-only">ポモドーロタイマー</h2>
      <PomodoroTimer />
    </section>
  </div>
</template>

<script setup lang="ts">
import PomodoroTimer from '../components/pomodoro/PomodoroTimer.vue';
import WakeLockControl from '../components/controls/WakeLockControl.vue';
</script>
