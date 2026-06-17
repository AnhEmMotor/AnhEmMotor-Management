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

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        :class="[
          'p-4 rounded-lg shadow border-l-4',
          summary.isRevenueAlert ? 'bg-red-50 border-red-500' : 'bg-white border-blue-500',
        ]"
      >
        <div class="text-gray-500 text-sm">Doanh thu thực tế</div>
        <div class="text-2xl font-bold">{{ formatCurrency(summary.totalRevenue) }}</div>
        <div v-if="summary.isRevenueAlert" class="text-red-600 text-xs mt-1 font-medium"
          >⚠️ Cảnh báo: Thấp hơn 50% mục tiêu ngày</div
        >
      </div>

      <div class="p-4 rounded-lg shadow border-l-4 bg-white border-green-500">
        <div class="text-gray-500 text-sm">Lợi nhuận ròng</div>
        <div class="text-2xl font-bold">{{ formatCurrency(summary.netProfit) }}</div>
        <div class="text-green-600 text-xs mt-1">Tự động tính từ Doanh thu - Vốn - Chi phí</div>
      </div>

      <div
        :class="[
          'p-4 rounded-lg shadow border-l-4',
          summary.isPendingAlert ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-orange-500',
        ]"
      >
        <div class="text-gray-500 text-sm">Tiền đang treo (Pending)</div>
        <div class="text-2xl font-bold">{{ formatCurrency(summary.pendingAmount) }}</div>
        <div v-if="summary.isPendingAlert" class="text-yellow-600 text-xs mt-1 font-medium"
          >⚠️ Cảnh báo: Trả góp > 48h chưa giải ngân</div
        >
      </div>

      <div
        :class="[
          'p-4 rounded-lg shadow border-l-4',
          summary.isStockAlert ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-gray-500',
        ]"
      >
        <div class="text-gray-500 text-sm">Cảnh báo cần xử lý</div>
        <div class="text-2xl font-bold">{{ summary.alertsCount }}</div>
        <div v-if="summary.isStockAlert" class="text-yellow-600 text-xs mt-1 font-medium"
          >⚠️ Cảnh báo: Tồn kho xe < 2 chiếc</div
        >
      </div>
    </div>

    <!-- Khu vực Trung tâm: Biểu đồ và Tóm tắt tháng -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold mb-4">Biểu đồ doanh thu theo chu kỳ</h3>
        <div ref="revenueChartRef" class="h-64 w-full bg-gray-50 rounded"></div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold mb-4">Tóm tắt mục tiêu tháng</h3>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-gray-500">Đã đạt:</span>
            <span class="font-bold">{{ formatCurrency(summary.monthAchieved) }}</span>
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
        </div>
      </div>
    </div>

    <!-- Phân tích song song -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold mb-4">Phân tích nguồn doanh thu</h3>
        <div class="space-y-3">
          <div v-for="source in sources" :key="source.name" class="flex items-center gap-2">
            <span class="text-xs w-24">{{ source.name }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div class="bg-indigo-500 h-full" :style="{ width: source.percent + '%' }"></div>
            </div>
            <span class="text-xs font-bold">{{ source.percent }}%</span>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold mb-4">Hiệu suất Sale (Top Ranking)</h3>
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b text-gray-500">
              <th class="pb-2">Nhân viên</th>
              <th class="pb-2">Doanh số</th>
              <th class="pb-2">KPI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="staff in topStaff" :key="staff.employeeName" class="border-b last:border-0">
              <td class="py-2 font-medium">{{ staff.employeeName }}</td>
              <td class="py-2">{{ formatCurrency(staff.totalSales) }}</td>
              <td class="py-2">
                <span :class="['px-2 py-1 rounded-full text-xs', getKpiClass(staff.kpiStatus)]">
                  {{ staff.kpiStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dòng giao dịch thời gian thực -->
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="font-bold mb-4">Luồng nhật ký giao dịch (Real-time)</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b text-gray-500">
              <th class="pb-2">Mốc giờ</th>
              <th class="pb-2">Khách hàng</th>
              <th class="pb-2">Sản phẩm</th>
              <th class="pb-2">Số tiền</th>
              <th class="pb-2">Sale phụ trách</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx.timestamp"
              class="border-b last:border-0 hover:bg-gray-50"
            >
              <td class="py-2 text-gray-400">{{ formatTime(tx.timestamp) }}</td>
              <td class="py-2 font-medium">{{ tx.customerName }}</td>
              <td class="py-2">{{ tx.productName }}</td>
              <td class="py-2 font-bold" :class="tx.isRevenue ? 'text-green-600' : 'text-red-600'">
                {{ tx.isRevenue ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
              </td>
              <td class="py-2">{{ tx.staffName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
  import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue'
  import { statisticsApi } from '@/infrastructure/api/statistics.api'
  import type * as Statistical from '@/types/api/statistical'
  import ReportPageHeader from '../components/ReportPageHeader.vue'
  import ReportPeriodSwitcher from '../components/ReportPeriodSwitcher.vue'

  const revenueChartRef = ref<HTMLElement | null>(null)
  const summary = ref<DashboardSummary>({
    totalRevenue: 0,
    netProfit: 0,
    pendingAmount: 0,
    alertsCount: 0,
    monthTarget: 0,
    monthAchieved: 0,
    monthRemaining: 0,
    monthForecast: 0,
    isRevenueAlert: false,
    isPendingAlert: false,
    isStockAlert: false,
  })
  const topStaff = ref<StaffPerformance[]>([])
  const transactions = ref<TransactionLog[]>([])

  const sources = [
    { name: 'Xe máy', percent: 70 },
    { name: 'Phụ tùng', percent: 15 },
    { name: 'Phụ kiện', percent: 10 },
    { name: 'Dịch vụ GTGT', percent: 5 },
  ]

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
    if (value == null) return '0đ'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  function getKpiClass(status: string) {
    switch (status) {
      case 'Vượt KPI':
        return 'bg-green-100 text-green-700'
      case 'Đạt':
        return 'bg-blue-100 text-blue-700'
      case 'Cần cải thiện':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
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
