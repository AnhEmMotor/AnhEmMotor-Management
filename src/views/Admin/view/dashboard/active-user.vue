<template>
  <div class="art-card h-128 p-4 box-border mb-5 max-sm:mb-4">
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
  import ArtBarChart from '@/components/core/charts/art-bar-chart/index.vue'
  import { xAxisLabels, chartData, list } from '@/views/Admin/logic/active-user'
</script>
