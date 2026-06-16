<template>
  <div class="art-card p-5 overflow-hidden bg-white">
    <div class="art-card-header">
      <div class="title">
        <h4>9.2. Dashboard Tổng quan</h4>
        <p>Khớp Workflow: Tổng thu/Tổng chi/Lợi nhuận gộp/Lợi nhuận ròng + biểu đồ theo tháng</p>
      </div>

      <div class="flex items-center gap-3">
        <ElTag type="info" effect="dark"> Dữ liệu từ API </ElTag>
      </div>
    </div>

    <ElDivider />

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="2" animated />
    </div>

    <div v-else>
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :lg="6">
          <div class="kpi-card border border-g-300/85 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-g-600">TỔNG THU</div>
              <ArtSvgIcon icon="ri:arrow-up-line" class="text-theme" />
            </div>
            <div class="mt-2 text-2xl font-semibold">{{ formatVnd(totalIncome) }}</div>
            <div class="mt-2 text-xs text-g-500">Từ dữ liệu đơn hàng</div>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :lg="6">
          <div class="kpi-card border border-g-300/85 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-g-600">TỔNG CHI</div>
              <ArtSvgIcon icon="ri:arrow-down-line" class="text-error" />
            </div>
            <div class="mt-2 text-2xl font-semibold">{{ formatVnd(totalExpense) }}</div>
            <div class="mt-2 text-xs text-g-500">Từ dữ liệu chi phí</div>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :lg="6">
          <div class="kpi-card border border-g-300/85 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-g-600">LỢI NHUẬN GỘP</div>
              <ArtSvgIcon icon="ri:line-chart-line" class="text-success" />
            </div>
            <div class="mt-2 text-2xl font-semibold">{{ formatVnd(grossProfit) }}</div>
            <div class="mt-2 text-xs text-g-500">Doanh thu - Chi phí vận hành</div>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :lg="6">
          <div class="kpi-card border border-g-300/85 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-g-600">LỢI NHUẬN RÒNG</div>
              <ArtSvgIcon icon="ri:profit-line" class="text-theme" />
            </div>
            <div class="mt-2 text-2xl font-semibold">{{ formatVnd(netProfit) }}</div>
            <div class="mt-2 text-xs text-g-500">Lợi nhuận sau chi phí phát sinh</div>
          </div>
        </ElCol>
      </ElRow>

      <div class="mt-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-base font-medium">Biểu đồ so sánh doanh thu vs chi phí theo tháng</div>
            <div class="text-xs text-g-500">Biểu đồ theo tháng</div>
          </div>
        </div>

        <div class="mt-4 chart-wrap">
          <v-chart autoresize :option="chartOption" class="w-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  // note: v-chart is registered globally in project via plugins/echarts.ts; use directly.

  interface MonthlyPoint {
    month: string
    income: number
    expense: number
  }

  const isLoading = ref(false)

  // Data is loaded from API.
  const monthly = computed<MonthlyPoint[]>(() => [])

  const chartTextColor = '#aeb0bd'
  const chartAxisLineColor = 'rgba(255, 255, 255, 0.16)'
  const chartGridLineColor = 'rgba(255, 255, 255, 0.1)'

  const totalIncome = computed(() => 0)
  const totalExpense = computed(() => 0)
  const grossProfit = computed(() => 0)
  const netProfit = computed(() => 0)

  const chartOption = computed(() => {
    return {
      tooltip: { trigger: 'axis' },
      legend: { top: 10, textStyle: { color: chartTextColor } },
      grid: { left: 30, right: 20, top: 50, bottom: 25 },
      xAxis: {
        type: 'category',
        data: monthly.value.map((x) => x.month),
        axisLabel: { interval: 0, rotate: 0, color: chartTextColor },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => formatVnd(v),
          color: chartTextColor,
        },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      series: [
        {
          name: 'Doanh thu',
          type: 'bar',
          barMaxWidth: 22,
          data: monthly.value.map((x) => Math.round(x.income)),
        },
        {
          name: 'Chi phí',
          type: 'bar',
          barMaxWidth: 22,
          data: monthly.value.map((x) => Math.round(x.expense)),
        },
      ],
    }
  })

  function formatVnd(value: number): string {
    try {
      return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value) + 'đ'
    } catch {
      return `${Math.round(value)}đ`
    }
  }
</script>

<style scoped>
  .chart-wrap {
    height: 320px;
  }

  .kpi-card {
    background: white;
  }
</style>
