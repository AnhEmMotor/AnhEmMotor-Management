<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header mb-6">
      <div class="title">
        <h4 class="text-lg font-bold text-gray-800 dark:text-gray-100">
          Biểu đồ so sánh doanh thu và chi phí theo từng tháng
        </h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Lợi nhuận gộp theo từng tháng
        </p>
      </div>
    </div>
    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="2" animated />
    </div>
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
const expenseData = ref<number[]>([]);

async function fetchData() {
  isLoading.value = true;
  try {
    const data = await fetchMonthlyRevenueProfit(12);
    months.value = data.map((item: MonthlyRevenueProfit) => {
      const date = new Date(item.reportMonth);
      return `Tháng ${date.getMonth() + 1}`;
    });
    revenueData.value = data.map(
      (item: MonthlyRevenueProfit) => item.totalRevenue,
    );
    // Expense = Revenue - Profit (Gross Profit)
    expenseData.value = data.map(
      (item: MonthlyRevenueProfit) => item.totalRevenue - item.totalProfit,
    );
  } catch (error) {
    console.error("Failed to fetch monthly revenue profit:", error);
  } finally {
    isLoading.value = false;
  }
}

function initChart() {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params: any) {
        let tooltipHtml = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          const valueInBillions = (param.value / 1e9).toFixed(2);
          tooltipHtml += `${param.marker} ${param.seriesName}: <strong>${valueInBillions} tỷ VNĐ</strong><br/>`;
        });
        // Tính lợi nhuận
        const revenue = params[0].value;
        const expense = params[1].value;
        const profit = revenue - expense;
        const profitInBillions = (profit / 1e9).toFixed(2);
        tooltipHtml += `<br/>Lợi nhuận gộp: <strong>${profitInBillions} tỷ VNĐ</strong>`;
        return tooltipHtml;
      },
    },
    legend: {
      data: ["Tổng thu (Doanh thu)", "Tổng chi (Giá vốn)"],
      bottom: 0,
      textStyle: {
        color: "#9ca3af",
      },
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
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          color: "#9ca3af",
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Tỷ VNĐ",
        nameTextStyle: {
          color: "#9ca3af",
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "rgba(156, 163, 175, 0.2)",
          },
        },
        axisLabel: {
          color: "#9ca3af",
          formatter: function (value: number) {
            return (value / 1e9).toFixed(1);
          },
        },
      },
    ],
    series: [
      {
        name: "Tổng thu (Doanh thu)",
        type: "bar",
        barGap: 0,
        emphasis: {
          focus: "series",
        },
        itemStyle: {
          color: "#409eff",
          borderRadius: [4, 4, 0, 0],
        },
        data: revenueData.value,
      },
      {
        name: "Tổng chi (Giá vốn)",
        type: "bar",
        emphasis: {
          focus: "series",
        },
        itemStyle: {
          color: "#f56c6c",
          borderRadius: [4, 4, 0, 0],
        },
        data: expenseData.value,
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
    fetchData().then(() => {
      // Init chart after data loaded
      if (chartRef.value) {
        initChart();
        window.addEventListener("resize", resizeChart);
      }
    });
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener("resize", resizeChart);
});
</script>
