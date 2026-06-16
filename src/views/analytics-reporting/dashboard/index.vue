<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Tổng quan điều hành"
      description="Theo dõi doanh thu, lợi nhuận, đơn hàng và cảnh báo tồn kho trong cùng một màn hình."
      icon="ri:dashboard-3-line"
    >
      <template #actions>
        <ReportPeriodSwitcher
          v-model="currentPeriod"
          v-model:start-date="periodStart"
          v-model:end-date="periodEnd"
          @update:modelValue="onPeriodChange"
        />
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Doanh thu thực tế"
        :count="formatCurrency(summary.todayRevenue)"
        :description="`${summary.revenueChangePercentage >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(summary.revenueChangePercentage).toFixed(1)}% so với hôm qua`"
        icon="ri:money-dollar-circle-line"
        :icon-style="summary.revenueChangePercentage < 0 ? 'bg-report-red-dark' : 'bg-report-red'"
      />
      <ArtStatsCard
        title="Lợi nhuận ròng"
        :count="formatCurrency(summary.todayProfit)"
        :description="`Tháng này: ${formatCurrency(summary.monthlyProfit)}`"
        icon="ri:line-chart-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Đơn hàng chờ xử lý"
        :count="summary.pendingOrdersCount"
        :description="`Quá hạn: ${summary.overdueOrdersCount}`"
        icon="ri:timer-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Cảnh báo tồn kho"
        :count="summary.lowStockCount"
        description="Sản phẩm cần kiểm tra tồn kho"
        icon="ri:alarm-warning-line"
        :icon-style="summary.lowStockCount > 0 ? 'bg-report-red-dark' : 'bg-report-gray'"
      />
    </div>

    <div class="reporting-section-grid three-columns mt-4">
      <ElCard class="reporting-card lg:col-span-2">
        <template #header>Biểu đồ doanh thu theo chu kỳ</template>
        <div ref="revenueChartRef" class="reporting-chart"></div>
      </ElCard>

      <ElCard class="reporting-card">
        <template #header>Tóm tắt mục tiêu tháng</template>
        <div class="space-y-4 text-sm">
          <div class="flex justify-between gap-4">
            <span class="reporting-muted">Doanh thu tháng:</span>
            <strong>{{ formatCurrency(summary.monthlyRevenue) }}</strong>
          </div>
          <div class="flex justify-between gap-4">
            <span class="reporting-muted">Tháng trước:</span>
            <strong>{{ formatCurrency(summary.lastMonthRevenue) }}</strong>
          </div>
          <div class="flex justify-between gap-4 border-t border-slate-100 pt-3">
            <span>Xe bán tháng này:</span>
            <strong class="text-primary">{{ summary.monthlyVehiclesSold }}</strong>
          </div>
          <div class="flex justify-between gap-4">
            <span class="reporting-muted">Tổng SKU:</span>
            <strong>{{ summary.totalSKUCount }}</strong>
          </div>
          <div class="flex justify-between gap-4">
            <span class="reporting-muted">Khách hàng mới:</span>
            <strong>{{ summary.newCustomersCount }}</strong>
          </div>
        </div>
      </ElCard>
    </div>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Phân bổ doanh thu theo thương hiệu</template>
        <div ref="brandChartRef" class="reporting-chart"></div>
      </ElCard>

      <ElCard class="reporting-card">
        <template #header>Top sản phẩm bán chạy</template>
        <ElTable
          :data="summary.topSellingProducts.slice(0, 5)"
          class="reporting-table"
          empty-text="Chưa có dữ liệu"
        >
          <ElTableColumn prop="productName" label="Sản phẩm" min-width="180" />
          <ElTableColumn prop="unitsSold" label="Đã bán" width="110" align="right" />
          <ElTableColumn prop="revenue" label="Doanh thu" min-width="150" align="right">
            <template #default="{ row }">{{ formatCurrency(row.revenue) }}</template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Đơn hàng gần đây</template>
      <ElTable :data="recentOrders" class="reporting-table" empty-text="Chưa có dữ liệu">
        <ElTableColumn label="Mã đơn" min-width="120">
          <template #default="{ row }">{{ row.orderCode || `#${row.id}` }}</template>
        </ElTableColumn>
        <ElTableColumn prop="buyerName" label="Khách hàng" min-width="180" />
        <ElTableColumn prop="totalAmount" label="Số tiền" min-width="150" align="right">
          <template #default="{ row }">{{ formatCurrency(row.totalAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="statusId" label="Trạng thái" min-width="130">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ row.statusId || '-' }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="Thời gian" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue'
  import * as echarts from 'echarts'
  import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue'
  import { statisticsApi } from '@/infrastructure/api/statistics.api'
  import type * as Statistical from '@/types/api/statistical'
  import ReportPageHeader from '../components/ReportPageHeader.vue'
  import ReportPeriodSwitcher from '../components/ReportPeriodSwitcher.vue'

  const revenueChartRef = ref<HTMLElement | null>(null)
  const brandChartRef = ref<HTMLElement | null>(null)
  let revenueChart: echarts.ECharts | null = null
  let brandChart: echarts.ECharts | null = null
  const chartTextColor = '#aeb0bd'
  const chartAxisLineColor = 'rgba(255, 255, 255, 0.16)'
  const chartGridLineColor = 'rgba(255, 255, 255, 0.1)'

  const currentPeriod = ref<'today' | 'month' | 'year' | 'custom'>('today')
  const periodStart = ref('')
  const periodEnd = ref('')

  const summary = ref<Statistical.DashboardStatsResponse>({
    todayRevenue: 0,
    revenueChangePercentage: 0,
    monthlyRevenue: 0,
    todayProfit: 0,
    monthlyProfit: 0,
    lastMonthRevenue: 0,
    lastMonthProfit: 0,
    total7dRevenue: 0,
    total7dProfit: 0,
    bestDayRevenue: 0,
    overdueOrdersCount: 0,
    lowStockCount: 0,
    overstockCount: 0,
    overdueDebtAmount: 0,
    todayVehiclesSold: 0,
    monthlyVehiclesSold: 0,
    currentInventoryCount: 0,
    totalSKUCount: 0,
    brandDistribution: [],
    activeInstallmentCount: 0,
    lateInstallmentCount: 0,
    totalCustomerDebt: 0,
    topSellingProducts: [],
    brandRevenueDistribution: [],
    todayActivities: [],
    pendingOrdersCount: 0,
    newCustomersCount: 0,
  })
  const recentOrders = ref<Statistical.RecentOrderResponse[]>([])
  const dailyRevenue = ref<Statistical.DailyRevenueResponse[]>([])

  function onPeriodChange() {
    // TODO: Pass period params to API when backend supports it
    // Expected: GET /api/v1/Statistics/dashboard-overview?period=...&start=...&end=...
    loadData()
  }

  async function loadData() {
    try {
      const res = await statisticsApi.getDashboardOverview()
      summary.value = res.summary
      recentOrders.value = res.recentOrders.slice(0, 10)
      dailyRevenue.value = res.dailyRevenue
      updateCharts()
    } catch (e) {
      console.error('Failed to load dashboard overview:', e)
    }
  }

  function updateCharts() {
    if (revenueChartRef.value) {
      if (!revenueChart) revenueChart = echarts.init(revenueChartRef.value)
      const data = dailyRevenue.value
      revenueChart.setOption({
        backgroundColor: 'transparent',
        textStyle: { color: chartTextColor },
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: data.map((d) => d.reportDay),
          axisTick: { alignWithLabel: true },
          axisLabel: { color: chartTextColor },
          axisLine: { lineStyle: { color: chartAxisLineColor } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: chartTextColor },
          splitLine: { lineStyle: { color: chartGridLineColor } },
        },
        series: [
          {
            name: 'Doanh thu',
            type: 'line',
            smooth: true,
            data: data.map((d) => d.totalRevenue),
            itemStyle: { color: '#e84a4a' },
            lineStyle: { color: '#e84a4a' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(232, 74, 74, 0.32)' },
                { offset: 1, color: 'rgba(232, 74, 74, 0)' },
              ]),
            },
          },
        ],
      })
    }
    if (brandChartRef.value) {
      if (!brandChart) brandChart = echarts.init(brandChartRef.value)
      const data = (summary.value.brandRevenueDistribution || []).slice(0, 6)
      brandChart.setOption({
        backgroundColor: 'transparent',
        color: ['#e84a4a', '#ff6b6b', '#f97316', '#22c55e', '#3b82f6', '#a855f7'],
        textStyle: { color: chartTextColor },
        tooltip: { trigger: 'item' },
        legend: { bottom: 0, textStyle: { color: chartTextColor } },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: data.map((d) => ({ name: d.brandName || 'Khác', value: d.revenue })),
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
            },
          },
        ],
      })
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }
  function formatDateTime(iso: string) {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('vi-VN')
  }

  function handleResize() {
    revenueChart?.resize()
    brandChart?.resize()
  }
  onMounted(() => {
    loadData()
    window.addEventListener('resize', handleResize)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    revenueChart?.dispose()
    brandChart?.dispose()
  })
</script>
