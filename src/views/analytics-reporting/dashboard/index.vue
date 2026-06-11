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
      <!-- Card 1 -->
      <div
        :class="[
          'p-4 rounded-lg shadow border-l-4 flex flex-col justify-between',
          summary.isRevenueAlert ? 'bg-red-50 border-red-500' : 'bg-white border-blue-500',
        ]"
      >
        <div>
          <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider"
            >DOANH THU THỰC TẾ</div
          >
          <div class="text-3xl font-bold my-2">{{ formatCurrency(summary.totalRevenue) }}</div>
        </div>
        <div>
          <div
            class="text-sm font-medium"
            :class="summary.revenueVsYesterdayPercentage >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ summary.revenueVsYesterdayPercentage >= 0 ? '▲ +' : '▼ '
            }}{{ summary.revenueVsYesterdayPercentage }}% so với hôm qua
          </div>
          <div class="text-sm text-gray-500 mt-1"
            >Mục tiêu ngày: {{ formatCurrency(summary.dailyTarget) }}</div
          >
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2 flex items-center gap-2">
            <div
              class="bg-blue-600 h-2 rounded-full"
              :style="{
                width:
                  Math.min((summary.totalRevenue / (summary.dailyTarget || 1)) * 100, 100) + '%',
              }"
            ></div>
            <span class="text-xs font-bold"
              >{{ Math.round((summary.totalRevenue / (summary.dailyTarget || 1)) * 100) }}%</span
            >
          </div>
          <div
            v-if="summary.isRevenueAlert"
            class="text-red-600 text-xs mt-2 font-bold flex items-center gap-1"
          >
            <i class="ri-alert-fill"></i> Cảnh báo: Thấp hơn 50% mục tiêu lúc 15h
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div
        class="p-4 rounded-lg shadow border-l-4 bg-white border-green-500 flex flex-col justify-between"
      >
        <div>
          <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider"
            >LỢI NHUẬN RÒNG</div
          >
          <div class="text-3xl font-bold my-2">{{ formatCurrency(summary.netProfit) }}</div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700"
            >Biên lợi nhuận: {{ summary.profitMargin }}%</div
          >
          <div
            class="text-sm font-medium mt-1"
            :class="summary.profitVsYesterdayPercentage >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ summary.profitVsYesterdayPercentage >= 0 ? '▲ +' : '▼ '
            }}{{ summary.profitVsYesterdayPercentage }}% so với hôm qua
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div
        :class="[
          'p-4 rounded-lg shadow border-l-4 flex flex-col justify-between',
          summary.isPendingAlert ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-orange-500',
        ]"
      >
        <div>
          <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider"
            >TIỀN ĐANG TREO</div
          >
          <div class="text-3xl font-bold my-2">{{ formatCurrency(summary.pendingAmount) }}</div>
        </div>
        <div class="text-sm text-gray-600 space-y-1">
          <div class="flex justify-between items-center">
            <span>• Cọc giữ xe:</span>
            <span class="font-medium">{{ formatCurrency(summary.depositAmount) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>• Chờ NH giải ngân trả góp:</span>
            <span class="font-medium">{{ formatCurrency(summary.loanWaitAmount) }}</span>
          </div>
          <div
            v-if="summary.isPendingAlert"
            class="text-yellow-600 text-xs mt-2 font-bold flex items-center gap-1"
          >
            <i class="ri-error-warning-fill"></i> Cảnh báo: Trả góp > 48h chưa giải ngân
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div
        class="p-4 rounded-lg shadow border-l-4 bg-white border-gray-500 flex flex-col justify-between"
      >
        <div>
          <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider">CẦN XỬ LÝ</div>
        </div>
        <div class="mt-2 space-y-2">
          <div
            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition"
          >
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span class="text-sm font-medium">{{ summary.newComplaintsCount }} Khiếu nại mới</span>
          </div>
          <div
            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition"
          >
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span class="text-sm font-medium"
              >{{ summary.delayedLoansCount }} NH chậm giải ngân</span
            >
          </div>
          <div
            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition"
          >
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span class="text-sm font-medium"
              >{{ summary.lowStockVehiclesCount }} Xe sắp hết hàng</span
            >
          </div>
          <div
            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition"
          >
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-sm font-medium"
              >{{ summary.missedAppointmentsCount }} Lịch hẹn bị bỏ lỡ</span
            >
          </div>
        </div>
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
      <!-- Nguồn doanh thu -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold uppercase tracking-wider text-sm text-gray-700"
            >NGUỒN DOANH THU — Hôm nay</h3
          >
        </div>
        <div class="space-y-4">
          <div v-for="source in sources" :key="source.name" class="flex items-center gap-3">
            <span class="text-sm font-medium w-28">{{ source.name }}</span>
            <div
              class="flex-1 bg-gray-100 rounded-sm h-5 overflow-hidden flex items-center relative"
            >
              <div
                class="bg-gray-800 h-full transition-all duration-500"
                :style="{ width: source.percent + '%' }"
              ></div>
              <div
                class="bg-gray-300 h-full transition-all duration-500 opacity-50"
                :style="{ width: 100 - source.percent + '%' }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-24 text-right">{{
              formatCurrency(source.amount).replace('₫', '')
            }}</span>
          </div>
        </div>
        <div class="mt-4 text-center">
          <a href="#" class="text-blue-600 text-sm hover:underline">[Xem chi tiết từng loại]</a>
        </div>
      </div>

      <!-- Hiệu suất nhân viên -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold uppercase tracking-wider text-sm text-gray-700"
            >HIỆU SUẤT SALE — Tháng này</h3
          >
        </div>
        <div class="space-y-4">
          <div
            v-for="(staff, index) in topStaff"
            :key="staff.employeeName"
            class="flex items-center gap-3"
          >
            <span class="text-sm font-medium w-28 truncate"
              >#{{ index + 1 }} {{ staff.employeeName }}</span
            >
            <div
              class="flex-1 bg-gray-100 rounded-sm h-5 overflow-hidden flex items-center relative"
            >
              <div
                class="bg-gray-800 h-full transition-all duration-500"
                :style="{
                  width: Math.min((staff.totalSales / (staff.targetSales || 1)) * 100, 100) + '%',
                }"
              ></div>
              <div
                class="bg-gray-300 h-full transition-all duration-500 opacity-50"
                :style="{
                  width:
                    Math.max(100 - (staff.totalSales / (staff.targetSales || 1)) * 100, 0) + '%',
                }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-24 text-right">{{
              formatCurrency(staff.totalSales).replace('₫', '')
            }}</span>
            <span class="text-xs font-bold w-24 text-right flex items-center justify-end gap-1">
              <span v-if="staff.isTopSeller">⭐ Vượt KPI</span>
              <span v-else-if="staff.kpiStatus === 'Đạt'">✓ Đạt</span>
              <span v-else class="text-yellow-600">⚠️ Cần cải thiện</span>
            </span>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t">
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold w-28">Tổng team:</span>
            <div class="flex-1 flex flex-col gap-1">
              <div class="text-sm font-medium"
                >{{ formatCurrency(teamSales) }} / {{ formatCurrency(teamTarget) }}</div
              >
              <div
                class="w-full bg-gray-100 rounded-sm h-5 overflow-hidden flex items-center relative"
              >
                <div
                  class="bg-gray-800 h-full transition-all duration-500"
                  :style="{ width: Math.min((teamSales / (teamTarget || 1)) * 100, 100) + '%' }"
                ></div>
                <div
                  class="bg-gray-300 h-full transition-all duration-500 opacity-50"
                  :style="{ width: Math.max(100 - (teamSales / (teamTarget || 1)) * 100, 0) + '%' }"
                ></div>
                <span class="absolute right-2 text-xs font-bold text-gray-500 mix-blend-difference"
                  >{{ Math.round((teamSales / (teamTarget || 1)) * 100) }}% mục tiêu</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dòng giao dịch thời gian thực -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold uppercase tracking-wider text-sm text-gray-700">GIAO DỊCH GẦN NHẤT</h3>
        <a href="#" class="text-blue-600 text-sm hover:underline">[Xem tất cả]</a>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx.timestamp"
              class="border-b last:border-0 hover:bg-gray-50"
            >
              <td class="py-3 text-gray-500 border-r pr-4 w-20 text-center">{{
                formatTime(tx.timestamp)
              }}</td>
              <td class="py-3 px-4 font-medium">{{ tx.customerName }} — {{ tx.productName }}</td>
              <td
                class="py-3 px-4 font-bold border-l border-r w-32"
                :class="tx.isRevenue ? 'text-green-600' : 'text-red-600'"
              >
                {{ tx.isRevenue ? '+' : '-' }}{{ formatCurrencyShort(tx.amount) }}
                <span v-if="tx.status === 'Pending'" class="ml-1" title="Tiền đang treo">⏳</span>
                <span v-else-if="tx.status === 'Refund'" class="ml-1 text-red-500" title="Cần chú ý"
                  >🔴</span
                >
              </td>
              <td class="py-3 px-4 w-40 text-gray-700">{{ tx.staffName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 text-xs text-gray-500 flex gap-4">
        <div class="flex items-center gap-1"><span>⏳</span> — Tiền đang treo, chưa chắc chắn</div>
        <div class="flex items-center gap-1"
          ><span class="text-red-500">🔴</span> — Hoàn tiền / giao dịch âm — cần chú ý</div
        >
        <div class="flex items-center gap-1"
          ><span class="text-green-600 font-bold">Màu xanh</span> — thu vào,
          <span class="text-red-600 font-bold">màu đỏ</span> — chi ra hoặc hoàn trả</div
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import * as echarts from 'echarts'
  import { fetchEventSource } from '@microsoft/fetch-event-source'
  import { AnalyticsService } from '@/services/analytics.service'
  import type {
    DashboardSummary,
    StaffPerformance,
    TransactionLog,
  } from '@/services/analytics.types'
  import { useUserStore } from '@/application/store/user'

  const currentPeriod = ref('today')
  const customStart = ref('')
  const customEnd = ref('')
  const revenueChartRef = ref<HTMLElement | null>(null)
  const summary = ref<DashboardSummary>({
    totalRevenue: 0,
    revenueVsYesterdayPercentage: 0,
    dailyTarget: 0,
    netProfit: 0,
    profitMargin: 0,
    profitVsYesterdayPercentage: 0,
    pendingAmount: 0,
    depositAmount: 0,
    loanWaitAmount: 0,
    alertsCount: 0,
    newComplaintsCount: 0,
    delayedLoansCount: 0,
    lowStockVehiclesCount: 0,
    missedAppointmentsCount: 0,
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

  const teamSales = computed(() => topStaff.value.reduce((acc, curr) => acc + curr.totalSales, 0))
  const teamTarget = computed(() =>
    topStaff.value.reduce((acc, curr) => acc + (curr.targetSales || 1), 0),
  )

  import type { RevenueSource } from '@/services/analytics.types'
  const sources = ref<RevenueSource[]>([
    { name: 'Xe máy', percent: 79.5, amount: 68000000 },
    { name: 'Phụ tùng', percent: 14.0, amount: 12000000 },
    { name: 'Phụ kiện', percent: 4.1, amount: 3500000 },
    { name: 'Dịch vụ GTGT', percent: 2.3, amount: 2000000 },
  ])

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
    if (value == null) return '0đ'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  function formatCurrencyShort(value: number) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(0) + 'tr'
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k'
    }
    return value + 'đ'
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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
