<template>
  <div class="space-y-12">

    <!-- Wake Lock Control Section -->
    <section aria-labelledby="wake-lock-control-section" class="max-w-md mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <WakeLockToggle @request-wake-lock="handleWakeLockRequest" />
      </div>
    </section>
    
    <!-- Clock Display Section -->
    <section aria-labelledby="clock-section">
      <h2 id="clock-section" class="sr-only">デジタル時計</h2>
      <DigitalClock />
    </section>

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
import { ref } from 'vue';
import DigitalClock from '../components/clock/DigitalClock.vue';
import { WakeLockToggle, WarningModal } from '../components';

// Modal state management for WakeLockToggle
const showWarningModal = ref(false);
const hasShownWarning = ref(false);
const isModalProcessing = ref(false);

let pendingWakeLockRequest: (() => Promise<void>) | null = null;

const handleWakeLockRequest = async (requestCallback: () => Promise<void>) => {
  if (!hasShownWarning.value) {
    pendingWakeLockRequest = requestCallback;
    showWarningModal.value = true;
    return;
  }
  
  try {
    await requestCallback();
  } catch (error) {
    console.error('Wake lock request failed:', error);
  }
};

const handleModalConfirm = async () => {
  if (isModalProcessing.value) return;

  isModalProcessing.value = true;
  hasShownWarning.value = true;
  
  try {
    if (pendingWakeLockRequest) {
      await pendingWakeLockRequest();
    }
  } catch (error) {
    console.error('Wake lock request failed after modal confirmation:', error);
  } finally {
    showWarningModal.value = false;
    isModalProcessing.value = false;
    pendingWakeLockRequest = null;
  }
};

const handleModalClose = () => {
  showWarningModal.value = false;
  pendingWakeLockRequest = null;
};
</script>