<template>
  <div class="w-full max-w-md mx-auto space-y-8">
    <TimerDisplay 
      :formatted-time="formattedTime"
      :session-type="state.sessionType"
    />
    <TimerControls 
      :is-running="state.isRunning"
      :is-paused="state.isPaused"
      @start="startTimer"
      @pause="pauseTimer"
      @reset="resetTimer"
    />
    <SessionInfo 
      :cycle-count="state.cycleCount"
    />
  </div>
</template>

<script setup lang="ts">
import TimerDisplay from './TimerDisplay.vue';
import TimerControls from './TimerControls.vue';
import SessionInfo from './SessionInfo.vue';
import { usePomodoro } from '../../composables/usePomodoro';

const {
  state,
  formattedTime,
  startTimer,
  pauseTimer,
  resetTimer,
} = usePomodoro();
</script>
