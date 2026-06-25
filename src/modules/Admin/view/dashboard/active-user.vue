<template>
  <div class="art-card h-128 p-5 box-border mb-5 max-sm:mb-4 flex flex-col">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4 class="text-lg font-bold text-gray-800">Tổng quan hoạt động xưởng</h4>
        <p class="text-sm text-gray-500 mt-1">
          Dữ liệu tiếp nhận và xử lý dịch vụ xe. So với tháng trước
          <span class="text-success font-semibold ml-1">+12.5%</span>
        </p>
      </div>
    </div>
    
    <div class="flex-1 overflow-hidden">
      <ArtBarChart
        class="box-border p-2"
        barWidth="50%"
        height="13.7rem"
        :showAxisLine="false"
        :data="chartData"
        :xAxisData="xAxisLabels"
      />
    </div>

    <div class="flex-b mt-2 pt-4 border-t border-gray-100">
      <div class="flex-1" v-for="(item, index) in list" :key="index">
        <p class="text-2xl text-g-900 font-semibold">{{ item.num }}</p>
        <p class="text-xs text-g-500 mt-1">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArtBarChart from "@/components/core/charts/art-bar-chart/index.vue";
import {
  xAxisLabels,
  chartData,
  list,
} from "@/modules/Admin/logic/active-user";
</script>
