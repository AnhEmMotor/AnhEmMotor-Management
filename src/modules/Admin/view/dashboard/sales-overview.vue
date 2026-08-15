<template>
  <div class="dashboard-panel mb-5">
    <div class="panel-header">
      <div class="panel-header__left">
        <div class="panel-icon panel-icon--blue">
          <ArtSvgIcon icon="ri:bar-chart-2-line" class="text-2xl" />
        </div>
        <div>
          <h4 class="panel-title">Doanh thu & Lợi nhuận gộp</h4>
          <p class="panel-desc">So sánh theo từng tháng trong 12 tháng gần nhất</p>
        </div>
      </div>
      <div class="chart-legend">
        <span class="legend-dot legend-dot--blue"></span><span>Doanh thu</span>
        <span class="legend-dot legend-dot--green"></span><span>Lợi nhuận</span>
      </div>
    </div>

    <div v-if="isLoading" class="mt-4"><ElSkeleton :rows="3" animated /></div>
    <div v-else class="chart-wrap" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { fetchMonthlyRevenueProfit, type MonthlyRevenueProfit } from '@/api/dashboard.api';

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
      const d = new Date(item.reportMonth);
      return `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
    });
    revenueData.value = data.map((item: MonthlyRevenueProfit) => item.totalRevenue);
    profitData.value  = data.map((item: MonthlyRevenueProfit) => item.totalProfit);
  } catch (error) {
    console.error('Failed to fetch monthly revenue profit:', error);
  } finally {
    isLoading.value = false;
  }
}

function initChart() {
  if (!chartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(chartRef.value);

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#111827' },
      formatter(params: any) {
        let html = `<div style="font-weight:600;margin-bottom:6px">${params[0].name}</div>`;
        params.forEach((p: any) => {
          const val = (p.value / 1e9).toFixed(2);
          html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            ${p.marker}<span>${p.seriesName}:</span><strong>${val} tỷ VNĐ</strong>
          </div>`;
        });
        const rev = params[0]?.value ?? 0;
        const prf = params[1]?.value ?? 0;
        const margin = rev > 0 ? ((prf / rev) * 100).toFixed(1) : '0';
        html += `<div style="margin-top:6px;color:#6b7280;font-size:12px">Biên lợi nhuận: <strong style="color:#10b981">${margin}%</strong></div>`;
        return html;
      },
    },
    grid: { left: '2%', right: '2%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: [{
      type: 'category',
      data: months.value,
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
    }],
    yAxis: [{
      type: 'value',
      name: 'Tỷ VNĐ',
      nameTextStyle: { color: '#9ca3af', fontSize: 11 },
      splitLine: { lineStyle: { type: 'dashed', color: 'rgba(156,163,175,0.25)' } },
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => (v / 1e9).toFixed(1) },
    }],
    series: [
      {
        name: 'Doanh thu',
        type: 'bar',
        barGap: '5%',
        barMaxWidth: 28,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#60a5fa' },
            { offset: 1, color: '#3b82f6' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: { focus: 'series' },
        data: revenueData.value,
      },
      {
        name: 'Lợi nhuận gộp',
        type: 'bar',
        barMaxWidth: 28,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#34d399' },
            { offset: 1, color: '#10b981' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: { focus: 'series' },
        data: profitData.value,
      },
    ],
  });
}

function resizeChart() { chartInstance?.resize(); }

onMounted(() => {
  nextTick(() => {
    fetchData().then(() => {
      if (chartRef.value) initChart();
      window.addEventListener('resize', resizeChart);
    });
  });
});

onUnmounted(() => {
  if (chartInstance) chartInstance.dispose();
  window.removeEventListener('resize', resizeChart);
});
</script>

<style scoped lang="scss">
.dashboard-panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;

  &--blue { background: rgba(59,130,246,0.12); color: #3b82f6; }
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 2px;
}

.panel-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
  margin-left: 8px;

  &--blue  { background: #3b82f6; }
  &--green { background: #10b981; }
}

.chart-wrap {
  flex: 1;
  min-height: 280px;
}
</style>
