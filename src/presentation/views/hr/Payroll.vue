<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Bảng Lương</h1>
          <p class="text-gray-500 mt-1">Tổng hợp thu nhập và phê duyệt thanh toán định kỳ</p>
        </div>
        <div class="flex gap-3">
          <select v-model="selectedMonth" class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none shadow-sm">
            <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
          </select>
          <button
            @click="handleApproveAll"
            class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <font-awesome-icon icon="check-double" />
            <span>Duyệt chi tất cả</span>
          </button>
        </div>
      </div>

      <!-- Tổng hợp lương (Mockup logic aggregated) -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="p-4 border-b border-gray-50 bg-gray-50/50">
          <h2 class="font-bold text-gray-800">Bảng lương tổng hợp</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nhân viên</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Lương cứng</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Tạm tính (P)</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Xác nhận (C)</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Thực nhận (C + Base)</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Đã chi (Paid)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-for="p in aggregatedPayrolls" :key="p.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{ p.fullName }}</div>
                  <div class="text-xs text-gray-500">{{ p.jobTitle }}</div>
                </td>
                <td class="px-6 py-4 text-right text-gray-600">{{ formatCurrency(p.baseSalary) }}</td>
                <td class="px-6 py-4 text-right text-amber-600 font-medium">{{ formatCurrency(p.pendingCommission) }}</td>
                <td class="px-6 py-4 text-right text-blue-600 font-medium">{{ formatCurrency(p.confirmedCommission) }}</td>
                <td class="px-6 py-4 text-right font-bold text-gray-900">{{ formatCurrency(p.totalActualReceived) }}</td>
                <td class="px-6 py-4 text-right">
                  <span v-if="p.paidCommission > 0" class="text-green-600 font-bold">{{ formatCurrency(p.paidCommission) }}</span>
                  <span v-else class="text-gray-400 italic">Chưa chi</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lịch sử hoa hồng chi tiết (Real Data from API) -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 class="font-bold text-gray-800">Lịch sử hoa hồng chi tiết</h2>
          <span class="text-xs text-gray-500">Dữ liệu được tính toán tự động từ đơn hàng hoàn tất</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ngày nhận</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nhân viên</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Đơn hàng</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Chi tiết tính toán</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Số tiền</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-if="loading" v-for="i in 3" :key="i">
                <td colspan="5" class="px-6 py-4 text-center text-gray-400 italic">Đang tải dữ liệu hoa hồng...</td>
              </tr>
              <tr v-else-if="commissions.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-400">Chưa có bản ghi hoa hồng nào.</td>
              </tr>
              <tr v-else v-for="record in commissions" :key="record.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-500">{{ formatDate(record.dateEarned) }}</td>
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{ record.employeeProfile?.fullName }}</div>
                  <div class="text-xs text-gray-500">{{ record.employeeProfile?.jobTitle }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-700">Đơn #{{ record.outputId }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-xs text-gray-600 whitespace-pre-line">{{ record.note }}</div>
                </td>
                <td class="px-6 py-4 font-bold text-green-600">+ {{ formatCurrency(record.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useHRStore } from '@stores/hr.store'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const toast = useToast()

const hrStore = useHRStore()
const { commissions, loading, employees } = storeToRefs(hrStore)
const selectedMonth = ref(new Date().getMonth() + 1)

const aggregatedPayrolls = ref([])

const fetchPayroll = async () => {
  try {
    const data = await hrStore.fetchPayrollSummary(selectedMonth.value, new Date().getFullYear())
    aggregatedPayrolls.value = data
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  hrStore.fetchCommissions()
  fetchPayroll()
})

watch(selectedMonth, fetchPayroll)

const handleApproveAll = async () => {
  if (!confirm(`Bạn có chắc chắn muốn duyệt chi tất cả hoa hồng trong tháng ${selectedMonth.value}?`)) return
  try {
    await hrStore.approvePayroll({
      month: selectedMonth.value,
      year: new Date().getFullYear()
    })
    toast.success('Đã duyệt chi thành công!')
    fetchPayroll()
    hrStore.fetchCommissions()
  } catch (err) {
    toast.error('Lỗi khi duyệt chi: ' + err.message)
  }
}
</script>
