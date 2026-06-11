<template>
  <div class="ecommerce">
    <!-- Bộ Điều Hướng Chu Kỳ -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">📊 Tổng quan kinh doanh</h1>
      <div class="flex justify-end gap-2">
        <ElButton
          @click="setPeriod('today')"
          :type="currentPeriod === 'today' ? 'primary' : 'default'"
          >Hôm nay</ElButton
        >
        <ElButton
          @click="setPeriod('month')"
          :type="currentPeriod === 'month' ? 'primary' : 'default'"
          >Tháng này</ElButton
        >
        <ElButton
          @click="setPeriod('year')"
          :type="currentPeriod === 'year' ? 'primary' : 'default'"
          >Năm này</ElButton
        >
        <ElDatePicker
          v-model="customStart"
          type="date"
          placeholder="Từ ngày"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="setPeriod('custom')"
          style="width: 140px"
        />
        <ElDatePicker
          v-model="customEnd"
          type="date"
          placeholder="Đến ngày"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="setPeriod('custom')"
          style="width: 140px"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <ElRow :gutter="20" class="mb-5">
      <!-- Card 1: Doanh thu thực tế -->
      <ElCol :sm="24" :md="12" :lg="6">
        <div
          :class="[
            'art-card p-5 h-full border-l-4 flex flex-col justify-between',
            summary.isRevenueAlert ? 'border-red-500' : 'border-blue-500',
          ]"
        >
          <div>
            <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2"
              >DOANH THU THỰC TẾ</div
            >
            <div class="text-3xl font-bold text-gray-800">{{
              formatCurrency(summary.totalRevenue)
            }}</div>
          </div>
          <div class="mt-4">
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
            <div
              class="w-full bg-gray-200 rounded-full h-2 mt-2 flex items-center relative overflow-hidden"
            >
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                :style="{
                  width:
                    Math.min((summary.totalRevenue / (summary.dailyTarget || 1)) * 100, 100) + '%',
                }"
              ></div>
            </div>
            <div class="text-right text-xs font-bold text-gray-600 mt-1"
              >{{ Math.round((summary.totalRevenue / (summary.dailyTarget || 1)) * 100) }}%</div
            >
            <div
              v-if="summary.isRevenueAlert"
              class="text-red-600 text-xs mt-2 font-bold flex items-center gap-1"
            >
              <i class="ri-alert-fill"></i> Cảnh báo: Thấp hơn 50% mục tiêu
            </div>
          </div>
        </div>
      </ElCol>

      <!-- Card 2: Lợi nhuận ròng -->
      <ElCol :sm="24" :md="12" :lg="6">
        <div class="art-card p-5 h-full border-l-4 border-green-500 flex flex-col justify-between">
          <div>
            <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2"
              >LỢI NHUẬN RÒNG</div
            >
            <div class="text-3xl font-bold text-gray-800">{{
              formatCurrency(summary.netProfit)
            }}</div>
          </div>
          <div class="mt-4">
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
      </ElCol>

      <!-- Card 3: Tiền đang treo -->
      <ElCol :sm="24" :md="12" :lg="6">
        <div
          :class="[
            'art-card p-5 h-full border-l-4 flex flex-col justify-between',
            summary.isPendingAlert ? 'border-yellow-500 bg-yellow-50' : 'border-orange-500',
          ]"
        >
          <div>
            <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2"
              >TIỀN ĐANG TREO</div
            >
            <div class="text-3xl font-bold text-gray-800">{{
              formatCurrency(summary.pendingAmount)
            }}</div>
          </div>
          <div class="mt-4 text-sm text-gray-600 space-y-2">
            <div class="flex justify-between items-center border-b pb-1">
              <span>Cọc giữ xe:</span>
              <span class="font-medium text-gray-800">{{
                formatCurrency(summary.depositAmount)
              }}</span>
            </div>
            <div class="flex justify-between items-center pt-1">
              <span>Chờ giải ngân:</span>
              <span class="font-medium text-gray-800">{{
                formatCurrency(summary.loanWaitAmount)
              }}</span>
            </div>
            <div
              v-if="summary.isPendingAlert"
              class="text-yellow-600 text-xs mt-2 font-bold flex items-center gap-1"
            >
              <i class="ri-error-warning-fill"></i> > 48h chưa giải ngân
            </div>
          </div>
        </div>
      </ElCol>

      <!-- Card 4: Cần xử lý -->
      <ElCol :sm="24" :md="12" :lg="6">
        <div class="art-card p-5 h-full border-l-4 border-gray-500 flex flex-col justify-between">
          <div>
            <div class="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2"
              >CẦN XỬ LÝ</div
            >
          </div>
          <div class="mt-2 space-y-3">
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition"
            >
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span class="text-sm text-gray-700">Khiếu nại mới</span>
              </div>
              <span class="font-bold">{{ summary.newComplaintsCount }}</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition"
            >
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <span class="text-sm text-gray-700">NH chậm giải ngân</span>
              </div>
              <span class="font-bold">{{ summary.delayedLoansCount }}</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition"
            >
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <span class="text-sm text-gray-700">Xe sắp hết hàng</span>
              </div>
              <span class="font-bold">{{ summary.lowStockVehiclesCount }}</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition"
            >
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span class="text-sm text-gray-700">Lịch hẹn bỏ lỡ</span>
              </div>
              <span class="font-bold">{{ summary.missedAppointmentsCount }}</span>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- Khu vực Trung tâm: Biểu đồ và Tóm tắt tháng -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :lg="16">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-4">
            <h3 class="font-bold text-gray-800">Biểu đồ doanh thu theo chu kỳ</h3>
          </div>
          <div ref="revenueChartRef" class="h-64 w-full"></div>
        </div>
      </ElCol>
      <ElCol :sm="24" :lg="8">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-4">
            <h3 class="font-bold text-gray-800">Tóm tắt mục tiêu tháng</h3>
          </div>
          <div class="space-y-5 mt-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Đã đạt:</span>
              <span class="font-bold text-lg text-gray-800">{{
                formatCurrency(summary.monthAchieved)
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Cần thêm:</span>
              <span class="font-bold text-lg text-red-500">{{
                formatCurrency(summary.monthRemaining)
              }}</span>
            </div>
            <div class="flex justify-between items-center border-t pt-4">
              <span class="font-medium text-gray-700">Dự báo cuối tháng:</span>
              <span class="font-bold text-xl text-blue-600">{{
                formatCurrency(summary.monthForecast)
              }}</span>
            </div>
            <div>
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tiến độ tháng</span>
                <span
                  >{{
                    Math.round((summary.monthAchieved / (summary.monthTarget || 1)) * 100)
                  }}%</span
                >
              </div>
              <ElProgress
                :percentage="Math.round((summary.monthAchieved / (summary.monthTarget || 1)) * 100)"
                :show-text="false"
              />
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- Phân tích song song -->
    <ElRow :gutter="20" class="mb-5">
      <!-- Nguồn doanh thu -->
      <ElCol :sm="24" :lg="12">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-6">
            <h3 class="font-bold uppercase tracking-wider text-sm text-gray-700"
              >NGUỒN DOANH THU — Hôm nay</h3
            >
          </div>
          <div class="space-y-5">
            <div v-for="source in sources" :key="source.name" class="flex items-center gap-4">
              <span class="text-sm font-medium w-28 text-gray-700">{{ source.name }}</span>
              <div class="flex-1">
                <ElProgress
                  :percentage="source.percent"
                  :stroke-width="12"
                  :show-text="false"
                  color="#409eff"
                />
              </div>
              <span class="text-sm font-medium text-gray-800 w-28 text-right">{{
                formatCurrency(source.amount).replace('₫', '')
              }}</span>
            </div>
          </div>
          <div class="mt-6 text-center">
            <ElButton type="primary" link>Xem chi tiết từng loại</ElButton>
          </div>
        </div>
      </ElCol>

      <!-- Hiệu suất nhân viên -->
      <ElCol :sm="24" :lg="12">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-6">
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
              <span class="text-sm font-medium w-32 truncate text-gray-700"
                >#{{ index + 1 }} {{ staff.employeeName }}</span
              >
              <div class="flex-1">
                <ElProgress
                  :percentage="Math.round((staff.totalSales / (staff.targetSales || 1)) * 100)"
                  :stroke-width="10"
                  :show-text="false"
                  color="#67c23a"
                />
              </div>
              <span class="text-sm text-gray-800 font-medium w-24 text-right">{{
                formatCurrencyShort(staff.totalSales)
              }}</span>
              <span class="text-xs font-bold w-24 text-right flex items-center justify-end">
                <ElTag v-if="staff.isTopSeller" type="success" size="small" effect="dark"
                  >⭐ Vượt</ElTag
                >
                <ElTag v-else-if="staff.kpiStatus === 'Đạt'" type="primary" size="small"
                  >✓ Đạt</ElTag
                >
                <ElTag v-else type="warning" size="small">⚠️ Cần cố</ElTag>
              </span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t">
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold w-32 text-gray-800">Tổng team:</span>
              <div class="flex-1">
                <ElProgress
                  :percentage="Math.round((teamSales / (teamTarget || 1)) * 100)"
                  :stroke-width="14"
                  color="#e6a23c"
                />
              </div>
            </div>
            <div class="text-right text-xs text-gray-500 mt-1">
              {{ formatCurrency(teamSales) }} / {{ formatCurrency(teamTarget) }}
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- Dòng giao dịch thời gian thực -->
    <ElRow :gutter="20">
      <ElCol :span="24">
        <div class="art-card p-5">
          <div class="art-card-header mb-4 flex justify-between items-center">
            <h3 class="font-bold uppercase tracking-wider text-sm text-gray-700"
              >GIAO DỊCH GẦN NHẤT</h3
            >
            <ElButton type="primary" link>Xem tất cả</ElButton>
          </div>
          <ElTable :data="transactions" stripe style="width: 100%" :max-height="400">
            <ElTableColumn prop="timestamp" label="Thời gian" width="120">
              <template #default="scope">
                <span class="text-gray-500">{{ formatTime(scope.row.timestamp) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Giao dịch">
              <template #default="scope">
                <span class="font-medium text-gray-800">{{ scope.row.customerName }}</span>
                <span class="text-gray-500 mx-2">—</span>
                <span class="text-gray-600">{{ scope.row.productName }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="amount" label="Số tiền" width="180">
              <template #default="scope">
                <div
                  class="font-bold flex items-center gap-2"
                  :class="scope.row.isRevenue ? 'text-green-600' : 'text-red-600'"
                >
                  {{ scope.row.isRevenue ? '+' : '-' }}{{ formatCurrency(scope.row.amount) }}
                  <span v-if="scope.row.status === 'Pending'" title="Tiền đang treo">⏳</span>
                  <span
                    v-else-if="scope.row.status === 'Refund'"
                    class="text-red-500"
                    title="Cần chú ý"
                    >🔴</span
                  >
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="staffName" label="Nhân viên" width="180" />
          </ElTable>

          <div class="mt-4 text-xs text-gray-500 flex gap-6 border-t pt-4">
            <div class="flex items-center gap-1"><span>⏳</span> Tiền đang treo</div>
            <div class="flex items-center gap-1"
              ><span class="text-red-500">🔴</span> Hoàn tiền / Cần chú ý</div
            >
            <div class="flex items-center gap-1"
              ><span class="text-green-600 font-bold">Màu xanh:</span> Thu vào</div
            >
            <div class="flex items-center gap-1"
              ><span class="text-red-600 font-bold">Màu đỏ:</span> Chi ra/Hoàn trả</div
            >
          </div>
        </div>
      </ElCol>
    </ElRow>
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
  import {
    ElRow,
    ElCol,
    ElButton,
    ElDatePicker,
    ElProgress,
    ElTable,
    ElTableColumn,
    ElTag,
  } from 'element-plus'

  defineOptions({ name: 'Ecommerce' })

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
