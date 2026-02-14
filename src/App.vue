<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import GlobalConfirmation from './components/ui/confirm_modal/GlobalConfirmationModal.vue'
import AppLoadingScreen from './components/ui/AppLoadingScreen.vue'
import { useAuthStore } from './stores/useAuthStore'

const authStore = useAuthStore()
const router = useRouter()
const isRouterReady = ref(false)

onMounted(async () => {
  await router.isReady()
  isRouterReady.value = true
})
</script>

<template>
  <AppLoadingScreen v-if="!authStore.isInitialized || !isRouterReady" />
  <RouterView v-else />
  <VueQueryDevtools />
  <GlobalConfirmation />
</template>

<style lang="css">
body {
  font-family: 'Inter Variable', sans-serif;
}
</style>
