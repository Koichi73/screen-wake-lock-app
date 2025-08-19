<template>
  <header class="bg-white shadow-sm sticky top-0 z-10">
    <div class="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex-1 min-w-0">
          <button 
            v-if="showBackButton" 
            @click="goBack"
            class="-ml-2 p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition"
            aria-label="前のページに戻る"
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div class="flex-1 min-w-0 text-center">
          <h1 class="text-lg font-medium text-gray-900 truncate">
            {{ currentPageTitle }}
          </h1>
        </div>
        <div class="flex-1"></div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineProps({
  showBackButton: {
    type: Boolean,
    default: false,
  },
  currentPageTitle: {
    type: String,
    default: '画面スリープ防止アプリ',
  },
});

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>
