<template>
<div class="min-h-screen">
<!-- Render the customer manager component which contains the whole site UI -->
<CustomerManager />
</div>
</template>


<script setup>
import CustomerManager from './components/customer/CustomerManager.vue'
</script>


<style>
/* Keep global font and background like original */
body {
font-family: 'Inter', sans-serif;
background-color: #f9fafb;
color: #1f2937;
}
</style>