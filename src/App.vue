<script setup>
import TheNavBar from './components/layout/TheNavBar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <TheNavBar></TheNavBar>
    <div class="flex-1 p-8 ml-84">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<style lang="css">
body {
  font-family: 'Inter Variable', sans-serif;
}
</style>
