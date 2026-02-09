<script setup>
import TheNavBar from './TheNavBar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <TheNavBar />
    <div class="flex-1 p-8 ml-84">
      <RouterView />
    </div>
  </div>
</template>
