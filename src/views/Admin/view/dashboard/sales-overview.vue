<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header mb-6">
      <div class="title">
        <h4 class="text-lg font-bold text-gray-800">
          Biểu đồ so sánh doanh thu và chi phí theo từng tháng
        </h4>
        <p class="text-sm text-gray-500 mt-1">
          Lợi nhuận ròng tăng trưởng
          <span class="text-success font-semibold">+15%</span> trong năm nay
        </p>
      </div>
    </div>
    <div class="h-[calc(100%-80px)]" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Mock data cho báo cáo tài chính
const months = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const revenueData = [
  120, 150, 180, 200, 250, 210, 190, 230, 260, 280, 310, 350,
]; // Tỷ đồng
const expenseData = [90, 110, 130, 140, 160, 150, 140, 170, 180, 200, 210, 240]; // Tỷ đồng

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params: any) {
        let tooltipHtml = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          tooltipHtml += `${param.marker} ${param.seriesName}: <strong>${param.value} Tỷ VNĐ</strong><br/>`;
        });
        // Tính lợi nhuận
        const profit = params[0].value - params[1].value;
        tooltipHtml += `<br/>Lợi nhuận ròng: <strong>${profit.toFixed(1)} Tỷ VNĐ</strong>`;
        return tooltipHtml;
      },
    },
    legend: {
      data: ["Tổng thu (Doanh thu)", "Tổng chi (Chi phí)"],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "5%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: months,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Tỷ VNĐ",
        axisLabel: {
          formatter: "{value}",
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
        data: revenueData,
      },
      {
        name: "Tổng chi (Chi phí)",
        type: "bar",
        emphasis: {
          focus: "series",
        },
        itemStyle: {
          color: "#f56c6c",
          borderRadius: [4, 4, 0, 0],
        },
        data: expenseData,
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
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener("resize", resizeChart);
});
</script>
