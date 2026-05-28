<template>
  <div class="art-card h-105 p-4 box-border mb-5 max-sm:mb-4">
    <ArtBarChart
      class="box-border p-2"
      barWidth="50%"
      height="13.7rem"
      :showAxisLine="false"
      :data="chartData"
      :xAxisData="xAxisLabels"
    />
    <div class="ml-1">
      <h3 class="mt-5 text-lg font-medium">{{ $t('admin.t52') }}</h3>
      <p class="mt-1 text-sm"
        >{{ $t('admin.t53') }}<span class="text-success font-medium">+23%</span></p
      >
      <p class="mt-1 text-sm">{{ $t('admin.t54') }}</p>
    </div>
    <div class="flex-b mt-2">
      <div class="flex-1" v-for="(item, index) in list" :key="index">
        <p class="text-2xl text-g-900">{{ item.num }}</p>
        <p class="text-xs text-g-500">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface UserStatItem {
    name: string
    num: string
  }

  const xAxisLabels = [
    '1tháng',
    '2tháng',
    '3tháng',
    '4tháng',
    '5tháng',
    '6tháng',
    '7tháng',
    '8tháng',
    '9tháng'
  ]

  const chartData = [160, 100, 150, 80, 190, 100, 175, 120, 160]

  const list: UserStatItem[] = [
    { name: 'tổngNguoiDunglượng', num: '32k' },
    { name: 'tổngLượt truy cập', num: '128k' },
    { name: 'ngàyLượt truy cập', num: '1.2k' },
    { name: 'tuầncùngso sánh', num: '+5%' }
  ]
</script>
