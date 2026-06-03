<template>
  <div class="analytics-dashboard p-6">
    <h1 class="text-2xl font-bold mb-6">📊 Dashboard Tổng Quan</h1>

    <!-- Bộ Điều Hướng Chu Kỳ -->
    <div class="flex justify-end gap-2 mb-6">
      <button
        @click="setPeriod('today')"
        :class="[
          'px-4 py-2 rounded',
          currentPeriod === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200',
        ]"
        >Hôm nay</button
      >
      <button
        @click="setPeriod('month')"
        :class="[
          'px-4 py-2 rounded',
          currentPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200',
        ]"
        >Tháng này</button
      >
      <button
        @click="setPeriod('year')"
        :class="[
          'px-4 py-2 rounded',
          currentPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200',
        ]"
        >Năm này</button
      >
      <input
        type="date"
        v-model="customStart"
        @change="setPeriod('custom')"
        class="border rounded px-2 py-1"
      />
      <input
        type="date"
        v-model="customEnd"
        @change="setPeriod('custom')"
        class="border rounded px-2 py-1"
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
          <div class="flex justify-between">
            <span class="text-gray-500">Cần thêm:</span>
            <span class="font-bold text-red-500">{{ formatCurrency(summary.monthRemaining) }}</span>
          </div>
          <div class="flex justify-between border-t pt-2">
            <span class="font-medium">Dự báo cuối tháng:</span>
            <span class="font-bold text-blue-600">{{ formatCurrency(summary.monthForecast) }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-blue-600 h-2.5 rounded-full"
              :style="{ width: (summary.monthAchieved / summary.monthTarget) * 100 + '%' }"
            ></div>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { fetchEventSource } from '@microsoft/fetch-event-source'
  import { AnalyticsService } from '@/services/analytics.service'
  import type {
    DashboardSummary,
    StaffPerformance,
    TransactionLog,
  } from '@/services/analytics.types'
  import { useUserStore } from '@/store/modules/user'

  const currentPeriod = ref('today')
  const customStart = ref('')
  const customEnd = ref('')
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
    let start, end
    if (currentPeriod.value === 'today') {
      start = new Date().toISOString().split('T')[0]
      end = start
    } else if (currentPeriod.value === 'month') {
      start = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0]
      end = new Date().toISOString().split('T')[0]
    } else if (currentPeriod.value === 'year') {
      start = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
      end = new Date().toISOString().split('T')[0]
    } else {
      start = customStart.value
      end = customEnd.value
    }

    summary.value = await AnalyticsService.getDashboardSummary(start, end)
    topStaff.value = await AnalyticsService.getStaffPerformance(start, end)
    transactions.value = await AnalyticsService.getRecentTransactions()

    updateChart()
  }

  function setPeriod(p: string) {
    currentPeriod.value = p
    loadData()
  }

  function updateChart() {
    if (!revenueChartRef.value) return

    const chart = echarts.init(revenueChartRef.value)

    // Giả lập dữ liệu cho biểu đồ dựa trên chu kỳ hiện tại
    const option = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data:
          currentPeriod.value === 'today'
            ? ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
            : currentPeriod.value === 'month'
              ? Array.from({ length: 30 }, (_, i) => `${i + 1}`)
              : ['Q1', 'Q2', 'Q3', 'Q4'],
        axisTick: { alignWithLabel: true },
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Doanh thu',
          type: 'line',
          smooth: true,
          data: Array.from(
            {
              length:
                currentPeriod.value === 'today' ? 7 : currentPeriod.value === 'month' ? 30 : 4,
            },
            () => Math.floor(Math.random() * 100000000) + 10000000,
          ),
          itemStyle: { color: '#2563eb' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(37, 99, 235, 0.3)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0)' },
            ]),
          },
        },
      ],
    }

    chart.setOption(option)
  }

  function formatCurrency(value: number) {
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
    updateChart()

    const userStore = useUserStore()
    const token = userStore.accessToken
    if (token) {
      fetchEventSource('/api/analytics/stream/transactions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        onmessage(msg) {
          if (!msg.data) return
          try {
            const newTx = JSON.parse(msg.data)
            transactions.value.unshift(newTx)
            if (transactions.value.length > 50) transactions.value.pop()
          } catch (e) {
            console.error('Failed to parse SSE message:', e)
          }
        },
        onerror() {
          console.error('SSE connection error for transaction stream')
        },
      })
    }
  })
</script>
