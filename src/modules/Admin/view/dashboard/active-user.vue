<template>
  <div class="art-card h-128 p-5 box-border mb-5 max-sm:mb-4 flex flex-col">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4 class="text-lg font-bold text-gray-800 dark:text-gray-100">
          Tổng quan Nhân sự & Khách hàng
        </h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Dữ liệu nhân sự và tăng trưởng lượng khách hàng. So với tháng trước
          <span class="text-success font-semibold ml-1">+12.5%</span>
        </p>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <div class="w-full h-full" ref="chartRef"></div>
    </div>

    <div
      class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 pt-5 border-t border-gray-100"
    >
      <div
        class="flex flex-col items-center justify-center py-3 px-2 rounded-xl border shadow-sm transition-all dark:border-gray-700/50"
        :class="item.bgClass || 'bg-gray-50 dark:bg-gray-800'"
        v-for="(item, index) in list"
        :key="index"
      >
        <p
          class="text-[22px] font-bold"
          :class="item.colorClass || 'text-gray-900 dark:text-gray-100'"
        >
          {{ item.num }}
        </p>
        <p
          class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide text-center"
        >
          {{ item.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import {
  xAxisLabels,
  chartData,
  completedData,
  list,
} from "@/modules/Admin/logic/active-user";

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
      },
      formatter: function (params: any) {
        let tooltipHtml = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((item: any) => {
          let suffix = item.seriesName === "Lượt truy cập" ? " lượt" : " người";
          tooltipHtml += `${item.marker} ${item.seriesName}: <strong>${item.value}${suffix}</strong><br/>`;
        });

        if (params.length > 1) {
          const visits = params[0].value;
          const newCustomers = params[1].value;
          const rate =
            visits > 0 ? ((newCustomers / visits) * 100).toFixed(1) : 0;
          tooltipHtml += `<br/><em>Insight:</em> Tỷ lệ chuyển đổi KH: <strong class="text-success">${rate}%</strong>`;
        }
        return tooltipHtml;
      },
    },
    legend: {
      data: ["Lượt truy cập", "Khách hàng mới"],
      top: 0,
      right: 0,
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#9ca3af",
      },
    },
    grid: {
      left: "0%",
      right: "0%",
      bottom: "0%",
      top: "15%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: xAxisLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#9ca3af" },
      },
    ],
    yAxis: [
      {
        type: "value",
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "rgba(156, 163, 175, 0.2)",
          },
        },
        axisLabel: { color: "#9ca3af" },
      },
    ],
    series: [
      {
        name: "Lượt truy cập",
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 3,
          color: "#409eff",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(64, 158, 255, 0.4)" },
            { offset: 1, color: "rgba(64, 158, 255, 0.0)" },
          ]),
        },
        data: chartData,
      },
      {
        name: "Khách hàng mới",
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 3,
          color: "#67c23a",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(103, 194, 58, 0.4)" },
            { offset: 1, color: "rgba(103, 194, 58, 0.0)" },
          ]),
        },
        data: completedData,
      },
    ],
  };

  chartInstance.setOption(option);
}

function resizeChart() {
  if (chartInstance) {
    chartInstance.resize();
  }
}

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener("resize", resizeChart);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeChart);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>
