<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavigation 
      :current-page-title="currentTitle" 
      :show-back-button="showBackButton"
    />
    <main class="py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNavigation from './components/layout/AppNavigation.vue';

const route = useRoute();

// The title for the current page is derived from the route's meta information.
const currentTitle = computed(() => route.meta.title as string || '画面スリープ防止アプリ');

// The back button is shown if the route's meta information indicates it.
const showBackButton = computed(() => route.meta.showBackButton as boolean || false);

</script>