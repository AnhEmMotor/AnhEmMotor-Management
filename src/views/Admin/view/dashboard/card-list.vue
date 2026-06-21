<template>
  <ElRow :gutter="20" class="flex">
    <ElCol v-for="(item, index) in dataList" :key="index" :sm="12" :md="6" :lg="6">
      <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-700 text-sm">{{ item.des }}</span>
        <!-- Thay vì ArtCountTo không nhận format VNĐ, dùng div bình thường nhưng font-medium như gốc -->
        <div class="text-[26px] font-medium mt-2">{{ formatCurrency(item.num) }}</div>
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">So với tháng trước</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="[item.change >= 0 ? 'text-success' : 'text-danger']"
          >
            {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
          </span>
        </div>
        <div
          class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
        >
          <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  interface CardDataItem {
    des: string
    icon: string
    num: number
    change: number
  }

  // Dữ liệu giả lập (Mock data) cho báo cáo tài chính
  const dataList = reactive<CardDataItem[]>([
    {
      des: 'Tổng thu (Đơn hàng)',
      icon: 'ri:wallet-3-line',
      num: 1250000000,
      change: 12.5,
    },
    {
      des: 'Tổng chi (Expenses)',
      icon: 'ri:shopping-cart-2-line',
      num: 820000000,
      change: -4.2,
    },
    {
      des: 'Lợi nhuận gộp',
      icon: 'ri:funds-line',
      num: 430000000,
      change: 8.4,
    },
    {
      des: 'Lợi nhuận ròng',
      icon: 'ri:money-dollar-circle-line',
      num: 285000000,
      change: 15.2,
    },
  ])

  function formatCurrency(value: number) {
    if (value == null) return '0 đ'
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + ' tỷ đ'
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(0) + ' tr đ'
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }
</script>
