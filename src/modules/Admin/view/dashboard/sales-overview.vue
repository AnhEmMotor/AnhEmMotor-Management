<template>
  <div class="dashboard-panel mb-5">
    <div class="panel-header">
      <div class="panel-header__left">
        <div class="panel-icon panel-icon--blue">
          <ArtSvgIcon icon="ri:bar-chart-2-line" class="text-2xl" />
        </div>
        <div>
          <h4 class="panel-title">Sức khỏe Tài chính & Hiệu suất Bán hàng</h4>
          <p class="panel-desc">Theo dõi biến động doanh thu, lợi nhuận gộp & cơ cấu ngành hàng</p>
        </div>
      </div>
      <div class="header-actions">
        <ElRadioGroup v-model="viewMode" size="small" @change="onViewChange">
          <ElRadioButton value="trend">Xu hướng 12 tháng</ElRadioButton>
          <ElRadioButton value="category">Cơ cấu doanh thu</ElRadioButton>
        </ElRadioGroup>
      </div>
    </div>

    <div v-if="isLoading" class="mt-4"><ElSkeleton :rows="4" animated /></div>
    <div v-else-if="viewMode === 'trend' && months.length === 0" class="empty-state">
      <ArtSvgIcon icon="ri:bar-chart-2-line" class="text-3xl text-gray-300 mb-2" />
      <span>Chưa có dữ liệu doanh thu & lợi nhuận trong 12 tháng</span>
    </div>
    <div v-else-if="viewMode === 'category' && categoryData.length === 0" class="empty-state">
      <ArtSvgIcon icon="ri:pie-chart-line" class="text-3xl text-gray-300 mb-2" />
      <span>Chưa có dữ liệu phân loại cơ cấu ngành hàng</span>
    </div>
    <div v-else class="chart-content">
      <div v-show="viewMode === 'trend'" class="chart-wrap" ref="trendChartRef"></div>
      <div v-show="viewMode === 'category'" class="chart-wrap" ref="pieChartRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import {
  fetchMonthlyRevenueProfit,
  fetchRevenueByCategory,
  type MonthlyRevenueProfit,
} from '@/api/dashboard.api';

const viewMode = ref<'trend' | 'category'>('trend');
const trendChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);

let trendChartInstance: echarts.ECharts | null = null;
let pieChartInstance: echarts.ECharts | null = null;

const isLoading = ref(false);
const months = ref<string[]>([]);
const revenueData = ref<number[]>([]);
const profitData = ref<number[]>([]);
const categoryData = ref<{ name: string; value: number; percent: number }[]>([]);

const MILLION_VND = 1_000_000;

async function fetchData() {
  isLoading.value = true;
  try {
    const [monthlyRes, categoryRes] = await Promise.all([
      fetchMonthlyRevenueProfit(12).catch(() => []),
      fetchRevenueByCategory('', '').catch(() => []),
    ]);

    if (monthlyRes && monthlyRes.length > 0) {
      months.value = monthlyRes.map((item: MonthlyRevenueProfit) => {
        const d = new Date(item.reportMonth);
        return `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
      });
      revenueData.value = monthlyRes.map((item: MonthlyRevenueProfit) => item.totalRevenue ?? 0);
      profitData.value = monthlyRes.map((item: MonthlyRevenueProfit) => item.totalProfit ?? 0);
    } else {
      months.value = [];
      revenueData.value = [];
      profitData.value = [];
    }

    if (categoryRes && categoryRes.length > 0) {
      categoryData.value = categoryRes.map((item: any) => ({
        name: item.categoryName || 'Khác',
        value: item.revenue || 0,
        percent: item.percentage || 0,
      }));
    } else {
      categoryData.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch sales overview data:', error);
  } finally {
    isLoading.value = false;
  }
}

function initTrendChart() {
  if (!trendChartRef.value) return;
  if (!trendChartInstance) trendChartInstance = echarts.init(trendChartRef.value);

  trendChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#111827' },
      formatter(params: any) {
        let html = `<div style="font-weight:700;margin-bottom:6px">${params[0].name}</div>`;
        params.forEach((p: any) => {
          const val = (p.value / MILLION_VND).toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          });
          html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            ${p.marker}<span>${p.seriesName}:</span><strong>${val} triệu VNĐ</strong>
          </div>`;
        });
        const rev = params[0]?.value ?? 0;
        const prf = params[1]?.value ?? 0;
        const margin = rev > 0 ? ((prf / rev) * 100).toFixed(1) : '0';
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #eee;color:#4b5563;font-size:12px">Biên lợi nhuận gộp: <strong style="color:#10b981">${margin}%</strong></div>`;
        return html;
      },
    },
    legend: {
      data: ['Doanh thu', 'Lợi nhuận gộp'],
      bottom: 0,
      icon: 'circle',
      textStyle: { color: '#6b7280', fontSize: 12 },
    },
    grid: { left: '2%', right: '2%', bottom: '12%', top: '6%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: months.value,
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Triệu VNĐ',
        nameTextStyle: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: 'rgba(156,163,175,0.25)' } },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11,
          formatter: (v: number) =>
            (v / MILLION_VND).toLocaleString('vi-VN', { maximumFractionDigits: 1 }),
        },
      },
    ],
    series: [
      {
        name: 'Doanh thu',
        type: 'bar',
        barGap: '15%',
        barMaxWidth: 24,
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
        barMaxWidth: 24,
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

function initPieChart() {
  if (!pieChartRef.value) return;
  if (!pieChartInstance) pieChartInstance = echarts.init(pieChartRef.value);

  pieChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const val = (params.value / MILLION_VND).toLocaleString('vi-VN', {
          maximumFractionDigits: 1,
        });
        return `<strong>${params.name}</strong><br/>${params.marker} Doanh số: ${val} tr VNĐ (${params.percent}%)`;
      },
    },
    legend: {
      orient: 'vertical',
      right: '8%',
      top: 'center',
      icon: 'circle',
      textStyle: { color: '#4b5563', fontSize: 13 },
    },
    color: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'],
    series: [
      {
        name: 'Cơ cấu ngành hàng',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
          },
        },
        labelLine: { show: false },
        data: categoryData.value,
      },
    ],
  });
}

function onViewChange() {
  nextTick(() => {
    if (viewMode.value === 'trend') {
      initTrendChart();
      trendChartInstance?.resize();
    } else {
      initPieChart();
      pieChartInstance?.resize();
    }
  });
}

function resizeAll() {
  trendChartInstance?.resize();
  pieChartInstance?.resize();
}

onMounted(() => {
  nextTick(() => {
    fetchData().then(() => {
      initTrendChart();
      window.addEventListener('resize', resizeAll);
    });
  });
});

onUnmounted(() => {
  trendChartInstance?.dispose();
  pieChartInstance?.dispose();
  window.removeEventListener('resize', resizeAll);
});
</script>

<style scoped lang="scss">
.dashboard-panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;

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

  &--blue {
    background: rgb(59 130 246 / 12%);
    color: #3b82f6;
  }
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

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-wrap {
  width: 100%;
  min-height: 290px;
  flex: 1;
}

.empty-state {
  flex: 1;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}
</style>
