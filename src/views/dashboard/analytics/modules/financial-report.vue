<template>
  <div class="art-card p-5 overflow-hidden">
    <div class="art-card-header">
      <div class="title">
        <h4>9.3. Bao cao Tai chinh Chi tiet</h4>
        <p>P&L va thong ke nhan vien se hien thi khi API tra ve du lieu that.</p>
      </div>
    </div>

    <ElDivider />

    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="12">
        <div class="font-medium mb-3">P&L (Profit and Loss)</div>
        <ElEmpty description="Chua co du lieu tai chinh" />
      </ElCol>

      <ElCol :xs="24" :lg="12">
        <div class="font-medium mb-3">Thong ke theo nhan vien</div>
        <ElEmpty description="Chua co du lieu nhan vien" />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'FinancialReport' })
</script>

<style scoped>
  .art-card {
    min-height: 520px;
  }
</style>
