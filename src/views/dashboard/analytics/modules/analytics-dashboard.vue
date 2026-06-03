<template>
  <div class="art-card p-5 overflow-hidden bg-white">
    <div class="art-card-header">
      <div class="title">
        <h4>9.2. Dashboard Tổng quan</h4>
        <p>Khớp Workflow: Tổng thu/Tổng chi/Lợi nhuận gộp/Lợi nhuận ròng + biểu đồ theo tháng</p>
      </div>

      <div class="flex items-center gap-3">
        <ElTag :type="cacheType" effect="dark">
          Redis Cache: {{ cacheHit ? 'HIT' : 'MISS' }}
        </ElTag>
        <ElButton :loading="isLoading" :disabled="isLoading" @click="reloadMock">
          Tải lại (mock)
        </ElButton>
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
            <div class="mt-2 text-xs text-g-500">(Từ Đơn hàng - mock)</div>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :lg="6">
          <div class="kpi-card border border-g-300/85 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-g-600">TỔNG CHI</div>
              <ArtSvgIcon icon="ri:arrow-down-line" class="text-error" />
            </div>
            <div class="mt-2 text-2xl font-semibold">{{ formatVnd(totalExpense) }}</div>
            <div class="mt-2 text-xs text-g-500">(Từ Expenses - mock)</div>
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
            <div class="mt-2 text-xs text-g-500">Gross Profit - Phí phát sinh (mock)</div>
          </div>
        </ElCol>
      </ElRow>

      <div class="mt-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-base font-medium">Biểu đồ so sánh doanh thu vs chi phí theo tháng</div>
            <div class="text-xs text-g-500">Chọn chu kỳ theo mock (12 tháng)</div>
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
  const cacheHit = ref(true)
  const cacheType = computed(() => (cacheHit.value ? 'success' : 'warning'))

  const baseData = ref<MonthlyPoint[]>([
    { month: '01/2026', income: 820_000_000, expense: 420_000_000 },
    { month: '02/2026', income: 860_000_000, expense: 450_000_000 },
    { month: '03/2026', income: 900_000_000, expense: 470_000_000 },
    { month: '04/2026', income: 940_000_000, expense: 480_000_000 },
    { month: '05/2026', income: 1_020_000_000, expense: 520_000_000 },
    { month: '06/2026', income: 1_060_000_000, expense: 540_000_000 },
    { month: '07/2026', income: 1_080_000_000, expense: 560_000_000 },
    { month: '08/2026', income: 1_120_000_000, expense: 590_000_000 },
    { month: '09/2026', income: 1_150_000_000, expense: 610_000_000 },
    { month: '10/2026', income: 1_190_000_000, expense: 630_000_000 },
    { month: '11/2026', income: 1_230_000_000, expense: 650_000_000 },
    { month: '12/2026', income: 1_260_000_000, expense: 670_000_000 },
  ])

  const mockExtraFees = ref(35_000_000) // mock để tạo net profit < gross profit

  const monthly = computed(() => baseData.value)

  const totalIncome = computed(() => monthly.value.reduce((sum, x) => sum + x.income, 0))
  const totalExpense = computed(() => monthly.value.reduce((sum, x) => sum + x.expense, 0))
  const grossProfit = computed(() => totalIncome.value - totalExpense.value)
  const netProfit = computed(() => grossProfit.value - mockExtraFees.value)

  const chartOption = computed(() => {
    return {
      tooltip: { trigger: 'axis' },
      legend: { top: 10 },
      grid: { left: 30, right: 20, top: 50, bottom: 25 },
      xAxis: {
        type: 'category',
        data: monthly.value.map((x) => x.month),
        axisLabel: { interval: 0, rotate: 0 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => formatVnd(v),
        },
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

  async function reloadMock() {
    if (isLoading.value) return

    isLoading.value = true

    await new Promise((r) => setTimeout(r, 650))

    // mock cache hit/miss
    cacheHit.value = Math.random() > 0.5

    // mock mutate slightly so chart/kpi changes
    const factor = cacheHit.value ? 1.0 : 1.01
    baseData.value = baseData.value.map((p) => ({
      ...p,
      income: Math.round(p.income * factor),
      expense: Math.round(p.expense * (cacheHit.value ? 1.0 : 0.99)),
    }))

    mockExtraFees.value = cacheHit.value ? 35_000_000 : 40_000_000

    isLoading.value = false
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
