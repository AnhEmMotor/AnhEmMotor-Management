<template>
  <div class="art-card p-5 overflow-hidden bg-white">
    <div class="art-card-header">
      <div class="title">
        <h4>9.1. Quan ly Chi phi van hanh</h4>
        <p>Du lieu chi phi se hien thi khi API tra ve du lieu that.</p>
      </div>
    </div>

    <ElDivider />

    <ElEmpty description="Chua co du lieu chi phi" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ExpenseManagement" });
</script>

<style scoped>
.art-card {
  min-height: 520px;
}
</style>
