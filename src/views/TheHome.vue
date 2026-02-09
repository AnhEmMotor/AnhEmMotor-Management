<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-2 text-gray-800">Xin chào, Admin!</h1>
    <p id="greeting" class="text-gray-500 mb-6">
      Chúc bạn một buổi sáng tốt lành! Đây là báo cáo tổng quan.
    </p>
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Tổng Doanh Thu (Tháng)" stat="1.25 tỷ" :improvement="12" color="red" />
        <StatsCard title="Lợi Nhuận (Tháng)" stat="280 triệu" :improvement="8.5" color="green" />
        <StatsCard title="Đơn Hàng Mới" stat="32" :improvement="-5" color="yellow" />
        <StatsCard title="Khách Hàng Mới" stat="15" :improvement="-20" color="purple" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            Doanh Thu &amp; Lợi Nhuận (7 Ngày)
          </h3>
          <div class="w-full h-full">
            <RevenueChart7day :revenue-data="revenueData" />
          </div>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Tỷ Lệ Trạng Thái Đơn Hàng</h3>
          <div class="w-full h-full">
            <PieChartFrame :order-data="orderStatusData" />
          </div>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl shadow-md lg:col-span-2 h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Doanh Thu và Lợi Nhuận (3 Tháng)</h3>
          <div class="w-full h-full">
            <ChartFrame3month :revenue-data="monthlyComparisonData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import ChartFrame3month from '@/components/report/ChartFrame3month.vue'
import RevenueChart7day from '@/components/report/RevenueChart7day.vue'
import PieChartFrame from '@/components/report/OrderChart.vue'
import StatsCard from '@/components/ui/ReportStatsCard.vue'

const revenueData = [
  { date: '2025-09-15', revenue: 250, profit: 90 },
  { date: '2025-09-16', revenue: 280, profit: 110 },
  { date: '2025-09-17', revenue: 220, profit: 80 },
  { date: '2025-09-18', revenue: 350, profit: 150 },
  { date: '2025-09-19', revenue: 410, profit: 180 },
  { date: '2025-09-20', revenue: 380, profit: 165 },
  { date: '2025-09-21', revenue: 450, profit: 200 },
]

const orderStatusData = [
  { status: 'Đã giao', value: 120, color: '#e53e3e' },
  { status: 'Đang giao', value: 35, color: '#f59e0b' },
  { status: 'Đã huỷ', value: 15, color: '#4b5563' },
  { status: 'Chờ thanh toán', value: 25, color: '#3b82f6' },
]
const monthlyComparisonData = [
  { month: 'Tháng 7', revenue: 1100, profit: 250 },
  { month: 'Tháng 8', revenue: 1250, profit: 280 },
  { month: 'Tháng 9', revenue: 1450, profit: 340 },
]
</script>
