<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import GlobalConfirmation from './components/ui/confirm_modal/GlobalConfirmationModal.vue'
</script>

<template>
  <RouterView />
  <VueQueryDevtools />
  <GlobalConfirmation />
</template>

<style lang="css">
body {
  font-family: 'Inter Variable', sans-serif;
}
</style>
