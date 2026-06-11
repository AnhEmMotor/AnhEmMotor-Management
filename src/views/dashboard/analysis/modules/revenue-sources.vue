<template>
  <div class="art-card p-5 h-full">
    <div class="flex justify-between items-center mb-6">
      <h4 class="m-0 font-bold text-lg">NGUỒN DOANH THU</h4>
      <span class="text-sm text-gray-500">— Hôm nay</span>
    </div>

    <div class="space-y-5">
      <div v-for="(item, index) in sources" :key="index">
        <div class="flex justify-between text-sm mb-1">
          <span class="font-medium">{{ item.name }}</span>
          <span class="font-bold">{{ formatCurrency(item.amount) }}</span>
        </div>
        <ElProgress
          :percentage="calculatePercentage(item.amount)"
          :color="item.color"
          :show-text="false"
          :stroke-width="10"
        />
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-gray-100 text-center">
      <ElButton link type="primary">Xem chi tiết từng loại</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  defineProps({
    period: {
      type: String,
      default: 'today',
    },
  })

  const total = 85500000

  const sources = ref([
    { name: 'Xe máy', amount: 68000000, color: '#409eff' },
    { name: 'Phụ tùng', amount: 12000000, color: '#67c23a' },
    { name: 'Phụ kiện', amount: 3500000, color: '#e6a23c' },
    { name: 'Dịch vụ GTGT', amount: 2000000, color: '#f56c6c' },
  ])

  const calculatePercentage = (amount: number) => {
    return Number(((amount / total) * 100).toFixed(1))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }
</script>

<style scoped>
  .art-card {
    background-color: var(--art-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: var(--art-border-radius);
  }
</style>
