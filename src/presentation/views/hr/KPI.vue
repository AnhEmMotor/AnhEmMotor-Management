<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Quản lý KPI & Hiệu suất</h1>
        <p class="text-gray-500 mt-1">Theo dõi tiến độ doanh số và hiệu quả làm việc của đội ngũ</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="emp in kpiData" :key="emp.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
              {{ emp.name.charAt(0) }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ emp.name }}</h3>
              <p class="text-sm text-gray-500">{{ emp.role }}</p>
            </div>
            <div class="ml-auto text-right">
              <div class="text-sm font-medium" :class="emp.percent >= 100 ? 'text-green-600' : 'text-orange-600'">
                {{ emp.percent }}% Hoàn thành
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div v-for="kpi in emp.metrics" :key="kpi.label">
              <div class="flex justify-between text-sm mb-1.5">
                <span class="text-gray-600 font-medium">{{ kpi.label }}</span>
                <span class="text-gray-900 font-bold">
                  {{ kpi.label.includes('Doanh số') ? formatCurrency(kpi.actual) : kpi.actual }} 
                  / 
                  {{ kpi.label.includes('Doanh số') ? formatCurrency(kpi.target) : kpi.target }}
                </span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000" 
                  :class="getProgressColor(kpi.actual / kpi.target)"
                  :style="{ width: `${Math.min((kpi.actual / kpi.target) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
            <div class="text-xs text-gray-400 italic">Cập nhật: Vừa xong</div>
            <button class="text-red-600 text-sm font-medium hover:underline">Chi tiết báo cáo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useHRStore } from '@stores/hr.store'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/currency'

const hrStore = useHRStore()
const { commissions, employees } = storeToRefs(hrStore)

onMounted(() => {
  hrStore.fetchEmployees()
  hrStore.fetchCommissions()
})

const kpiData = computed(() => {
  return employees.value.map(emp => {
    const empCommissions = commissions.value
      .filter(c => c.employeeProfileId === emp.id)
      .reduce((sum, c) => sum + c.amount, 0)
    
    // Giả định mục tiêu doanh số 50tr
    const target = 50000000
    const percent = Math.min(Math.round((empCommissions / target) * 100), 120)

    return {
      id: emp.id,
      name: emp.fullName,
      role: emp.jobTitle,
      percent: percent,
      metrics: [
        { label: 'Doanh số hoa hồng thực tế', actual: empCommissions, target: target },
        { label: 'Tỷ lệ tăng trưởng', actual: percent, target: 100 },
      ]
    }
  })
})

const getProgressColor = (ratio) => {
  if (ratio >= 1) return 'bg-green-500'
  if (ratio >= 0.7) return 'bg-blue-500'
  return 'bg-orange-500'
}
</script>
