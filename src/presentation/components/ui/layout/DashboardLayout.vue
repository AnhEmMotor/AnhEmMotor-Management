<script setup>
import TheNavBar from './TheNavBar.vue'
import { useNotifications } from '@composables/useNotifications'

// Initialize real-time notifications
useNotifications()
</script>

<template>
  <div class="flex min-h-screen">
    <TheNavBar />
    <div class="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 pt-20 lg:pt-8 transition-all duration-300">
      <RouterView />
    </div>
  </div>
</template>

