<template>
  <div class="art-card h-100 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t('admin.t47') }}</h4>
      </div>
    </div>
    <ArtBarChart
      height="calc(100% - 30px)"
      :data="revenueData"
      :xAxisData="weekDays"
      :showLegend="true"
      :showAxisLine="false"
      barWidth="18%"
    />
  </div>
</template>

<script setup lang="ts">
  interface RevenueDataItem {
    name: string
    data: number[]
  }

  const weekDays = ref([
    'tuầnmột',
    'tuầnhai',
    'tuầnba',
    'tuầnbốn',
    'tuầnnăm',
    'tuầnsáu',
    'tuầnngày'
  ])

  const revenueData = ref<RevenueDataItem[]>([
    {
      name: 'Bán hàng trực tuyến',
      data: [12, 13, 5, 15, 10, 15, 18]
    },
    {
      name: 'Bán hàng trực tiếp',
      data: [10, 11, 20, 5, 11, 13, 10]
    }
  ])
</script>
