<template>
  <div class="max-w-md mx-auto">
    <!-- Main Card -->
    <div 
      class="bg-white rounded-xl shadow-lg p-6 sm:p-8"
      role="region"
      aria-labelledby="app-title"
    >
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 
          id="app-title"
          class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
        >
          画面スリープ防止アプリ
        </h1>
        <p 
          class="text-gray-600 text-sm sm:text-base"
        >
          画面をスリープさせずに表示を維持します
        </p>
      </header>
      
      <!-- Wake Lock Toggle Component -->
      <section 
        aria-labelledby="wake-lock-section"
        class="mb-8"
      >
        <h2 id="wake-lock-section" class="sr-only">ウェイクロック制御</h2>
        <WakeLockControl />
      </section>
      
      <!-- Info Section -->
      <footer class="mt-8 pt-6 border-t border-gray-200">
        <div class="text-center">
          <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
            このアプリケーションはお使いのデバイスの画面が<br class="hidden sm:inline">
            自動的にスリープするのを防ぎます。
          </p>
        </div>
      </footer>
    </div>

    <!-- Feature Selection -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4 text-center">追加機能</h2>
      <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <router-link 
          to="/clock"
          class="block p-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="時計機能ページへ移動"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-bold text-gray-900">時計表示</h3>
              <p class="text-sm text-gray-600 mt-1">時刻を常に表示し、画面のスリープを防ぎます。</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { WakeLockControl } from '../components';
</script>