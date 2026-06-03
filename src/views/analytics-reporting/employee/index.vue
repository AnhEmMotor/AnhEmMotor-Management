<template>
  <div class="employee-performance p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">👤 Thống kê Hiệu suất & Hoa hồng Nhân viên</h1>
      <div class="flex gap-3">
        <input type="date" v-model="start" class="border rounded-lg px-3 py-2 outline-none" />
        <input type="date" v-model="end" class="border rounded-lg px-3 py-2 outline-none" />
        <button
          @click="loadPerformance"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Lọc dữ liệu
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 border-b text-gray-500">
          <tr>
            <th class="p-4">Nhân viên</th>
            <th class="p-4">Vai trò</th>
            <th class="p-4 text-right">Doanh số mang về</th>
            <th class="p-4 text-right">Hoa hồng chi trả</th>
            <th class="p-4 text-center">Trạng thái KPI</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="staff in performance"
            :key="staff.employeeName"
            class="border-b last:border-0 hover:bg-gray-50"
          >
            <td class="p-4 font-medium">{{ staff.employeeName }}</td>
            <td class="p-4 text-gray-600">{{ staff.role }}</td>
            <td class="p-4 text-right font-bold">{{ formatCurrency(staff.totalSales) }}</td>
            <td class="p-4 text-right text-blue-600 font-bold">{{
              formatCurrency(staff.commissionPaid)
            }}</td>
            <td class="p-4 text-center">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getKpiClass(staff.kpiStatus),
                ]"
              >
                {{ staff.kpiStatus }}
              </span>
            </td>
          </tr>
          <tr v-if="performance.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-400"
              >Không có dữ liệu hiệu suất cho khoảng thời gian này</td
            >
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { AnalyticsService } from '@/services/analytics.service'
  import type { StaffPerformance } from '@/services/analytics.types'

  const start = ref(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  )
  const end = ref(new Date().toISOString().split('T')[0])
  const performance = ref<StaffPerformance[]>([])

  async function loadPerformance() {
    performance.value = await AnalyticsService.getStaffPerformance(start.value, end.value)
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
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

  onMounted(loadPerformance)
</script>
