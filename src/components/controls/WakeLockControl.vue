<template>
  <WakeLockToggle @request-wake-lock="handleWakeLockRequest" />
  <WarningModal 
    :is-visible="showWarningModal"
    :is-processing="isModalProcessing"
    @confirm="handleModalConfirm"
    @close="handleModalClose"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WakeLockToggle, WarningModal } from '..';

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
