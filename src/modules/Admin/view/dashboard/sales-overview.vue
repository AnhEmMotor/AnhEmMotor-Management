<template>
  <div class="resp-page art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header mb-6">
      <div class="title">
        <h4 class="text-lg font-bold text-gray-800 dark:text-gray-100">
          Doanh thu va Lợi nhuận gộp theo tung thang
        </h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          So sanh doanh thu va Lợi nhuận gộp
        </p>
      </div>
    </div>
    <div v-if="isLoading" class="mt-4"><ElSkeleton :rows="2" animated /></div>
    <div v-else class="h-[calc(100%-80px)]" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import {
  fetchMonthlyRevenueProfit,
  type MonthlyRevenueProfit,
} from "@/api/dashboard.api";

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const isLoading = ref(false);

const months = ref<string[]>([]);
const revenueData = ref<number[]>([]);
const profitData = ref<number[]>([]);

async function fetchData() {
  isLoading.value = true;
  try {
    const data = await fetchMonthlyRevenueProfit(12);
    months.value = data.map((item: MonthlyRevenueProfit) => {
      const date = new Date(item.reportMonth);
      return `Thang ${date.getMonth() + 1}`;
    });
    revenueData.value = data.map(
      (item: MonthlyRevenueProfit) => item.totalRevenue,
    );
    profitData.value = data.map(
      (item: MonthlyRevenueProfit) => item.totalProfit,
    );
  } catch (error) {
    console.error("Failed to fetch monthly revenue profit:", error);
  } finally {
    isLoading.value = false;
  }
}

function initChart() {
  if (!chartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter(params: any) {
        let html = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((p: any) => {
          html += `${p.marker} ${p.seriesName}: <strong>${(p.value / 1e9).toFixed(2)} ty VND</strong><br/>`;
        });
        const rev = params[0].value;
        const prf = params[1].value;
        html += `<br/>Bien bien: <strong>${rev > 0 ? ((prf / rev) * 100).toFixed(1) : 0}%</strong>`;
        return html;
      },
    },
    legend: {
      data: ["Doanh thu", "Lợi nhuận gộp"],
      bottom: 0,
      textStyle: { color: "#9ca3af" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: months.value,
        axisTick: { alignWithLabel: true },
        axisLabel: { color: "#9ca3af" },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Ty VND",
        nameTextStyle: { color: "#9ca3af" },
        splitLine: {
          lineStyle: { type: "dashed", color: "rgba(156,163,175,0.2)" },
        },
        axisLabel: {
          color: "#9ca3af",
          formatter: (v: number) => (v / 1e9).toFixed(1),
        },
      },
    ],
    series: [
      {
        name: "Doanh thu",
        type: "bar",
        barGap: 0,
        emphasis: { focus: "series" },
        itemStyle: { color: "#409eff", borderRadius: [4, 4, 0, 0] },
        data: revenueData.value,
      },
      {
        name: "Lợi nhuận gộp",
        type: "bar",
        emphasis: { focus: "series" },
        itemStyle: { color: "#67c23a", borderRadius: [4, 4, 0, 0] },
        data: profitData.value,
      },
    ],
  };
  chartInstance.setOption(option);
}

function resizeChart() {
  chartInstance?.resize();
}

onMounted(() => {
  nextTick(() => {
    fetchData().then(() => {
      if (chartRef.value) initChart();
      window.addEventListener("resize", resizeChart);
    });
  });
});

onUnmounted(() => {
  if (chartInstance) chartInstance.dispose();
  window.removeEventListener("resize", resizeChart);
});
</script>
