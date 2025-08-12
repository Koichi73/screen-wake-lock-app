<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">WarningModal Demo</h1>
    
    <button
      @click="showModal = true"
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
    >
      Show Warning Modal
    </button>
    
    <WarningModal
      :is-visible="showModal"
      @confirm="handleConfirm"
      @close="handleClose"
    />
    
    <div v-if="confirmed" class="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
      Modal confirmed! Wake lock can now be enabled.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WarningModal from './WarningModal.vue'

const showModal = ref(false)
const confirmed = ref(false)

const handleConfirm = () => {
  showModal.value = false
  confirmed.value = true
  console.log('Modal confirmed - wake lock can be enabled')
}

const handleClose = () => {
  showModal.value = false
  console.log('Modal closed without confirmation')
}
</script>