<template>
  <div class="pnl-report p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">📈 Báo cáo Tài chính P&L</h1>
      <div class="flex gap-3">
        <input
          type="month"
          v-model="selectedMonth"
          class="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="loadReport"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Truy xuất dữ liệu
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 border-b text-gray-500">
          <tr>
            <th class="p-4">Hạng mục chi tiết</th>
            <th class="p-4 text-right">Giá trị (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Thu nhập -->
          <tr class="bg-green-50 font-bold text-green-800">
            <td class="p-4">TỔNG THU NHẬP</td>
            <td class="p-4 text-right">{{ formatCurrency(report.totalRevenue) }}</td>
          </tr>
          <tr class="border-b">
            <td class="p-4 pl-8 text-gray-600">Doanh thu từ đơn hàng hoàn tất</td>
            <td class="p-4 text-right">{{ formatCurrency(report.totalRevenue) }}</td>
          </tr>

          <!-- Giá vốn -->
          <tr class="bg-red-50 font-bold text-red-800">
            <td class="p-4">GIÁ VỐN HÀNG BÁN (COGS)</td>
            <td class="p-4 text-right">{{ formatCurrency(report.totalCostOfGoodsSold) }}</td>
          </tr>

          <!-- Lợi nhuận gộp -->
          <tr class="bg-blue-50 font-extrabold text-blue-900 border-y-2 border-blue-200">
            <td class="p-4 text-lg">LỢI NHUẬN GỘP</td>
            <td class="p-4 text-right text-lg">{{ formatCurrency(report.grossProfit) }}</td>
          </tr>

          <!-- Chi phí vận hành -->
          <tr class="bg-orange-50 font-bold text-orange-800">
            <td class="p-4">CHI PHÍ VẬN HÀNH</td>
            <td class="p-4 text-right">{{ formatCurrency(report.totalOperatingExpenses) }}</td>
          </tr>
          <tr
            v-for="exp in report.expenseDetails"
            :key="exp.category"
            class="border-b last:border-0"
          >
            <td class="p-4 pl-8 text-gray-600">{{ exp.category }}</td>
            <td class="p-4 text-right text-red-500">{{ formatCurrency(exp.amount) }}</td>
          </tr>

          <!-- Lợi nhuận ròng -->
          <tr class="bg-indigo-100 font-extrabold text-indigo-900 text-lg">
            <td class="p-4">LỢI NHUẬN RÒNG CUỐI CÙNG</td>
            <td class="p-4 text-right">{{ formatCurrency(report.netProfit) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 text-right text-xs text-gray-400">
      * Dữ liệu được tính toán tự động từ hệ thống và lưu trữ tại Redis Cache.
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { AnalyticsService } from '@/services/analytics.service'
  import type { PnlReport } from '@/services/analytics.types'

  const selectedMonth = ref(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const report = ref<PnlReport>({
    period: '',
    totalRevenue: 0,
    totalCostOfGoodsSold: 0,
    totalOperatingExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    expenseDetails: [],
  })

  async function loadReport() {
    const [year, month] = selectedMonth.value.split('-').map(Number)
    report.value = await AnalyticsService.getPnlReport(month, year)
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  onMounted(loadReport)
</script>
